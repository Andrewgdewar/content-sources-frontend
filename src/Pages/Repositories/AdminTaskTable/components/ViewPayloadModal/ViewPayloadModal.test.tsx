import { defaultIntrospectTask, defaultSnapshotTask, ReactQueryTestWrapper } from 'testingHelpers';
import ViewPayloadModal from './ViewPayloadModal';
import { fireEvent, render } from '@testing-library/react';
import { AdminTask } from 'services/AdminTasks/AdminTaskApi';
import { useFetchAdminTaskQuery } from 'services/AdminTasks/AdminTaskQueries';

jest.mock('Hooks/useNotification', () => () => ({ notify: () => null }));

jest.mock('services/AdminTasks/AdminTaskQueries', () => ({
  useFetchAdminTaskQuery: jest.fn(),
}));

jest.mock('Hooks/useRootPath', () => () => 'someUrl');
jest.mock('Hooks/useDebounce', () => (value) => value);
jest.mock('middleware/AppContext', () => ({ useAppContext: () => ({}) }));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useParams: () => ({ taskUUID: 'something' }),
}));

it('Render loading spinner', () => {
  (useFetchAdminTaskQuery as jest.Mock).mockImplementation(() => ({
    isFetching: true,
    isLoading: true,
    data: undefined,
  }));
  render(
    <ReactQueryTestWrapper>
      <ViewPayloadModal />
    </ReactQueryTestWrapper>,
  );
});

it('Open introspect task details and click tabs', () => {
  (useFetchAdminTaskQuery as jest.Mock).mockImplementation(() => ({
    isFetching: false,
    isLoading: false,
    data: defaultIntrospectTask,
  }));

  const { queryByText } = render(
    <ReactQueryTestWrapper>
      <ViewPayloadModal />
    </ReactQueryTestWrapper>,
  );

  expect(queryByText(defaultIntrospectTask.uuid)).toBeInTheDocument();

  const detailsTab = queryByText('Task details');
  expect(detailsTab).toBeInTheDocument();
  const detailsContent = document.getElementById('task-details');
  expect(detailsContent).toBeInTheDocument();
  expect(detailsContent).not.toHaveAttribute('hidden');

  const payloadTab = queryByText('Payload') as Element;
  expect(payloadTab).toBeInTheDocument();
  const payloadContent = document.getElementById('Payload');
  expect(payloadContent).toBeInTheDocument();
  expect(payloadContent).toHaveAttribute('hidden');

  fireEvent.click(payloadTab);
  expect(detailsContent).toHaveAttribute('hidden');
  expect(payloadContent).not.toHaveAttribute('hidden');
});

it('Open snapshot details and click tabs', () => {
  (useFetchAdminTaskQuery as jest.Mock).mockImplementation(() => ({
    isFetching: false,
    isLoading: false,
    data: defaultSnapshotTask,
  }));

  const { queryByText } = render(
    <ReactQueryTestWrapper>
      <ViewPayloadModal />
    </ReactQueryTestWrapper>,
  );

  expect(queryByText(defaultSnapshotTask.uuid)).toBeInTheDocument();

  const detailsTab = queryByText('Task details');
  expect(detailsTab).toBeInTheDocument();
  const detailsContent = document.getElementById('task-details');
  expect(detailsContent).toBeInTheDocument();
  expect(detailsContent).not.toHaveAttribute('hidden');

  const payloadTab = queryByText('Payload') as Element;
  expect(payloadTab).toBeInTheDocument();
  const payloadContent = document.getElementById('Payload');
  expect(payloadContent).toBeInTheDocument();
  expect(payloadContent).toHaveAttribute('hidden');

  const syncTab = queryByText('Sync') as Element;
  expect(syncTab).toBeInTheDocument();
  const syncContent = document.getElementById('Sync');
  expect(syncContent).toBeInTheDocument();
  expect(syncContent).toHaveAttribute('hidden');

  const distributionTab = queryByText('Distribution') as Element;
  expect(distributionTab).toBeInTheDocument();
  const distributionContent = document.getElementById('Distribution');
  expect(distributionContent).toBeInTheDocument();
  expect(distributionContent).toHaveAttribute('hidden');

  const publicationTab = queryByText('Publication') as Element;
  expect(publicationTab).toBeInTheDocument();
  const publicationContent = document.getElementById('Publication');
  expect(publicationContent).toBeInTheDocument();
  expect(publicationContent).toHaveAttribute('hidden');

  fireEvent.click(distributionTab);
  expect(detailsContent).toHaveAttribute('hidden');
  expect(payloadContent).toHaveAttribute('hidden');
  expect(syncContent).toHaveAttribute('hidden');
  expect(distributionContent).not.toHaveAttribute('hidden');
  expect(publicationContent).toHaveAttribute('hidden');
});

it('Open snapshot task without all pulp tasks', () => {
  const missingDistribution: AdminTask = {
    ...defaultSnapshotTask,
    pulp: {
      ...defaultSnapshotTask.pulp,
      distribution: undefined,
    },
  };
  (useFetchAdminTaskQuery as jest.Mock).mockImplementation(() => ({
    isFetching: false,
    isLoading: false,
    data: missingDistribution,
  }));

  const { queryByText } = render(
    <ReactQueryTestWrapper>
      <ViewPayloadModal />
    </ReactQueryTestWrapper>,
  );

  const modal = document.getElementById('task-details');
  // Details, payload, sync, publication
  expect(modal).toBeInTheDocument();
  expect(queryByText('Task details')).toBeInTheDocument();
  expect(queryByText('Payload')).toBeInTheDocument();
  expect(queryByText('Sync')).toBeInTheDocument();
  expect(queryByText('Publication')).toBeInTheDocument();
});
