import { fireEvent, render, waitFor } from '@testing-library/react';
import TemplateActionDropdown from './TemplateActionDropdown';
import { TEMPLATES_ROUTE } from 'Routes/constants';
import { ReactQueryTestWrapper } from 'testingHelpers';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useParams: () => ({ templateUUID: 'templateUUID' }),
  useLocation: () => ({ pathname: `/something/${TEMPLATES_ROUTE}/else` }),
}));

jest.mock('services/Templates/TemplateQueries', () => ({
  useDeleteTemplateItemMutate: () => ({ mutate: () => undefined, isLoading: false }),
}));

jest.mock('middleware/AppContext', () => ({
  useAppContext: () => ({
    rbac: { templateWrite: true },
    subscriptions: { red_hat_enterprise_linux: true },
  }),
}));

it('expect TemplateActionDropdown to render all buttons', async () => {
  const { queryByText } = render(
    <ReactQueryTestWrapper>
      <TemplateActionDropdown />
    </ReactQueryTestWrapper>,
  );

  expect(queryByText('Actions')).toBeInTheDocument();

  await waitFor(() => fireEvent.click(queryByText('Actions') as Element));
  expect(queryByText('Edit')).toBeInTheDocument();
  expect(queryByText('Delete')).toBeInTheDocument();
});
