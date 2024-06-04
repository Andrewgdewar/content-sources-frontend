import {
  Bullseye,
  Modal,
  ModalVariant,
  Spinner,
  Wizard,
  WizardHeader,
  WizardStep,
} from '@patternfly/react-core';

import useRootPath from 'Hooks/useRootPath';
import { useNavigate } from 'react-router-dom';
import { TEMPLATES_ROUTE } from 'Routes/constants';
import { useCreateTemplateQuery, useEditTemplateQuery } from 'services/Templates/TemplateQueries';
import { AddTemplateContextProvider, useAddTemplateContext } from './AddTemplateContext';
import RedhatRepositoriesStep from './steps/RedhatRepositoriesStep';
import CustomRepositoriesStep from './steps/CustomRepositoriesStep';
import { TemplateRequest } from 'services/Templates/TemplateApi';

import DefineContentStep from './steps/DefineContentStep';
import SetUpDateStep from './steps/SetUpDateStep';
import DetailStep from './steps/DetailStep';
import ReviewStep from './steps/ReviewStep';
import { formatTemplateDate } from 'helpers';
import { isEmpty } from 'lodash';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  minHeightForSpinner: {
    minHeight: '60vh',
  },
});

export interface Props {
  isDisabled: boolean;
  addRepo: (snapshot: boolean) => void;
}

const AddTemplateBase = () => {
  const rootPath = useRootPath();
  const classes = useStyles();
  const navigate = useNavigate();
  const { isEdit, templateRequest, checkIfCurrentStepValid, editUUID } = useAddTemplateContext();

  const { queryClient } = useAddTemplateContext();
  const onClose = () => navigate(rootPath + '/' + TEMPLATES_ROUTE);

  const { mutateAsync: addTemplate, isLoading: isAdding } = useCreateTemplateQuery(queryClient, {
    ...(templateRequest as TemplateRequest),
    date: formatTemplateDate(templateRequest.date || ''),
  });

  const { mutateAsync: editTemplate, isLoading: isEditing } = useEditTemplateQuery(queryClient, {
    uuid: editUUID as string,
    ...(templateRequest as TemplateRequest),
    date: formatTemplateDate(templateRequest.date || ''),
  });

  const addEditAction = isEdit ? editTemplate : addTemplate;

  return (
    <Modal
      aria-label={`${isEdit ? 'edit' : 'add'} template modal`}
      variant={ModalVariant.large}
      showClose={isEdit && isEmpty(templateRequest)}
      isOpen
      onClose={onClose}
      hasNoBodyWrapper
      disableFocusTrap
    >
      {isEdit && isEmpty(templateRequest) ? (
        <Bullseye className={classes.minHeightForSpinner}>
          <Spinner size='xl' />
        </Bullseye>
      ) : (
        <Wizard
          header={
            <WizardHeader
              title={`${isEdit ? 'Edit' : 'Create'} content template`}
              titleId={`${isEdit ? 'edit' : 'create'}_content_template`}
              description='Prepare for your next patching cycle with a content template.'
              onClose={onClose}
              closeButtonAriaLabel={`close_${isEdit ? 'edit' : 'create'}_content_template`}
            />
          }
          onClose={onClose}
        >
          <WizardStep
            name='Content'
            id='content_step'
            isExpandable
            steps={[
              <WizardStep
                name='Define content'
                id='define_content'
                key='define_content_key'
                footer={{ isNextDisabled: checkIfCurrentStepValid(1) }}
              >
                <DefineContentStep />
              </WizardStep>,
              <WizardStep
                isDisabled={checkIfCurrentStepValid(1)}
                name='Red Hat repositories'
                id='redhat_repositories'
                key='redhat_repositories_key'
                footer={{ isNextDisabled: checkIfCurrentStepValid(2) }}
              >
                <RedhatRepositoriesStep />
              </WizardStep>,
              <WizardStep
                isDisabled={checkIfCurrentStepValid(2)}
                name='Custom Repositories'
                id='custom_repositories'
                key='custom_repositories_key'
                footer={{ isNextDisabled: checkIfCurrentStepValid(3) }}
              >
                <CustomRepositoriesStep />
              </WizardStep>,
            ]}
          />
          <WizardStep
            name='Set up date'
            id='set_up_date_step'
            isDisabled={checkIfCurrentStepValid(3)}
            footer={{ isNextDisabled: checkIfCurrentStepValid(4) }}
          >
            <SetUpDateStep />
          </WizardStep>
          {/* <WizardStep name='Systems (optional)' id='systems' /> */}
          <WizardStep
            isDisabled={checkIfCurrentStepValid(4)}
            footer={{ isNextDisabled: checkIfCurrentStepValid(5) }}
            name='Detail'
            id='detail_step'
          >
            <DetailStep />
          </WizardStep>
          <WizardStep
            isDisabled={checkIfCurrentStepValid(5)}
            name='Review'
            id='review_step'
            footer={{
              nextButtonText: isEdit ? 'Confirm changes' : 'Create',
              onNext: () => addEditAction().then(onClose),
              isNextDisabled: isAdding || isEditing,
            }}
          >
            <ReviewStep />
          </WizardStep>
        </Wizard>
      )}
    </Modal>
  );
};

// Wrap the modal with the provider
export function AddTemplate() {
  return (
    <AddTemplateContextProvider>
      <AddTemplateBase />
    </AddTemplateContextProvider>
  );
}
