import { render } from '@testing-library/react';
import { ContentOrigin, PackageItem } from 'services/Content/ContentApi';
import { useGetSnapshotPackagesQuery } from 'services/Content/ContentQueries';
import { SnapshotPackagesTab } from './SnapshotPackagesTab';

const packageItem: PackageItem = {
  // Used variables
  name: 'billy-the-bob',
  version: '2.2.2',
  release: '1.2.el9',
  arch: 'x86_64',
  // Placeholders for TS
  checksum: '',
  epoch: 0,
  summary: '',
  uuid: '',
};

jest.mock('Hooks/useDebounce', () => (value) => value);

jest.mock('Hooks/useRootPath', () => () => 'someUrl');

jest.mock('services/Content/ContentQueries', () => ({
  useGetSnapshotPackagesQuery: jest.fn(),
}));

jest.mock('Hooks/useDebounce', () => (value) => value);

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useParams: () => ({
    repoUUID: 'some-uuid',
  }),
}));

jest.mock('middleware/AppContext', () => ({
  useAppContext: () => ({
    contentOrigin: ContentOrigin.EXTERNAL,
  }),
}));

it('Render 1 item in package list', () => {
  (useGetSnapshotPackagesQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [packageItem],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  const { queryByText } = render(<SnapshotPackagesTab />);

  expect(queryByText(packageItem.name)).toBeInTheDocument();
  expect(queryByText(packageItem.version)).toBeInTheDocument();
  expect(queryByText(packageItem.release)).toBeInTheDocument();
  expect(queryByText(packageItem.arch)).toBeInTheDocument();
});
