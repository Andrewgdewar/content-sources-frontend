import { fireEvent, render } from '@testing-library/react';
import { testRepositoryParamsResponse } from '../../../../testingHelpers';
import TemplateFilters from './TemplateFilters';
import { useQueryClient } from 'react-query';

jest.mock('../../../middleware/AppContext', () => ({
  useAppContext: () => ({}),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('../../../Hooks/useDebounce', () => (value) => value);
jest.mock('react-query');

beforeAll(() => {
  (useQueryClient as jest.Mock).mockImplementation(() => ({
    getQueryData: () => testRepositoryParamsResponse,
  }));
});

it('Render loading state (disabled)', async () => {
  const { getByRole } = render(
    <TemplateFilters
      isLoading={true}
      setFilterData={() => null}
      filterData={{
        search: '',
        version: '',
        arch: '',
      }}
    />,
  );

  const filterInput = getByRole('textbox');
  expect(filterInput).toHaveAttribute('disabled');
});

it('Select a filter of each type and ensure chips are present', async () => {
  const { queryByText, getByRole, getByLabelText, queryAllByText } = render(
    <TemplateFilters
      setFilterData={() => null}
      filterData={{
        search: '',
        version: '',
        arch: '',
      }}
    />,
  );

  const filterInput = getByRole('textbox');
  expect(filterInput).not.toHaveAttribute('disabled');
  fireEvent.change(filterInput, { target: { value: 'EPEL' } });

  const optionMenu = getByLabelText('Options menu');
  fireEvent.click(optionMenu);

  // Select a Version item
  const versionOption = queryByText('Version') as Element;
  expect(versionOption).toBeInTheDocument();
  fireEvent.click(versionOption);

  const versionSelector = getByLabelText('filter version') as Element;
  expect(versionSelector).toBeInTheDocument();
  fireEvent.click(versionSelector);
  const versionItem = queryByText('el7') as Element;
  expect(versionItem).toBeInTheDocument();
  fireEvent.click(versionItem);

  fireEvent.click(optionMenu);

  // Select an architecture item
  const archOption = queryByText('Architecture') as Element;
  expect(archOption).toBeInTheDocument();
  fireEvent.click(archOption);

  const archSelector = getByLabelText('filter architecture') as Element;
  expect(archSelector).toBeInTheDocument();
  fireEvent.click(archSelector);

  const archItem = queryByText('aarch64') as Element;
  expect(archItem).toBeInTheDocument();
  fireEvent.click(archItem);

  fireEvent.click(optionMenu);
  // Check all the chips are there
  expect(queryByText('el7')).toBeInTheDocument();
  expect(queryAllByText('aarch64')).toHaveLength(2);
  expect(queryByText('EPEL')).toBeInTheDocument();
});
