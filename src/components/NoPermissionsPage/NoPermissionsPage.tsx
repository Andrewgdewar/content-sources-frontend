import {
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Grid,
  EmptyStateHeader,
} from '@patternfly/react-core';
import { LockIcon } from '@patternfly/react-icons';

export const NoPermissionsPage: React.FunctionComponent = () => (
  <>
    <Grid style={{ margin: '24px' }}>
      <EmptyState variant={EmptyStateVariant.full}>
        <EmptyStateHeader
          titleText='You do not have access'
          icon={<EmptyStateIcon icon={LockIcon} />}
          headingLevel='h5'
        />
        <EmptyStateBody>
          Contact your organization administrator(s) for more information.
        </EmptyStateBody>
      </EmptyState>
    </Grid>
  </>
);
