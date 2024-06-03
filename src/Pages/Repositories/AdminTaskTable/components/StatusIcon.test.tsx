import { render } from '@testing-library/react';
import StatusIcon from './StatusIcon';

jest.mock('../../../middleware/AppContext', () => ({
  useAppContext: () => ({ rbac: { read: true, write: true } }),
}));

it('Render with Running status', () => {
  const { queryByText } = render(<StatusIcon status='running' />);

  const SelectComponent = queryByText('Running');
  expect(SelectComponent).toBeInTheDocument();
});

it('Render with Pending status', () => {
  const { queryByText } = render(<StatusIcon status='pending' />);
  const SelectComponent = queryByText('Pending');
  expect(SelectComponent).toBeInTheDocument();
});

it('Render with Failed status', () => {
  const { queryByText } = render(<StatusIcon status='failed' />);
  const SelectComponent = queryByText('Failed');
  expect(SelectComponent).toBeInTheDocument();
});

it('Render with Canceled status', () => {
  const { queryByText } = render(<StatusIcon status='canceled' />);
  const SelectComponent = queryByText('Canceled');
  expect(SelectComponent).toBeInTheDocument();
});

it('Render with Completed status', () => {
  const { queryByText } = render(<StatusIcon status='completed' />);
  const SelectComponent = queryByText('Completed');
  expect(SelectComponent).toBeInTheDocument();
});
