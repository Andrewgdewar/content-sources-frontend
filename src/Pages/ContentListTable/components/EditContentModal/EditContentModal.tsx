import {
  Bullseye,
  Button,
  Modal,
  ModalVariant,
  Popover,
  Spinner,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { global_Color_200 } from '@patternfly/react-tokens';
import { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import Hide from '../../../../components/Hide/Hide';
import {
  CONTENT_ITEM_KEY,
  useEditContentQuery,
  useFetchContent,
} from '../../../../services/Content/ContentQueries';
import { useQueryClient } from 'react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import EditContentForm from './EditContentForm';
import { EditContentRequest } from '../../../../services/Content/ContentApi';
import { isEqual } from 'lodash';
import { mapToContentItemsToEditContentRequest } from './helpers';
import { useContentListOutletContext } from '../../ContentListTable';
import useRootPath from '../../../../Hooks/useRootPath';

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

const EditContentModal = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const rootPath = useRootPath();
  const queryClient = useQueryClient();
  const { search } = useLocation();
  const [initialLoad, setInitialLoad] = useState(true);
  const [updatedValues, setUpdatedValues] = useState<EditContentRequest>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const { clearCheckedRepositories } = useContentListOutletContext();

  const uuids = new URLSearchParams(search).get('repoUUIDS')?.split(',') || [];

  const { mutateAsync: editContent, isLoading: isEditing } = useEditContentQuery(
    queryClient,
    updatedValues,
  );

  const onClose = () => navigate(rootPath);
  const onSave = async () =>
    editContent().then(() => {
      onClose();
      clearCheckedRepositories();
      queryClient.invalidateQueries(CONTENT_ITEM_KEY);
    });

  const { data, isError } = useFetchContent(uuids);
  const values = data ? [data] : [];

  useEffect(() => {
    if (data) {
      setUpdatedValues(values); // This has to happen above the initial Load being set
    }
    if (isError) {
      onClose();
    }
  }, [isError, !!data]);

  useEffect(() => {
    if (values.length) {
      setInitialLoad(false);
    }
  }, [values]);

  const valuesHaveChanged = !isEqual(mapToContentItemsToEditContentRequest(values), updatedValues);
  const actionTakingPlace = isEditing || isLoading || initialLoad;

  return (
    <Modal
      position='top'
      variant={ModalVariant.medium}
      title='Edit custom repository'
      ouiaId='edit_custom_repository'
      ouiaSafe={!actionTakingPlace}
      help={
        <Popover
          headerContent={<div>Edit custom repository</div>}
          bodyContent={<div>Use this form to edit the values of an existing repository.</div>}
        >
          <Button variant='plain' aria-label='Help'>
            <OutlinedQuestionCircleIcon />
          </Button>
        </Popover>
      }
      description={
        <p className={classes.description}>
          Edit by completing the form. Default values may be provided automatically.
        </p>
      }
      isOpen
      onClose={onClose}
      footer={
        <Stack>
          <StackItem>
            <Button
              className={classes.saveButton}
              key='confirm'
              ouiaId='edit_modal_save'
              variant='primary'
              isLoading={actionTakingPlace}
              isDisabled={actionTakingPlace || !valuesHaveChanged || !isValid}
              onClick={onSave}
            >
              {valuesHaveChanged ? 'Save changes' : 'No changes'}
            </Button>
            <Button key='cancel' variant='link' onClick={onClose} ouiaId='edit_modal_cancel'>
              Cancel
            </Button>
          </StackItem>
        </Stack>
      }
    >
      <Hide hide={!initialLoad}>
        <Bullseye>
          <Spinner />
        </Bullseye>
      </Hide>
      <Hide hide={initialLoad}>
        <EditContentForm
          setIsValid={setIsValid}
          values={values}
          setIsLoading={setIsLoading}
          setUpdatedValues={setUpdatedValues}
        />
      </Hide>
    </Modal>
  );
};

export default EditContentModal;
