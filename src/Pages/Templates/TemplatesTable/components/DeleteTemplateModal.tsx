import {
  Alert,
  Bullseye,
  Button,
  Flex,
  Modal,
  ModalVariant,
  Spinner,
  Stack,
  StackItem,
  Text,
} from '@patternfly/react-core';

import { global_Color_100 } from '@patternfly/react-tokens';
import { createUseStyles } from 'react-jss';
import Hide from 'components/Hide/Hide';
import { useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import useRootPath from 'Hooks/useRootPath';
import { GET_TEMPLATES_KEY, useDeleteTemplateItemMutate } from 'services/Templates/TemplateQueries';
import { DETAILS_ROUTE, SYSTEMS_ROUTE, TEMPLATES_ROUTE } from 'Routes/constants';
import { useListSystemsByTemplateId } from 'services/Systems/SystemsQueries';

const useStyles = createUseStyles({
  description: {
    paddingTop: '12px', // 4px on the title bottom padding makes this the "standard" 16 total padding
    color: global_Color_100.value,
  },
  removeButton: {
    marginRight: '36px',
    transition: 'unset!important',
  },
  link: {
    padding: 4,
  },
});

export default function DeleteTemplateModal() {
  const classes = useStyles();
  const navigate = useNavigate();
  const rootPath = useRootPath();
  const queryClient = useQueryClient();

  const { templateUUID: uuid } = useParams();

  const { mutateAsync: deleteTemplate, isLoading: isDeleting } =
    useDeleteTemplateItemMutate(queryClient);

  const onClose = () => navigate(`${rootPath}/${TEMPLATES_ROUTE}`);

  const onSave = async () => {
    deleteTemplate(uuid as string).then(() => {
      onClose();
      queryClient.invalidateQueries(GET_TEMPLATES_KEY);
    });
  };

  const {
    isLoading: isLoading,
    data: systems = { data: [], meta: { count: 0, limit: 1, offset: 0 } },
  } = useListSystemsByTemplateId(uuid as string, 1, 1, '', '');

  const actionTakingPlace = isLoading || isDeleting;

  return (
    <Modal
      titleIconVariant='warning'
      position='top'
      variant={ModalVariant.medium}
      title='Remove template?'
      ouiaId='delete_template'
      isOpen
      onClose={onClose}
      footer={
        <Stack>
          <StackItem>
            <Button
              key='confirm'
              ouiaId='delete_modal_confirm'
              variant='danger'
              isLoading={actionTakingPlace}
              isDisabled={actionTakingPlace}
              onClick={onSave}
            >
              Remove
            </Button>
            <Button key='cancel' variant='link' onClick={onClose} ouiaId='delete_modal_cancel'>
              Cancel
            </Button>
          </StackItem>
        </Stack>
      }
    >
      <Hide hide={!isLoading}>
        <Bullseye>
          <Spinner />
        </Bullseye>
      </Hide>
      <Hide hide={systems.data.length <= 0}>
        <Alert variant='warning' isInline title='This template is in use.'>
          <Flex direction={{ default: 'column' }}>
            <a
              href={`${rootPath}/${TEMPLATES_ROUTE}/${uuid}/${DETAILS_ROUTE}/${SYSTEMS_ROUTE}`}
              className={classes.link}
            >
              This template is assigned to {systems.data.length}{' '}
              {systems.data.length === 1 ? 'system' : 'systems'}.
            </a>
            <span>
              Removing this template will cause all associated systems to stop recieving custom
              content and snapshotted Red Hat content; they will still recieve the latest Red Hat
              content updates.
            </span>
          </Flex>
        </Alert>
      </Hide>
      <Text component='p' className={classes.description}>
        Are you sure you want to remove this template?
      </Text>
    </Modal>
  );
}
