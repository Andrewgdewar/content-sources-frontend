import { render } from '@testing-library/react';
import { ContentOrigin } from 'services/Content/ContentApi';
import { useGetSnapshotPackagesQuery } from 'services/Content/ContentQueries';
import { SnapshotPackagesTab } from './SnapshotPackagesTab';
import { defaultPackageItem } from 'testingHelpers';

jest.mock('Hooks/useRootPath', () => () => 'someUrl');

jest.mock('services/Content/ContentQueries', () => ({
  useGetSnapshotPackagesQuery: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useParams: () => ({
    repoUUID: 'some-uuid',
  }),
}));

jest.mock('middleware/AppContext', () => ({
  useAppContext: () => ({
    contentOrigin: ContentOrigin.CUSTOM,
  }),
}));

it('Render 1 item in package list', () => {
  (useGetSnapshotPackagesQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [defaultPackageItem],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  const { queryByText } = render(<SnapshotPackagesTab />);

  expect(queryByText(defaultPackageItem.name)).toBeInTheDocument();
  expect(queryByText(defaultPackageItem.version)).toBeInTheDocument();
  expect(queryByText(defaultPackageItem.release)).toBeInTheDocument();
  expect(queryByText(defaultPackageItem.arch)).toBeInTheDocument();
});
