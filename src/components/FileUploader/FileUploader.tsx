import { useEffect, useMemo, useState } from 'react';
import {
  MultipleFileUpload,
  MultipleFileUploadMain,
  MultipleFileUploadStatus,
  type DropEvent,
} from '@patternfly/react-core';
import UploadIcon from '@patternfly/react-icons/dist/esm/icons/upload-icon';
import UploadStatusItem from './UploadStatusItem';
import StatusIcon from 'Pages/Repositories/AdminTaskTable/components/StatusIcon';
import {
  BATCH_SIZE,
  callAPI,
  getFileChecksumSHA256,
  MAX_CHUNK_SIZE,
  MAX_RETRY_COUNT,
  type Chunk,
  type FileInfo,
} from './helpers';
import { createUseStyles } from 'react-jss';
import { InnerScrollContainer } from '@patternfly/react-table';

const useStyles = createUseStyles({
  mainDropzone: {
    width: '625px',
    minHeight: '103px',
  },
  innerScrollerMaxHeight: {
    maxHeight: 'calc(80vh - 232px);;',
  },
  containerPadding: {
    padding: '16px',
  },
});

// TODO: Remove mock fail values
const CHANCE_OF_SUCCESS = 0.9;
const CHANCE_OF_HASHING_SUCCESS = 0.95;

