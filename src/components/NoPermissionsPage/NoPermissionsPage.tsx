import {
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Title,
} from '@patternfly/react-core';
import { LockIcon } from '@patternfly/react-icons';
import {
  Main,
  PageHeader as _PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components';
import { FunctionComponent } from 'react';

const PageHeader = _PageHeader as unknown as FunctionComponent<{
  children: React.ReactNode;
}>;

export const NoPermissionsPage: React.FunctionComponent = () => (
  <>
    <PageHeader>
      <PageHeaderTitle title='Repositories' />
    </PageHeader>
    <Main>
      <EmptyState variant={EmptyStateVariant.full}>
        <EmptyStateIcon icon={LockIcon} />
        <Title headingLevel='h5' size='lg'>
          You do not have access to Repositories
        </Title>
        <EmptyStateBody>
          Contact your organization administrator(s) for more information.
        </EmptyStateBody>
      </EmptyState>
    </Main>
  </>
);