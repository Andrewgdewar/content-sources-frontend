import { Button, Flex, Modal, ModalVariant, Stack, StackItem } from '@patternfly/react-core';
import { global_Color_200 } from '@patternfly/react-tokens';
import { createUseStyles } from 'react-jss';
import { useNavigate, useParams } from 'react-router-dom';
import useRootPath from 'Hooks/useRootPath';
import { REPOSITORIES_ROUTE } from 'Routes/constants';
import FileUploader from './components/FileUploader';
import { useState } from 'react';
import { useAddUploadsQuery } from 'services/Content/ContentQueries';

const useStyles = createUseStyles({
  description: {
    paddingTop: '12px', // 4px on the title bottom padding makes this the "standard" 16 total padding
    color: global_Color_200.value,
  },
  saveButton: {
    marginRight: '36px',
    transition: 'unset!important',
  },
  modalSize: {
    width: '678px',
  },
});

const UploadContent = () => {
  const classes = useStyles();
  const { repoUUID: uuid } = useParams();
  const [fileUUIDs, setFileUUIDs] = useState<{ sha256: string; uuid: string; href: string }[]>([]);
  const [confirmModal, setConfirmModal] = useState(false);

  const rootPath = useRootPath();
  const navigate = useNavigate();

  const onCloseClick = () => (fileUUIDs.length ? setConfirmModal(true) : onClose());

  const onClose = () => navigate(`${rootPath}/${REPOSITORIES_ROUTE}`);

  const { mutateAsync: uploadItems, isLoading } = useAddUploadsQuery({
    repoUUID: uuid!,
    uploads: fileUUIDs
      .filter(({ href }) => !href)
      .map(({ sha256, uuid }) => ({
        sha256,
        uuid,
      })),
    artifacts: fileUUIDs
      .filter(({ href }) => href)
      .map(({ sha256, href }) => ({
        sha256,
        href,
      })),
  });

  return (
    <>
      <Modal
        position='top'
        className={classes.modalSize}
        variant={ModalVariant.medium}
        title='Upload content'
        ouiaId='upload_content_modal'
        description={
          <p className={classes.description}>
            Use the form below to upload content to your repository.
          </p>
        }
        isOpen={!!uuid}
        onClose={onCloseClick}
        footer={
          <Stack>
            <StackItem>
              <Button
                className={classes.saveButton}
                key='confirm'
                ouiaId='modal_save'
                variant='primary'
                isLoading={isLoading}
                isDisabled={!fileUUIDs.length}
                onClick={() => uploadItems().then(onClose)}
              >
                {fileUUIDs.length ? 'Confirm changes' : 'No content uploaded'}
              </Button>
              <Button key='cancel' variant='link' onClick={onCloseClick} ouiaId='modal_cancel'>
                Cancel
              </Button>
            </StackItem>
          </Stack>
        }
      >
        <FileUploader isLoading={isLoading} setFileUUIDs={setFileUUIDs} />
      </Modal>
      <Modal
        isOpen={confirmModal}
        position='default'
        variant={ModalVariant.small}
        title='You have unsaved uploaded items.'
        ouiaId='are_you_sure'
        onClose={() => setConfirmModal(false)}
        description={
          <p className={classes.description}>
            Are you sure you want to quit without saving these changes?
          </p>
        }
        footer={
          <Flex gap={{ default: 'gap' }}>
            <Button variant='secondary' onClick={onClose}>
              Close without saving
            </Button>
            <Button
              key='cancel'
              variant='primary'
              onClick={() => setConfirmModal(false)}
              ouiaId='modal_cancel'
            >
              Go Back
            </Button>
          </Flex>
        }
      >
        <></>
      </Modal>
    </>
  );
};

export default UploadContent;
