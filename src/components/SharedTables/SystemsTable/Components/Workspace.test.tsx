import { render } from '@testing-library/react';
import Workspace from './Workspace';

jest.mock('Hooks/useRootPath', () => () => '/someUrl');

it('Render no workspace', () => {
  const { queryByText } = render(<Workspace workspace={[]} />);
  expect(queryByText('No workspace')).toBeInTheDocument();
});

it('Render workspace', () => {
  const { queryByText } = render(<Workspace workspace={[{ id: 'steve1', name: 'Steve' }]} />);

  const aTag = queryByText('Steve');
  expect(aTag).toBeInTheDocument();
  expect(aTag).toHaveAttribute('href', 'someUrlinventory/workspaces/steve1');
});
