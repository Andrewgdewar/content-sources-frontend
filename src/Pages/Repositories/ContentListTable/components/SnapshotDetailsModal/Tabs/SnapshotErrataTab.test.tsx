import { fireEvent, render } from '@testing-library/react';
import { ContentOrigin } from 'services/Content/ContentApi';
import { useGetSnapshotErrataQuery } from 'services/Content/ContentQueries';
import { SnapshotErrataTab } from './SnapshotErrataTab';
import { defaultErrataItem } from 'testingHelpers';
import { capitalize } from 'lodash';

jest.mock('Hooks/useRootPath', () => () => 'someUrl');

jest.mock('services/Content/ContentQueries', () => ({
  useGetSnapshotErrataQuery: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useParams: () => ({
    repoUUID: 'some-uuid',
  }),
}));

jest.mock('middleware/AppContext', () => ({
  useAppContext: () => ({
    contentOrigin: ContentOrigin.CUSTOM,
  }),
}));

it('Render 1 item in errata list', () => {
  (useGetSnapshotErrataQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    isFetching: false,
    isError: false,
    data: {
      data: [defaultErrataItem],
      meta: { count: 1, limit: 20, offset: 0 },
    },
  }));

  const { queryByText } = render(<SnapshotErrataTab />);
  const expandableButton = document.getElementById('expandable-0');
  fireEvent.click(expandableButton as HTMLElement);

  expect(queryByText(defaultErrataItem.errata_id)).toBeInTheDocument();
  expect(queryByText(capitalize(defaultErrataItem.type))).toBeInTheDocument();
  expect(queryByText(defaultErrataItem.severity)).toBeInTheDocument();
  expect(queryByText('Reboot is not required')).toBeInTheDocument();
});
