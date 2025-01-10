import { render, waitFor } from '@testing-library/react';
import StatusIcon from './StatusIcon';
import {
  defaultTemplateItem,
  defaultUpdateTemplateTaskCompleted,
  defaultUpdateTemplateTaskFailed,
  defaultUpdateTemplateTaskRunning,
} from 'testingHelpers';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: jest.fn(),
}));

(useChrome as jest.Mock).mockImplementation(() => ({
  getEnvironment: () => 'stage',
}));

it('Render with Valid status', () => {
  const { queryByText } = render(
    <StatusIcon
      uuid={defaultTemplateItem.uuid}
      last_update_snapshot_error=''
      last_update_task={defaultUpdateTemplateTaskCompleted}
    />,
  );

  const SelectComponent = queryByText('Valid');
  expect(SelectComponent).toBeInTheDocument();
});

it('Render with In progress status', () => {
  const { queryByText } = render(
    <StatusIcon
      uuid={defaultTemplateItem.uuid}
      last_update_snapshot_error=''
      last_update_task={defaultUpdateTemplateTaskRunning}
    />,
  );

  const SelectComponent = queryByText('In progress');
  expect(SelectComponent).toBeInTheDocument();
});

it('Render with Invalid status with an error from the update-latest-snapshot task', async () => {
  const { queryByText } = render(
    <StatusIcon
      uuid={defaultTemplateItem.uuid}
      last_update_snapshot_error='error'
      last_update_task={defaultUpdateTemplateTaskFailed}
    />,
  );

  const SelectComponent = queryByText('Invalid');
  expect(SelectComponent).toBeInTheDocument();

  await waitFor(() => {
    SelectComponent?.click();
  });

  await waitFor(() => {
    expect(
      queryByText('An error occurred when updating the latest snapshot: error'),
    ).toBeInTheDocument();
  });
});

it('Render with Invalid status with an error from the update-template-content task', async () => {
  const { queryByText } = render(
    <StatusIcon
      uuid={defaultTemplateItem.uuid}
      last_update_snapshot_error=''
      last_update_task={defaultUpdateTemplateTaskFailed}
    />,
  );

  const SelectComponent = queryByText('Invalid');
  expect(SelectComponent).toBeInTheDocument();

  await waitFor(() => {
    SelectComponent?.click();
  });

  await waitFor(() => {
    expect(queryByText('An error occurred when updating the template: error')).toBeInTheDocument();
  });
});