export default function FileUploader() {
  const classes = useStyles();
  const [currentFiles, setCurrentFiles] = useState<Record<string, FileInfo>>({});
  const [isBatching, setIsBatching] = useState(false);
  const [isDropping, setIsDropping] = useState(false);

  const [fileCountGreaterThanZero, fileCount, completedCount, failedCount] = useMemo(
    () => [
      // showStatus
      !!Object.values(currentFiles).length,
      // fileCount
      Object.values(currentFiles).length,
      // completedCount
      Object.values(currentFiles).filter(({ completed }) => completed).length,
      // failedCount
      Object.values(currentFiles).filter(({ failed }) => failed).length,
    ],
    [currentFiles],
  );

  const statusIcon = useMemo(() => {
    if (failedCount) {
      return <StatusIcon status='failed' removeText />;
    }
    if (completedCount === fileCount) {
      return <StatusIcon status='completed' removeText />;
    }
    return <StatusIcon status='running' removeText />;
  }, [completedCount, fileCount, failedCount]);

  const updateItem = async (name: string) => {
    setIsBatching(true);

    if (currentFiles[name]) {
      const targetIndexes = new Set(
        currentFiles[name].chunks
          .map(({ queued }, index) => ({ index, queued }))
          .filter(({ queued }) => !queued)
          .map(({ index }) => index),
      );

      while (targetIndexes.size > 0 && !currentFiles[name]?.failed) {
        const itemsForBatch = [...targetIndexes].slice(0, BATCH_SIZE);
        const result = await Promise.all(
          itemsForBatch.map((targetIndex) => {
            if (!currentFiles[name]?.chunks[targetIndex]) return;
            const { start, end } = currentFiles[name].chunks[targetIndex];
            currentFiles[name].chunks[targetIndex].queued = true;
            setCurrentFiles((prev) => ({ ...prev, [name]: currentFiles[name] }));
            return callAPI(() => {
              currentFiles[name].chunks[targetIndex].completed = true;

              targetIndexes.delete(targetIndex);
              if (targetIndexes.size === 0) {
                currentFiles[name].completed = true;
              }
              setCurrentFiles((prev) => ({ ...prev, [name]: currentFiles[name] }));
            }, CHANCE_OF_SUCCESS).catch(() => {
              currentFiles[name].chunks[targetIndex].retryCount += 1;
              if (currentFiles[name].chunks[targetIndex].retryCount > MAX_RETRY_COUNT) {
                return `Failed to upload chunk: ${start} to ${end}`;
              }
              currentFiles[name].chunks[targetIndex].queued = false;
              setCurrentFiles((prev) => ({ ...prev, [name]: currentFiles[name] }));
            });
          }),
        );

        const failedMessage = result.find((val) => val);
        if (failedMessage) {
          currentFiles[name].error = failedMessage;
          currentFiles[name].failed = true;
          currentFiles[name].completed = false;
          setCurrentFiles((prev) => ({ ...prev, [name]: currentFiles[name] }));
          targetIndexes.clear();
        }
      }
    }
    setIsBatching(false);
  };

  const retryItem = (name: string) => {
    if (!currentFiles[name]) return;
    currentFiles[name].error = '';
    currentFiles[name].failed = false;
    currentFiles[name].chunks = currentFiles[name].chunks.map((chunk) => ({
      ...chunk,
      retryCount: 0,
      // If Chunk is not completed, we know that it failed, so we want to reset it to be requeued
      queued: chunk.completed,
    }));
    setCurrentFiles((prev) => ({ ...prev, [name]: currentFiles[name] }));
  };

  useEffect(() => {
    if (!isBatching && !isDropping) {
      const name = Object.keys(currentFiles).find(
        (name) =>
          !currentFiles[name].completed &&
          !currentFiles[name].failed &&
          currentFiles[name].chunks.some((chunk) => !chunk.queued),
      );
      if (name) {
        updateItem(name);
      }
    }
  }, [fileCount, completedCount, failedCount, isBatching, isDropping]);

  const storeFileInfoForUpdate = async (file: File) => {
    const totalCount =
      file.size % MAX_CHUNK_SIZE == 0
        ? file.size / MAX_CHUNK_SIZE
        : Math.floor(file.size / MAX_CHUNK_SIZE) + 1;

    const chunks: Chunk[] = [];

    for (let index = 0; index < totalCount; index++) {
      const start = index ? index * MAX_CHUNK_SIZE + 1 : 0;
      let end = (index + 1) * MAX_CHUNK_SIZE;
      if (index === totalCount - 1) {
        end = file.size;
      }

      chunks.push({ start, end, queued: false, completed: false, retryCount: 0 });
    }

    let checksum: string;
    let error: string;

    try {
      if (Math.random() > CHANCE_OF_HASHING_SUCCESS)
        throw Error(
          `Bro ipsum dolor sit amet gaper backside single track, manny Bike epic clipless. 
              Schraeder drop gondy, rail fatty slash gear jammer steeps clipless rip bowl couloir bomb hole berm. 
              Huck cruiser crank endo, sucker hole piste ripping ACL huck greasy flow face plant pinner. 
              Japan air Skate park big ring trucks shuttle stoked rock-ectomy.
              `,
        );
      checksum = await getFileChecksumSHA256(file);
    } catch (err) {
      error = 'Failed checksum validation: ' + (err as Error).message;
    }

    setCurrentFiles((prev) => {
      prev[file.name] = { chunks, file, checksum, error, failed: !!error };
      return { ...prev };
    });
  };

  const handleFileDrop = async (_: DropEvent, droppedFiles: File[]) => {
    setIsDropping(true);
    if (currentFiles.length) {
      const droppedFileNames = droppedFiles.map(({ name }) => name);

      droppedFileNames.forEach((name) => {
        removeItem(name);
      });
    }

    await Promise.all(droppedFiles.map((file) => storeFileInfoForUpdate(file)));
    setIsDropping(false);
  };

  const removeItem = (name: string) =>
    setCurrentFiles((prev) => {
      delete prev[name];
      return { ...prev };
    });

  const uploadMainProps = useMemo(() => {
    switch (true) {
      case isDropping:
        return {
          titleIcon: <StatusIcon status='running' removeText />,
          titleText: 'Calculating hash for each file',
          isUploadButtonHidden: true,
        };
      case completedCount + failedCount < fileCount:
        return {
          titleIcon: <StatusIcon status='running' removeText />,
          titleText: 'Uploading files',
          isUploadButtonHidden: true,
        };
      case fileCountGreaterThanZero && fileCount === completedCount:
        return {
          titleIcon: <StatusIcon status='completed' removeText />,
          titleText: 'All uploads completed!',
          infoText: 'Select "Confirm" below or continue to upload more files.',
        };
      case fileCountGreaterThanZero && completedCount + failedCount === fileCount:
        return {
          titleIcon: <StatusIcon status='failed' removeText />,
          titleText: `${failedCount} of ${fileCount} files failed to uploaded`,
          infoText: 'Retry, re-upload, or remove the failed items below before continuing.',
        };
      default:
        return {
          titleIcon: <UploadIcon />,
          titleText: 'Drag and drop files here or click "Upload" to get started',
          infoText: 'Accepted file types: .rpm',
        };
    }
  }, [isDropping, fileCountGreaterThanZero, fileCount, completedCount, failedCount]);

  const actionOngoing = uploadMainProps.isUploadButtonHidden;

  return (
    <MultipleFileUpload
      onFileDrop={handleFileDrop}
      className={classes.containerPadding}
      dropzoneProps={{
        disabled: actionOngoing,
        maxSize: 16242783756,
        accept: {
          'application/x-rpm': ['.rpm'],
        },
      }}
      isHorizontal
    >
      <MultipleFileUploadMain className={classes.mainDropzone} {...uploadMainProps} />
      {fileCountGreaterThanZero && (
        <MultipleFileUploadStatus
          statusToggleText={`${completedCount} of ${fileCount} files will be uploaded${failedCount ? `, ${failedCount} failed` : ''}`}
          statusToggleIcon={statusIcon}
        >
          <InnerScrollContainer className={classes.innerScrollerMaxHeight}>
            {Object.values(currentFiles).map(({ checksum, chunks, error, file, failed }) => {
              const completedChunks = chunks.filter(({ completed }) => completed).length;
              const progressValue = Math.round((completedChunks / chunks.length) * 100);

              return (
                <UploadStatusItem
                  fileSize={file.size}
                  key={file.name}
                  fileName={file.name}
                  progressVariant={(() => {
                    switch (true) {
                      case failed:
                        return 'danger';
                      case progressValue >= 100:
                        return 'success';
                      default:
                        break;
                    }
                  })()}
                  retry={checksum ? () => retryItem(file.name) : undefined}
                  progressHelperText={error}
                  progressValue={progressValue}
                  deleteButtonDisabled={!failed && progressValue < 100 && progressValue > 0}
                  onClearClick={() => removeItem(file.name)}
                />
              );
            })}
          </InnerScrollContainer>
        </MultipleFileUploadStatus>
      )}
    </MultipleFileUpload>
  );
}
