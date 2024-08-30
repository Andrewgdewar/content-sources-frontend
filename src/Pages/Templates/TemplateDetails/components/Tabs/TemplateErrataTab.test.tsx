import { render } from '@testing-library/react';

import { defaultErrataItem } from 'testingHelpers';
import TemplateErrataTab from './TemplateErrataTab';
import { useFetchTemplateErrataQuery } from 'services/Templates/TemplateQueries';
import type { ErrataItem } from 'services/Content/ContentApi';

const bananaUUID = 'banana-uuid';

jest.mock('react-router-dom', () => ({
  useParams: () => ({ templateUUID: bananaUUID }),
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
  useFetchTemplateErrataQuery: jest.fn(),
}));

(useFetchTemplateErrataQuery as jest.Mock).mockImplementation(() => ({
  isLoading: false,
  isFetching: false,
  data: {
    data: new Array(15).fill(defaultErrataItem).map((item: ErrataItem, index) => ({
      ...item,
      errata_id: item.errata_id + index,
    })),
    meta: { count: 15, limit: 20, offset: 0 },
  },
}));

it('expect TemplateErrataTab to render 15 items', async () => {
  const { queryByText } = render(<TemplateErrataTab />);

  // Ensure the first row renders
  expect(queryByText(defaultErrataItem.errata_id + 0)).toBeInTheDocument();
  // Ensure the last row renders
  expect(queryByText(defaultErrataItem.errata_id + 14)).toBeInTheDocument();
});

it('expect TemplateErrataTab to render blank state', async () => {
  (useFetchTemplateErrataQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    isFetching: false,
  }));

  const { queryByText } = render(<TemplateErrataTab />);

  expect(queryByText('No advisories')).toBeInTheDocument();
  expect(
    queryByText('You may need to add repositories that contain advisories.'),
  ).toBeInTheDocument();
});
