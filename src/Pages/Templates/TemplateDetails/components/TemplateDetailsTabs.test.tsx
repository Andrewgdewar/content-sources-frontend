import { render } from '@testing-library/react';
import TemplateDetailsTabs from './TemplateDetailsTabs';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useLocation: () => ({
    pathname: '/templates/8b9f5062-5256-459a-9833-2b85b735225b/details/content/advisories',
  }),
}));

jest.mock('services/Templates/TemplateQueries', () => ({
  useDeleteTemplateItemMutate: () => ({ mutate: () => undefined, isLoading: false }),
}));

it('expect TemplateDetailsTabs to render all tabs, and have Advisories selected', () => {
  const { queryByText } = render(<TemplateDetailsTabs />);
  expect(queryByText('Packages')).toBeInTheDocument();
  expect(queryByText('Advisories')).toBeInTheDocument();
  expect(queryByText('Systems')).toBeInTheDocument();
  expect(queryByText('Advisories')!.closest('button')).toHaveAttribute('aria-selected', 'true');
  expect(queryByText('Repositories'))!.toBeInTheDocument();
});
