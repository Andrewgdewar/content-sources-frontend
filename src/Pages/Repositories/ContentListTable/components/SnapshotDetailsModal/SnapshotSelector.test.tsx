import { render } from '@testing-library/react';
import { SnapshotSelector } from './SnapshotSelector';
import { useGetSnapshotList } from '../../../../../services/Content/ContentQueries';
import { defaultMetaItem, defaultSnapshotItem } from '../../../../../testingHelpers';
import { formatDateDDMMMYYYY } from '../../../../../helpers';

jest.mock('../../../../Hooks/useRootPath', () => () => 'someUrl');

jest.mock('../../../../services/Content/ContentQueries', () => ({
  useGetSnapshotList: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useParams: () => ({
    repoUUID: 'some-uuid',
  }),
}));

it('Render SnapshotSelector', () => {
  (useGetSnapshotList as jest.Mock).mockImplementation(() => ({
    data: {
      meta: defaultMetaItem,
      data: [defaultSnapshotItem],
    },
    isLoading: false,
    isFetching: false,
  }));

  const { getByText } = render(<SnapshotSelector />);

  // This is testing the date format specifically.
  // if we update the date format, this test needs updating as well.
  const selectorElement = getByText(formatDateDDMMMYYYY(defaultSnapshotItem.created_at, true));
  expect(selectorElement).toBeInTheDocument();
});
