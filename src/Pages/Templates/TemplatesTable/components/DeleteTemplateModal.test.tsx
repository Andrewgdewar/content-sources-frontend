import { render } from '@testing-library/react';
import { ReactQueryTestWrapper, defaultSystemsListItem, defaultTemplateItem } from 'testingHelpers';

import DeleteTemplateModal from './DeleteTemplateModal';
import { useListSystemsByTemplateId } from 'services/Systems/SystemsQueries';

jest.mock('react-query', () => ({
  ...jest.requireActual('react-query'),
  useQueryClient: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useParams: () => ({
    templateUUID: `${defaultTemplateItem.uuid}`,
  }),
  useNavigate: () => jest.fn,
}));

jest.mock('Hooks/useRootPath', () => () => 'someUrl');

jest.mock('services/Systems/SystemsQueries', () => ({
  useListSystemsByTemplateId: jest.fn(),
}));

jest.mock('services/Templates/TemplateQueries', () => ({
  useDeleteTemplateItemMutate: () => ({ mutate: () => undefined, isLoading: false }),
}));

jest.mock('middleware/AppContext', () => ({ useAppContext: () => ({}) }));

it('Render delete modal where there are no systems', () => {
  (useListSystemsByTemplateId as jest.Mock).mockImplementation(() => ({
    data: {
      isLoading: false,
      data: [],
      count: 0,
    },
  }));

  const { queryByText } = render(
    <ReactQueryTestWrapper>
      <DeleteTemplateModal />
    </ReactQueryTestWrapper>,
  );

  expect(queryByText('This template is in use.')).toBeNull();
  expect(queryByText('Are you sure you want to remove this template?')).toBeInTheDocument();
});

it('Render delete modal where template has one system', () => {
  (useListSystemsByTemplateId as jest.Mock).mockImplementation(() => ({
    data: {
      isLoading: false,
      data: [defaultSystemsListItem],
      count: 1,
    },
  }));

  const { queryByText } = render(
    <ReactQueryTestWrapper>
      <DeleteTemplateModal />
    </ReactQueryTestWrapper>,
  );

  expect(queryByText('This template is in use.')).toBeInTheDocument();
  expect(queryByText('Are you sure you want to remove this template?')).toBeInTheDocument();
});
