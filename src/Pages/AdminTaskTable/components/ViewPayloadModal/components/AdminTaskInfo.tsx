import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { AdminTask } from '../../../../../services/AdminTasks/AdminTaskApi';
import { formatDate } from '../../../AdminTaskTable';

export interface AdminTaskInfoProps {
  adminTask: AdminTask;
}
const AdminTaskInfo = ({ adminTask }: AdminTaskInfoProps) => (
  <DescriptionList>
    <DescriptionListGroup>
      <DescriptionListTerm>UUID</DescriptionListTerm>
      <DescriptionListDescription>{adminTask.uuid}</DescriptionListDescription>
    </DescriptionListGroup>
    <DescriptionListGroup>
      <DescriptionListTerm>Account ID</DescriptionListTerm>
      <DescriptionListDescription>
        {adminTask.account_id ? adminTask.account_id : 'Unknown; repository configuration deleted'}
      </DescriptionListDescription>
    </DescriptionListGroup>
    <DescriptionListGroup>
      <DescriptionListTerm>Org ID</DescriptionListTerm>
      <DescriptionListDescription>{adminTask.org_id}</DescriptionListDescription>
    </DescriptionListGroup>
    <DescriptionListGroup>
      <DescriptionListTerm>Type</DescriptionListTerm>
      <DescriptionListDescription>{adminTask.typename}</DescriptionListDescription>
    </DescriptionListGroup>
    <DescriptionListGroup>
      <DescriptionListTerm>Status</DescriptionListTerm>
      <DescriptionListDescription>{adminTask.status}</DescriptionListDescription>
    </DescriptionListGroup>
    <DescriptionListGroup>
      <DescriptionListTerm>Queued At</DescriptionListTerm>
      <DescriptionListDescription>{formatDate(adminTask.queued_at)}</DescriptionListDescription>
    </DescriptionListGroup>
    <DescriptionListGroup>
      <DescriptionListTerm>Started At</DescriptionListTerm>
      <DescriptionListDescription>
        {adminTask.started_at ? formatDate(adminTask.started_at) : 'Not started'}
      </DescriptionListDescription>
    </DescriptionListGroup>
    <DescriptionListGroup>
      <DescriptionListTerm>Finished At</DescriptionListTerm>
      <DescriptionListDescription>
        {adminTask.finished_at ? formatDate(adminTask.finished_at) : 'Not finished'}
      </DescriptionListDescription>
    </DescriptionListGroup>
    <DescriptionListGroup>
      <DescriptionListTerm>Error</DescriptionListTerm>
      <DescriptionListDescription>
        {adminTask.error ? adminTask.error : 'None'}
      </DescriptionListDescription>
    </DescriptionListGroup>
  </DescriptionList>
);

export default AdminTaskInfo;
