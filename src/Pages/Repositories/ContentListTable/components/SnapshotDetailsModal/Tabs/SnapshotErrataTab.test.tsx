import { fireEvent, render } from '@testing-library/react';
import { ContentOrigin, ErrataItem } from 'services/Content/ContentApi';
import { useGetSnapshotErrataQuery } from 'services/Content/ContentQueries';
import { SnapshotErrataTab } from './SnapshotErrataTab';

const errataItem: ErrataItem = {
  id: 'id',
  errata_id: 'errata id',
  title: 'errata title',
  summary: 'bugfix update',
  description: 'description',
  issued_date: '20 Aug 2014',
  updated_date: '25 Sep 2014',
  type: 'Bugfix',
  severity: 'important',
  reboot_suggested: false,
};

jest.mock('Hooks/useDebounce', () => (value) => value);

jest.mock('Hooks/useRootPath', () => () => 'someUrl');

jest.mock('services/Content/ContentQueries', () => ({
  useGetSnapshotErrataQuery: jest.fn(),
}));

jest.mock('Hooks/useDebounce', () => (value) => value);

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useParams: () => ({
    repoUUID: 'some-uuid',
  }),
}));

jest.mock('middleware/AppContext', () => ({
  useAppContext: () => ({
    contentOrigin: ContentOrigin.EXTERNAL,
  }),
}));

it('Render 1 item in errata list', () => {
  (useGetSnapshotErrataQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    data: {
      data: [errataItem],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  const { queryByText } = render(<SnapshotErrataTab />);

  const expandableButton = document.getElementById('expandable-0');
  fireEvent.click(expandableButton as HTMLElement);

  expect(queryByText(errataItem.errata_id)).toBeInTheDocument();
  expect(queryByText(errataItem.summary)).toBeInTheDocument();
  expect(queryByText(errataItem.type)).toBeInTheDocument();
  expect(queryByText(errataItem.severity)).toBeInTheDocument();
  expect(queryByText(errataItem.description)).toBeInTheDocument();
  expect(queryByText(errataItem.issued_date)).toBeInTheDocument();
  expect(queryByText(errataItem.updated_date)).toBeInTheDocument();
  expect(queryByText('Reboot is not required')).toBeInTheDocument();
});
