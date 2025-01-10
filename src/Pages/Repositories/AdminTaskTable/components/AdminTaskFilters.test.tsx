import { fireEvent, render, waitFor } from '@testing-library/react';
import AdminTaskFilters from './AdminTaskFilters';

jest.mock('middleware/AppContext', () => ({
  useAppContext: () => ({}),
}));

jest.mock('react-query');

it('Render loading state (disabled)', () => {
  const { getByRole } = render(
    <AdminTaskFilters
      isLoading={true}
      setFilterData={() => null}
      filterData={{
        statuses: [],
        accountId: '',
        orgId: '',
        typenames: [],
      }}
    />,
  );

  const filterInput = getByRole('textbox');
  expect(filterInput).toHaveAttribute('disabled');
});

it('Select a filter of each type and ensure chips are present', () => {
  const { queryByText, getByRole, getByLabelText } = render(
    <AdminTaskFilters
      setFilterData={() => null}
      filterData={{
        statuses: [],
        accountId: '',
        orgId: '',
        typenames: [],
      }}
    />,
  );

  // Enter an account ID item
  const accountIdInput = getByRole('textbox');
  expect(accountIdInput).not.toHaveAttribute('disabled');
  fireEvent.change(accountIdInput, { target: { value: '11593016' } });

  const optionMenu = getByRole('button', { name: 'filterSelectionDropdown' });

  waitFor(() => {
    fireEvent.click(optionMenu);
  });

  const orgIdOption = queryByText('Org ID') as Element;
  expect(orgIdOption).toBeInTheDocument();
  fireEvent.click(orgIdOption);

  // Enter an org ID item
  const orgIdInput = getByRole('textbox');
  expect(orgIdInput).not.toHaveAttribute('disabled');
  fireEvent.change(orgIdInput, { target: { value: '13446804' } });

  fireEvent.click(optionMenu);

  // Select a Status item
  const statusOption = queryByText('Status') as Element;
  expect(statusOption).toBeInTheDocument();
  fireEvent.click(statusOption);

  const statusSelector = getByLabelText('filter status') as Element;
  expect(statusSelector).toBeInTheDocument();
  fireEvent.click(statusSelector);

  const statusItem = queryByText('Running') as Element;
  expect(statusItem).toBeInTheDocument();
  fireEvent.click(statusItem);

  // Click the optionsButton to make the statusMenu disappear
  fireEvent.click(optionMenu);

  // Select a Type item
  const typeOption = queryByText('Type') as Element;
  expect(typeOption).toBeInTheDocument();
  fireEvent.click(typeOption);

  const typeSelector = getByLabelText('filter type') as Element;
  expect(typeSelector).toBeInTheDocument();
  fireEvent.click(typeSelector);

  const typeItem = queryByText('introspect') as Element;
  expect(typeItem).toBeInTheDocument();
  fireEvent.click(typeItem);

  // Click the optionsButton to make the typeMenu disappear
  fireEvent.click(optionMenu);

  // Check all the chips are there
  expect(queryByText('11593016')).toBeInTheDocument();
  expect(queryByText('13446804')).toBeInTheDocument();
  expect(queryByText('Running')).toBeInTheDocument();
  expect(queryByText('introspect')).toBeInTheDocument();
});
