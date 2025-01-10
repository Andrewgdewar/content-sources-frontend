import { render } from '@testing-library/react';
import PackageCount from './PackageCount';
import { defaultContentItem } from 'testingHelpers';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

it('Render PackageCount for Invalid state', () => {
  const { queryByText } = render(
    <PackageCount rowData={{ ...defaultContentItem, status: 'Invalid' }} />,
  );

  expect(queryByText('N/A')).toBeInTheDocument();
});

it('Render PackageCount for Pending state', () => {
  const { queryByText } = render(
    <PackageCount rowData={{ ...defaultContentItem, package_count: 0 }} />,
  );

  expect(queryByText('N/A')).toBeInTheDocument();
});

it('Render PackageCount normally', () => {
  const { queryByText } = render(
    <PackageCount rowData={{ ...defaultContentItem, status: 'Valid' }} />,
  );

  expect(queryByText('100')).toBeInTheDocument();
});
