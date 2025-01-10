import { render } from '@testing-library/react';
import UploadContent from './UploadContent';
import React from 'react';

jest.mock('Hooks/useRootPath', () => () => 'someUrl');

jest.mock('services/Content/ContentQueries', () => ({
  useAddUploadsQuery: () => ({ mutateAsync: jest.fn() }),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useParams: () => ({
    repoUUID: 'some-uuid',
  }),
}));

it('Render base upload modal', async () => {
  const realUseState = React.useState;

  jest
    .spyOn(React, 'useState')
    .mockImplementationOnce(() => realUseState([{ sha256: 'string', uuid: 'string' }] as unknown))
    .mockImplementationOnce(() => realUseState(true as unknown));

  const { queryByText } = render(<UploadContent />);

  expect(
    queryByText('Use the form below to upload content to your repository.'),
  ).toBeInTheDocument();

  expect(
    queryByText('Are you sure you want to quit without saving these changes?'),
  ).toBeInTheDocument();
});
