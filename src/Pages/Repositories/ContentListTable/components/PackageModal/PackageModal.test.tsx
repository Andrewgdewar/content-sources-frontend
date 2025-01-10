import { render } from '@testing-library/react';
import PackageModal from './PackageModal';
import { defaultPackageItem, ReactQueryTestWrapper } from 'testingHelpers';
import { useGetPackagesQuery } from 'services/Content/ContentQueries';

jest.mock('Hooks/useRootPath', () => () => 'someUrl');

jest.mock('services/Content/ContentQueries', () => ({
  useGetPackagesQuery: jest.fn(),
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
  (useGetPackagesQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [defaultPackageItem],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  const { queryByText } = render(
    <ReactQueryTestWrapper>
      <PackageModal />
    </ReactQueryTestWrapper>,
  );

  expect(queryByText('Packages')).toBeInTheDocument();
  expect(queryByText(defaultPackageItem.name)).toBeInTheDocument();
  expect(queryByText(defaultPackageItem.version)).toBeInTheDocument();
  expect(queryByText(defaultPackageItem.release)).toBeInTheDocument();
  expect(queryByText(defaultPackageItem.arch)).toBeInTheDocument();
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
  expect(
    queryByText('You may need to add repositories that contain packages.'),
  ).toBeInTheDocument();
});
