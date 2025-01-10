import { render } from '@testing-library/react';
import {
  ReactQueryTestWrapper,
  defaultContentItemWithSnapshot,
  defaultSnapshotItem,
  defaultTemplateItem,
  defaultTemplateItem2,
} from 'testingHelpers';
import DeleteSnapshotsModal from './DeleteSnapshotsModal';
import { DELETE_ROUTE } from 'Routes/constants';
import { useGetSnapshotList } from 'services/Content/ContentQueries';
import { useFetchTemplatesForSnapshots } from 'services/Templates/TemplateQueries';
import { formatDateDDMMMYYYY } from 'helpers';

jest.mock('react-query', () => ({
  ...jest.requireActual('react-query'),
  useQueryClient: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useParams: () => ({ repoUUID: defaultContentItemWithSnapshot.uuid }),
  useLocation: () => ({
    search: `${DELETE_ROUTE}?snapshotUUID=${defaultSnapshotItem.uuid}`,
  }),
  useHref: () => 'insights/content/repositories',
}));

jest.mock('../SnapshotListModal', () => ({
  useSnapshotListOutletContext: () => ({
    clearCheckedRepositories: () => undefined,
    deletionContext: {
      checkedSnapshots: new Set<string>([defaultSnapshotItem.uuid]),
    },
  }),
}));

jest.mock('Hooks/useRootPath', () => () => 'someUrl');

jest.mock('services/Content/ContentQueries', () => ({
  useBulkDeleteSnapshotsMutate: () => ({ isLoading: false }),
  useGetSnapshotList: jest.fn(),
}));

jest.mock('services/Templates/TemplateQueries', () => ({
  useFetchTemplatesForSnapshots: jest.fn(),
}));

jest.mock('middleware/AppContext', () => ({
  useAppContext: () => ({
    features: { snapshots: { accessible: true } },
    rbac: { repoWrite: true, repoRead: true },
  }),
}));

it('Render delete modal where snapshot is not included in any templates', () => {
  (useGetSnapshotList as jest.Mock).mockImplementation(() => ({
    data: {
      isLoading: false,
      data: [defaultSnapshotItem],
    },
  }));
  (useFetchTemplatesForSnapshots as jest.Mock).mockImplementation(() => ({
    isError: false,
    data: {
      data: [],
      meta: { limit: 10, offset: 0, count: 0 },
      isLoading: false,
    },
  }));

  const { queryByText } = render(
    <ReactQueryTestWrapper>
      <DeleteSnapshotsModal />
    </ReactQueryTestWrapper>,
  );

  expect(
    queryByText(formatDateDDMMMYYYY(defaultSnapshotItem.created_at, true)),
  ).toBeInTheDocument();
  expect(queryByText(defaultTemplateItem.name)).not.toBeInTheDocument();
  expect(queryByText(defaultTemplateItem2.name)).not.toBeInTheDocument();
  expect(queryByText('None')).toBeInTheDocument();
});

it('Render delete modal where snapshot is included in templates', () => {
  (useGetSnapshotList as jest.Mock).mockImplementation(() => ({
    data: {
      isLoading: false,
      data: [defaultSnapshotItem],
    },
  }));
  (useFetchTemplatesForSnapshots as jest.Mock).mockImplementation(() => ({
    isError: false,
    data: {
      data: [defaultTemplateItem, defaultTemplateItem2],
      meta: { limit: 10, offset: 0, count: 2 },
      isLoading: false,
    },
  }));

  const { queryByText } = render(
    <ReactQueryTestWrapper>
      <DeleteSnapshotsModal />
    </ReactQueryTestWrapper>,
  );

  expect(
    queryByText(formatDateDDMMMYYYY(defaultSnapshotItem.created_at, true)),
  ).toBeInTheDocument();
  expect(queryByText(defaultTemplateItem.name)).toBeInTheDocument();
  expect(queryByText(defaultTemplateItem2.name)).toBeInTheDocument();
  expect(queryByText('Some snapshots have associated templates.')).toBeInTheDocument();
  expect(queryByText('None')).not.toBeInTheDocument();
});
