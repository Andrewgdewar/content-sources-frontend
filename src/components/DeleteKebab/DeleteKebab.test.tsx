import { render, fireEvent } from '@testing-library/react';
import DeleteKebab from './DeleteKebab';

jest.mock('middleware/AppContext', () => ({
  useAppContext: () => ({ rbac: { read: true, write: true } }),
}));

it('Render no checked repos', () => {
  const { queryByText } = render(
    <DeleteKebab
      atLeastOneRepoChecked={false}
      numberOfReposChecked={0}
      deleteCheckedRepos={() => null}
    />,
  );

  const kebab = document.getElementById('delete-kebab');
  fireEvent.click(kebab as Element);

  const deleteButton = queryByText('Remove selected repositories');
  expect(deleteButton).toHaveAttribute('aria-disabled', 'true');
});

it('Render with checked repos', () => {
  const repos = 100;
  const { queryByText } = render(
    <DeleteKebab
      atLeastOneRepoChecked={true}
      numberOfReposChecked={repos}
      deleteCheckedRepos={() => null}
    />,
  );

  const kebab = document.getElementById('delete-kebab');
  fireEvent.click(kebab as Element);

  const deleteButton = queryByText(`Remove ${repos} repositories`);
  expect(deleteButton).toHaveAttribute('aria-disabled', 'false');
});
