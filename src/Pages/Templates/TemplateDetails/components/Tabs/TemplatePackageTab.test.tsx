import { render } from '@testing-library/react';

import { defaultPackageItem } from 'testingHelpers';
import TemplatePackageTab from './TemplatePackageTab';
import { useFetchTemplatePackages } from 'services/Templates/TemplateQueries';
import type { PackageItem } from 'services/Content/ContentApi';

const bananaUUID = 'banana-uuid';

jest.mock('react-router-dom', () => ({
  useParams: () => ({ templateUUID: bananaUUID }),
  useNavigate: jest.fn(),
  Outlet: () => <></>,
}));

jest.mock('dayjs', () => (value) => ({ fromNow: () => value }));

jest.mock('Hooks/useRootPath', () => () => 'someUrl');

jest.mock('react-query');

jest.mock('services/Templates/TemplateQueries', () => ({
  useFetchTemplatePackages: jest.fn(),
}));

(useFetchTemplatePackages as jest.Mock).mockImplementation(() => ({
  isLoading: false,
  isFetching: false,
  data: {
    data: new Array(15).fill(defaultPackageItem).map((item: PackageItem, index) => ({
      ...item,
      name: item.name + index,
    })),
    meta: { count: 15, limit: 20, offset: 0 },
  },
}));

it('expect TemplatePackageTab to render 15 items', async () => {
  const { queryByText } = render(<TemplatePackageTab />);

  // Ensure the first row renders
  expect(queryByText(defaultPackageItem.name + 0)).toBeInTheDocument();
  // Ensure the last row renders
  expect(queryByText(defaultPackageItem.name + 14)).toBeInTheDocument();
});

it('expect TemplatePackageTab to render blank state', async () => {
  (useFetchTemplatePackages as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    isFetching: false,
  }));

  const { queryByText } = render(<TemplatePackageTab />);

  expect(queryByText('No packages')).toBeInTheDocument();
  expect(
    queryByText('You may need to add repositories that contain packages.'),
  ).toBeInTheDocument();
});
