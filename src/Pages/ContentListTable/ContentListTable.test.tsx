import { render } from '@testing-library/react';
import { ReactQueryTestWrapper, testRepositoryParamsResponse } from '../../testingHelpers';
import ContentListTable from './ContentListTable';
import { useContentListQuery, useRepositoryParams } from '../../services/Content/ContentQueries';
import AddContent from './components/AddContent/AddContent';

jest.mock('../../services/Content/ContentQueries', () => ({
  useRepositoryParams: jest.fn(),
  useContentListQuery: jest.fn(),
  useAddContentQuery: () => ({ isLoading: false }),
  useValidateContentList: () => ({ isLoading: false }),
  useDeleteContentItemMutate: () => ({ isLoading: false }),
  useBulkDeleteContentItemMutate: () => ({ isLoading: false }),
  useIntrospectRepositoryMutate: () => ({ isLoading: false }),
  useFetchGpgKey: () => ({ fetchGpgKey: () => '' }),
}));

jest.mock('../../middleware/AppContext', () => ({
  useAppContext: () => ({}),
}));

jest.mock('./components/AddContent/AddContent');

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  Outlet: () => <></>,
}));

(AddContent as jest.Mock).mockImplementation(() => 'Add Content');

it('expect ContentListTable to render with a loading skeleton', () => {
  (useRepositoryParams as jest.Mock).mockImplementation(() => ({ isLoading: false }));
  (useContentListQuery as jest.Mock).mockImplementation(() => ({ isLoading: false }));

  const { queryByText } = render(
    <ReactQueryTestWrapper>
      <ContentListTable />
    </ReactQueryTestWrapper>,
  );

  expect(queryByText('No custom repositories')).toBeInTheDocument();
  expect(queryByText('To get started, create a custom repository')).toBeInTheDocument();
});

it('Render a loading state', () => {
  (useRepositoryParams as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: testRepositoryParamsResponse,
  }));
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: true,
  }));

  const { queryByText, queryByLabelText } = render(
    <ReactQueryTestWrapper>
      <ContentListTable />
    </ReactQueryTestWrapper>,
  );

  expect(queryByText('Name/URL')).toBeInTheDocument();
  expect(queryByLabelText('Loading')).toBeInTheDocument();
});

it('Render with a single row', () => {
  (useRepositoryParams as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: testRepositoryParamsResponse,
  }));
  (useContentListQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [
        {
          account_id: 'undefined',
          distribution_arch: 'x86_64',
          distribution_versions: ['el7'],
          name: 'AwesomeNamewwyylse12',
          org_id: '13446804',
          url: 'https://google.ca/wwyylse12/x86_64/el7',
          uuid: '2375c35b-a67a-4ac2-a989-21139433c172',
          package_count: 0,
        },
      ],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  const { queryByText } = render(
    <ReactQueryTestWrapper>
      <ContentListTable />
    </ReactQueryTestWrapper>,
  );

  expect(queryByText('AwesomeNamewwyylse12')).toBeInTheDocument();
  expect(queryByText('https://google.ca/wwyylse12/x86_64/el7')).toBeInTheDocument();
});
