import { render } from '@testing-library/react';
import { ReactQueryTestWrapper } from '../../../testingHelpers';
import EmptyTableState from './EmptyTableState';

jest.mock('../../../services/Notifications/Notifications', () => ({
  useNotification: () => ({ notify: () => null }),
}));

it('Render with notFiltered is set to "true"', () => {
  const { queryByText } = render(
    <ReactQueryTestWrapper>
      <EmptyTableState notFiltered clearFilters={() => null} />
    </ReactQueryTestWrapper>,
  );

  expect(queryByText('No custom repositories')).toBeInTheDocument();
  expect(queryByText('To get started, create a custom repository')).toBeInTheDocument();
});

it('Render with notFiltered is set to "false"', () => {
  const { queryByText } = render(
    <ReactQueryTestWrapper>
      <EmptyTableState notFiltered={false} clearFilters={() => null} />
    </ReactQueryTestWrapper>,
  );

  expect(queryByText('No custom repositories match the filter criteria')).toBeInTheDocument();
  expect(queryByText('Clear all filters to show more results')).toBeInTheDocument();
  expect(queryByText('Clear all filters')).toBeInTheDocument();
});
