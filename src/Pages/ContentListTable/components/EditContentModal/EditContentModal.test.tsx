import {
  passingValidationErrorData,
  ReactQueryTestWrapper,
  testRepositoryParamsResponse,
} from '../../../../testingHelpers';
import EditContentModal from './EditContentModal';
import { act, fireEvent, render } from '@testing-library/react';
import { useValidateContentList } from '../../../../services/Content/ContentQueries';
import { useQueryClient } from 'react-query';

const singleEditValues = [
  {
    uuid: 'a68feaa3-9746-4719-8e33-3ff4688fed85',
    name: 'google',
    url: 'https://www.google.com',
    distribution_versions: ['7'],
    package_count: 24,
    distribution_arch: 'x86_64',
    status: 'Pending',
    last_introspection_error: '',
    account_id: '6414238',
    org_id: '13446804',
    gpg_key: 'test GPG key',
    metadata_verification: false,
  },
];

jest.mock('../../../../services/Content/ContentQueries', () => ({
  useEditContentQuery: () => ({ isLoading: false }),
  useValidateContentList: jest.fn(),
  useFetchGpgKey: () => ({ fetchGpgKey: () => '' }),
}));

jest.mock('react-query', () => ({
  ...jest.requireActual('react-query'),
  useQueryClient: jest.fn(),
}));

jest.mock('../../../../services/Notifications/Notifications', () => ({
  useNotification: () => ({ notify: () => null }),
}));

jest.mock('../../../../services/useDebounce', () => (value) => value);
jest.mock('../../../../middleware/AppContext', () => ({ useAppContext: () => ({}) }));

it('Open, confirming values, edit an item, enabling Save button', async () => {
  (useValidateContentList as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    mutateAsync: async () => passingValidationErrorData,
  }));
  (useQueryClient as jest.Mock).mockImplementation(() => ({
    getQueryData: () => testRepositoryParamsResponse,
  }));

  const { queryByText, queryByPlaceholderText, queryAllByLabelText } = render(
    <ReactQueryTestWrapper>
      <EditContentModal open values={singleEditValues} setClosed={() => undefined} />
    </ReactQueryTestWrapper>,
  );

  expect(
    queryByText('Edit by completing the form. Default values may be provided automatically.'),
  ).toBeInTheDocument();
  const NameTextfield = queryByPlaceholderText('Enter name');
  expect(NameTextfield).toBeInTheDocument();
  expect(NameTextfield).toHaveAttribute('value', singleEditValues[0].name);

  const UrlTextfield = queryByPlaceholderText('https://');
  expect(UrlTextfield).toBeInTheDocument();
  expect(UrlTextfield).toHaveAttribute('value', singleEditValues[0].url);
  expect(queryByText(singleEditValues[0].distribution_arch)).toBeInTheDocument();
  expect(queryByText('el7')).toBeInTheDocument();
  expect(queryByText('No changes')).toBeInTheDocument();
  const optionsMenuButton = queryAllByLabelText('Options menu')[1];
  expect(optionsMenuButton).toBeInTheDocument();
  if (optionsMenuButton) {
    await act(async () => {
      fireEvent.click(optionsMenuButton);
    });
  }
  expect(optionsMenuButton).toHaveAttribute('aria-expanded', 'true');
  const el8MenuSelect = queryByText('el8');
  if (el8MenuSelect) {
    await act(async () => {
      fireEvent.click(el8MenuSelect);
    });
  }
  expect(queryByText('test GPG key')).toBeInTheDocument();
  expect(queryByText('Package verification only')).toBeInTheDocument();
  expect(queryByText('Package and metadata verification')).toBeInTheDocument();
  expect(queryByText('No changes')).not.toBeInTheDocument();
  expect(queryByText('Save changes')).toBeInTheDocument();
});
