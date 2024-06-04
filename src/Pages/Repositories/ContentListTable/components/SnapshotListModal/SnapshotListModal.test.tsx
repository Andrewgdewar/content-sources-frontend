import { render } from '@testing-library/react';
import SnapshotListModal from './SnapshotListModal';
import {
  ReactQueryTestWrapper,
  defaultContentItemWithSnapshot,
  defaultMetaItem,
  defaultSnapshotItem,
} from 'testingHelpers';
import { useFetchContent, useGetSnapshotList } from 'services/Content/ContentQueries';

jest.mock('Hooks/useRootPath', () => () => 'someUrl');

jest.mock('services/Content/ContentQueries', () => ({
  useFetchContent: jest.fn(),
  useGetSnapshotList: jest.fn(),
  useGetRepoConfigFileQuery: () => ({ mutateAsync: jest.fn() }),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useParams: () => ({
    repoUUID: 'some-uuid',
  }),
}));

jest.mock('middleware/AppContext', () => ({
  useAppContext: () => ({ rbac: { read: true, write: true } }),
}));

it('Render 1 item', () => {
  (useFetchContent as jest.Mock).mockImplementation(() => ({
    data: defaultContentItemWithSnapshot,
  }));
  (useGetSnapshotList as jest.Mock).mockImplementation(() => ({
    data: {
      meta: defaultMetaItem,
      data: [defaultSnapshotItem],
    },
    isLoading: false,
    isFetching: false,
  }));
  const { queryByText } = render(
    <ReactQueryTestWrapper>
      <SnapshotListModal />
    </ReactQueryTestWrapper>,
  );

  expect(queryByText(defaultContentItemWithSnapshot.name)).toBeInTheDocument();

  expect(
    queryByText((defaultSnapshotItem.content_counts['rpm.package'] as number)?.toString()),
  ).toBeInTheDocument();
});

it('Render 20 items', () => {
  (useFetchContent as jest.Mock).mockImplementation(() => ({
    data: defaultContentItemWithSnapshot,
  }));
  (useGetSnapshotList as jest.Mock).mockImplementation(() => ({
    data: {
      meta: { defaultMetaItem, count: 21 }, // Make count larger so next button is available for pagination
      data: Array(20)
        .fill(defaultSnapshotItem)
        .map((val, index) => ({
          ...val,
          name: index + val.name,
          content_counts: {
            ...val.content_counts,
            'rpm.package': val.content_counts['rpm.package'] + index,
          },
        })),
    },
    isLoading: false,
    isFetching: false,
  }));
  const { queryByText } = render(
    <ReactQueryTestWrapper>
      <SnapshotListModal />
    </ReactQueryTestWrapper>,
  );

  expect(queryByText(defaultContentItemWithSnapshot.name)).toBeInTheDocument();

  expect(
    queryByText((defaultSnapshotItem.content_counts['rpm.package'] as number)?.toString()),
  ).toBeInTheDocument();
});
