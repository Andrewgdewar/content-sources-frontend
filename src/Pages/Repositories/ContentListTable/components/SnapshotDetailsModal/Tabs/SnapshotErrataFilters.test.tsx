import { fireEvent, render, waitFor } from '@testing-library/react';
import SnapshotErrataFilters from './SnapshotErrataFilters';
import { ContentOrigin } from '../../../../../../services/Content/ContentApi';

jest.mock('../../../../../middleware/AppContext', () => ({
  useAppContext: () => ({
    contentOrigin: ContentOrigin.EXTERNAL,
  }),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('../../../../../Hooks/useDebounce', () => (value) => value);

it('Render loading state (disabled)', () => {
  const { getByRole } = render(
    <SnapshotErrataFilters
      isLoading={true}
      setFilterData={() => null}
      filterData={{
        search: '',
        type: [],
        severity: [],
      }}
    />,
  );

  const filterInput = getByRole('textbox');
  expect(filterInput).toHaveAttribute('disabled');
});

it('Select a filter of each type and ensure chips are present', () => {
  const { queryByText, getByRole } = render(
    <SnapshotErrataFilters
      isLoading={false}
      setFilterData={() => null}
      filterData={{
        search: '',
        type: [],
        severity: [],
      }}
    />,
  );

  // Filter on Name / Synopsis
  const nameOrSynopsisFilter = getByRole('textbox');
  expect(nameOrSynopsisFilter).not.toHaveAttribute('disabled');
  fireEvent.change(nameOrSynopsisFilter, { target: { value: 'EPEL' } });

  // Select a Type item
  const optionMenu = document.getElementsByClassName('pf-v5-c-menu-toggle')[0];
  waitFor(() => fireEvent.click(optionMenu));
  const typeOption = queryByText('Type') as HTMLElement;
  expect(typeOption).toBeInTheDocument();
  fireEvent.click(typeOption);

  expect(queryByText('Filter by type')).toBeInTheDocument();
  const typeSelector = document.getElementsByClassName('pf-v5-c-menu-toggle')[1];
  fireEvent.click(typeSelector);
  const typeItem = queryByText('Security') as Element;
  expect(typeItem).toBeInTheDocument();
  fireEvent.click(typeItem);

  // Select a Severity item
  fireEvent.click(optionMenu);
  const severityOption = queryByText('Severity') as Element;
  expect(severityOption).toBeInTheDocument();
  fireEvent.click(severityOption);

  expect(queryByText('Filter by severity')).toBeInTheDocument();
  const severitySelector = document.getElementsByClassName('pf-v5-c-menu-toggle')[1];
  fireEvent.click(severitySelector);
  const severityItem = queryByText('Critical') as Element;
  expect(severityItem).toBeInTheDocument();
  fireEvent.click(severityItem);
  fireEvent.click(optionMenu);

  // Check all the chips are there
  expect(queryByText('EPEL')).toBeInTheDocument();
  expect(queryByText('Security')).toBeInTheDocument();
  expect(queryByText('Critical')).toBeInTheDocument();
});
