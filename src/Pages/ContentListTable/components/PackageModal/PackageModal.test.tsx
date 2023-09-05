import { render } from '@testing-library/react';
import PackageModal from './PackageModal';
import { PackageItem } from '../../../../services/Content/ContentApi';
import { ReactQueryTestWrapper } from '../../../../testingHelpers';
import { useGetPackagesQuery } from '../../../../services/Content/ContentQueries';

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

jest.mock('../../../../Hooks/useRootPath', () => () => 'someUrl');

jest.mock('../../../../services/Content/ContentQueries', () => ({
  useGetPackagesQuery: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useParams: () => ({
    repoUUID: 'some-uuid',
  }),
}));

it('Render 1 item', () => {
  (useGetPackagesQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [packageItem],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  const { queryByText } = render(
    <ReactQueryTestWrapper>
      <PackageModal />
    </ReactQueryTestWrapper>,
  );

  expect(queryByText('Packages')).toBeInTheDocument();
  expect(queryByText(packageItem.name)).toBeInTheDocument();
  expect(queryByText(packageItem.version)).toBeInTheDocument();
  expect(queryByText(packageItem.release)).toBeInTheDocument();
  expect(queryByText(packageItem.arch)).toBeInTheDocument();
  expect(queryByText('Clear search')).not.toBeInTheDocument();
});

it('Render with no packages (after an unsuccessful search)', () => {
  (useGetPackagesQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [],
      meta: { count: 0, limit: 20, offset: 0 },
    },
  }));

  const { queryByText } = render(
    <ReactQueryTestWrapper>
      <PackageModal />
    </ReactQueryTestWrapper>,
  );

  expect(queryByText('Packages')).toBeInTheDocument();
  expect(queryByText('No packages match the search criteria')).toBeInTheDocument();
  expect(queryByText('Clear search')).toBeInTheDocument();
});
