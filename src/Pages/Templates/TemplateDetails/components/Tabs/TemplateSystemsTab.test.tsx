import { render } from '@testing-library/react';
import { useListSystemsByTemplateId } from 'services/Systems/SystemsQueries';
import TemplateSystemsTab from './TemplateSystemsTab';
import { defaultTemplateSystemsListItem } from 'testingHelpers';
import type { IDSystemItem } from 'services/Systems/SystemsApi';
import { useAppContext } from 'middleware/AppContext';

const bananaUUID = 'banana-uuid';

jest.mock('react-router-dom', () => ({
  useParams: () => ({ templateUUID: bananaUUID }),
  useNavigate: jest.fn(),
  Outlet: () => <></>,
}));

jest.mock('dayjs', () => (value) => ({ fromNow: () => value }));

jest.mock('Hooks/useRootPath', () => () => 'someUrl');

jest.mock('react-query');

jest.mock('services/Systems/SystemsQueries', () => ({
  useListSystemsByTemplateId: jest.fn(),
  useDeleteTemplateFromSystems: () => ({ mutate: () => undefined, isLoading: false }),
}));

jest.mock('middleware/AppContext');

(useAppContext as jest.Mock).mockImplementation(() => ({
  rbac: { templateWrite: true },
  subscriptions: { red_hat_enterprise_linux: true },
}));

(useListSystemsByTemplateId as jest.Mock).mockImplementation(() => ({
  isLoading: false,
  isFetching: false,
  isError: false,
  data: {
    data: new Array(15).fill(defaultTemplateSystemsListItem).map((item: IDSystemItem, index) => ({
      ...item,
      inventory_id: item.inventory_id + index,
      attributes: {
        ...item.attributes,
        display_name: item.attributes.display_name + index,
      },
    })),
    meta: { total_items: 15, limit: 20, offset: 0 },
  },
}));

it('expect TemplateSystemsTab to render 15 items, with write permissions', async () => {
  const { queryByText, getByRole } = render(<TemplateSystemsTab />);

  // Ensure the first row renders
  expect(
    queryByText(defaultTemplateSystemsListItem.attributes.display_name + 0),
  ).toBeInTheDocument();

  // Ensure the first row has a checkbox
  expect(getByRole('checkbox', { name: 'Select row 0' })).toBeInTheDocument();

  // Ensure the last row renders
  expect(
    queryByText(defaultTemplateSystemsListItem.attributes.display_name + 14),
  ).toBeInTheDocument();
});

it('expect TemplateSystemsTab to render 15 items, read-only', async () => {
  (useAppContext as jest.Mock).mockImplementation(() => ({ rbac: { templateWrite: false } }));

  const { queryByText, getByRole, queryByRole, getAllByRole } = render(<TemplateSystemsTab />);

  // Ensure the first row renders
  expect(
    queryByText(defaultTemplateSystemsListItem.attributes.display_name + 0),
  ).toBeInTheDocument();

  // Ensure the first row does not have a checkbox
  expect(queryByRole('checkbox', { name: 'Select row 0' })).not.toBeInTheDocument();

  // Ensure top kebab is disabled.
  expect(getByRole('button', { name: 'Actions' })).toHaveAttribute('disabled');

  // Ensure the row kebab is disabled
  expect(getAllByRole('button', { name: 'Kebab toggle' })[0]).toHaveAttribute('disabled');

  // Ensure the last row renders
  expect(
    queryByText(defaultTemplateSystemsListItem.attributes.display_name + 14),
  ).toBeInTheDocument();
});

it('expect TemplateSystemsTab to render blank state', async () => {
  (useListSystemsByTemplateId as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    isFetching: false,
    isError: false,
  }));

  const { queryByText } = render(<TemplateSystemsTab />);

  expect(queryByText('No associated systems')).toBeInTheDocument();
  expect(queryByText('To get started, add this template to a system.')).toBeInTheDocument();
});
