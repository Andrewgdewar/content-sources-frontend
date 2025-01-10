import { render } from '@testing-library/react';
import AdminTaskInfo from './AdminTaskInfo';
import { AdminTask } from 'services/AdminTasks/AdminTaskApi';
import { defaultIntrospectTask } from 'testingHelpers';
import { formatDateDDMMMYYYY } from 'helpers';

jest.mock('middleware/AppContext', () => ({
  useAppContext: () => ({ rbac: { read: true, write: true } }),
}));

it('Render with all fields', () => {
  const { queryByText } = render(<AdminTaskInfo adminTask={defaultIntrospectTask} />);

  expect(queryByText(defaultIntrospectTask.uuid)).toBeInTheDocument();
  expect(queryByText(defaultIntrospectTask.account_id as string)).toBeInTheDocument();
  expect(queryByText(defaultIntrospectTask.org_id)).toBeInTheDocument();
  expect(queryByText(defaultIntrospectTask.typename)).toBeInTheDocument();
  expect(queryByText(defaultIntrospectTask.status)).toBeInTheDocument();
  expect(
    queryByText(formatDateDDMMMYYYY(defaultIntrospectTask.queued_at, true)),
  ).toBeInTheDocument();
  expect(
    queryByText(formatDateDDMMMYYYY(defaultIntrospectTask.started_at, true)),
  ).toBeInTheDocument();
  expect(
    queryByText(formatDateDDMMMYYYY(defaultIntrospectTask.finished_at, true)),
  ).toBeInTheDocument();
  expect(queryByText(defaultIntrospectTask.error)).toBeInTheDocument();
});

it('Render without optional fields', () => {
  const missingOptional: AdminTask = {
    ...defaultIntrospectTask,
    account_id: '',
    started_at: '',
    finished_at: '',
    error: '',
  };
  const { queryByText } = render(<AdminTaskInfo adminTask={missingOptional} />);

  expect(queryByText(missingOptional.uuid)).toBeInTheDocument();
  // Account ID
  expect(queryByText('Unknown; repository configuration deleted')).toBeInTheDocument();
  expect(queryByText(missingOptional.org_id)).toBeInTheDocument();
  expect(queryByText(missingOptional.typename)).toBeInTheDocument();
  expect(queryByText(missingOptional.status)).toBeInTheDocument();
  expect(queryByText(formatDateDDMMMYYYY(missingOptional.queued_at, true))).toBeInTheDocument();
  expect(queryByText('Not started')).toBeInTheDocument();
  expect(queryByText('Not finished')).toBeInTheDocument();
  expect(queryByText('None')).toBeInTheDocument();
});
