import { render } from '@testing-library/react';

import { defaultSnapshotItem, defaultTemplateItem } from 'testingHelpers';
import TemplateRepositoriesTab from './TemplateRepositoriesTab';
import {
  useFetchTemplate,
  useFetchTemplateSnapshotsQuery,
} from 'services/Templates/TemplateQueries';
import type { SnapshotItem } from 'services/Content/ContentApi';

jest.mock('react-router-dom', () => ({
  useParams: () => ({ templateUUID: defaultTemplateItem.uuid }),
  useNavigate: jest.fn(),
  Outlet: () => <></>,
}));

jest.mock('dayjs', () => (value) => ({
  fromNow: () => value,
  format: () => value,
  isBefore: () => value,
}));

jest.mock('Hooks/useRootPath', () => () => 'someUrl');

jest.mock('react-query');

jest.mock('services/Templates/TemplateQueries', () => ({
  useFetchTemplateSnapshotsQuery: jest.fn(),
  useFetchTemplate: jest.fn(),
}));

(useFetchTemplateSnapshotsQuery as jest.Mock).mockImplementation(() => ({
  isLoading: false,
  isFetching: false,
  data: {
    data: new Array(15).fill(defaultSnapshotItem).map((item: SnapshotItem, index) => ({
      ...item,
      repository_name: item.repository_name + index,
    })),
    meta: { count: 15, limit: 20, offset: 0 },
  },
}));

(useFetchTemplate as jest.Mock).mockImplementation(() => ({
  isLoading: false,
  isFetching: false,
  data: defaultTemplateItem,
}));

it('expect TemplateRepositoriesTab to render 15 items', async () => {
  const { queryByText } = render(<TemplateRepositoriesTab />);

  // Ensure the first row renders
  expect(queryByText(defaultSnapshotItem.repository_name + 0)).toBeInTheDocument();
  // Ensure the last row renders
  expect(queryByText(defaultSnapshotItem.repository_name + 14)).toBeInTheDocument();
});

it('expect TemplateRepositoriesTab to render blank state', async () => {
  (useFetchTemplateSnapshotsQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    isFetching: false,
  }));

  const { queryByText } = render(<TemplateRepositoriesTab />);

  expect(queryByText('No repositories')).toBeInTheDocument();
  expect(queryByText('You may need to add repositories that have snapshots.')).toBeInTheDocument();
});
