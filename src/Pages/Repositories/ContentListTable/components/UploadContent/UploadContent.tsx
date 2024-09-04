import { Bullseye, Button, Modal, ModalVariant, Stack, StackItem } from '@patternfly/react-core';
import { global_Color_200 } from '@patternfly/react-tokens';
import { createUseStyles } from 'react-jss';
import { useNavigate, useParams } from 'react-router-dom';
import useRootPath from 'Hooks/useRootPath';
import { REPOSITORIES_ROUTE } from 'Routes/constants';
import FileUploader from './compontents/FileUploader';
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
});

const UploadContent = () => {
  const classes = useStyles();
  const { repoUUID: uuid } = useParams();
  const [fileUUIDs, setFileUUIDs] = useState<{ sha256: string; uuid: string }[]>([]);
  const rootPath = useRootPath();
  const navigate = useNavigate();
  const onClose = () => navigate(`${rootPath}/${REPOSITORIES_ROUTE}`);

  const { mutateAsync: uploadItems, isLoading } = useAddUploadsQuery({
    repoUUID: uuid!,
    uploads: fileUUIDs,
  });

  return (
    <Modal
      position='top'
      variant={ModalVariant.medium}
      title='Upload content'
      ouiaId='upload_content_modal'
      description={
        <p className={classes.description}>
          Use the form below to upload content to your repository.
        </p>
      }
      isOpen={!!uuid}
      onClose={onClose}
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
              Upload now
            </Button>
            <Button key='cancel' variant='link' onClick={onClose} ouiaId='modal_cancel'>
              Cancel
            </Button>
          </StackItem>
        </Stack>
      }
    >
      <Bullseye>
        <FileUploader isLoading={isLoading} setFileUUIDs={setFileUUIDs} />
      </Bullseye>
    </Modal>
  );
};

export default UploadContent;
