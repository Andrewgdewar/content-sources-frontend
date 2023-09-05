import { act, fireEvent, render, waitFor } from '@testing-library/react';
import {
  defaultValidationErrorData,
  passingValidationErrorData,
  ReactQueryTestWrapper,
} from '../../../../testingHelpers';
import AddContent from './AddContent';
import {
  useAddContentQuery,
  useBulkDeleteContentItemMutate,
  useFetchGpgKey,
  useValidateContentList,
} from '../../../../services/Content/ContentQueries';

jest.mock('../../../../services/Content/ContentQueries', () => ({
  useAddContentQuery: jest.fn(),
  useValidateContentList: jest.fn(),
  useFetchGpgKey: jest.fn(),
  useBulkDeleteContentItemMutate: jest.fn(),
}));

(useFetchGpgKey as jest.Mock).mockImplementation(() => ({
  isLoading: false,
  fetchGpgKey: () => '',
}));

(useAddContentQuery as jest.Mock).mockImplementation(() => ({
  isLoading: false,
  mutateAsync: async () => null,
}));

(useBulkDeleteContentItemMutate as jest.Mock).mockImplementation(() => ({
  isLoading: false,
  mutateAsync: async () => null,
}));

jest.mock('../../../../Hooks/useDebounce', () => (value) => value);

jest.mock('../../../../Hooks/useRootPath', () => () => 'someUrl');

jest.mock('../../../../Hooks/useNotification', () => () => ({ notify: () => null }));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useOutletContext: () => () => null, // returns mock clearCheckedRepositories function
}));

const passingValidationMetaDataSigNotPresent = [
  {
    ...passingValidationErrorData[0],
    url: { ...passingValidationErrorData[0], metadata_signature_present: false },
  },
];

it('expect "name" input to show a validation error', async () => {
  (useValidateContentList as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    mutateAsync: async () => defaultValidationErrorData,
  }));

  const { queryByText, queryByPlaceholderText } = render(
    <ReactQueryTestWrapper>
      <AddContent />
    </ReactQueryTestWrapper>,
  );

  const nameInput = queryByPlaceholderText('Enter name');
  expect(nameInput).toBeInTheDocument();
  if (nameInput) {
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'b' } });
    });
  }
  waitFor(() => {
    expect(queryByText('Too Short!')).toBeInTheDocument();
  });
});

it('expect "url" input to show a validation error', async () => {
  (useValidateContentList as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    mutateAsync: async () => defaultValidationErrorData,
  }));

  const { queryByText, queryByPlaceholderText } = render(
    <ReactQueryTestWrapper>
      <AddContent />
    </ReactQueryTestWrapper>,
  );

  const urlInput = queryByPlaceholderText('https://');
  expect(urlInput).toBeInTheDocument();
  if (urlInput) {
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'bobTheBuilder' } });
    });
  }
  waitFor(() => {
    expect(queryByText('Invalid URL')).toBeInTheDocument();
  });
});

it('expect "Package and metadata verification" to be pre-selected', async () => {
  (useValidateContentList as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    mutateAsync: async () => passingValidationErrorData,
    data: passingValidationErrorData,
  }));

  const { queryByText, queryByPlaceholderText, queryByLabelText } = render(
    <ReactQueryTestWrapper>
      <AddContent />
    </ReactQueryTestWrapper>,
  );

  const urlInput = queryByPlaceholderText('https://');
  expect(urlInput).toBeInTheDocument();
  await act(async () => {
    fireEvent.change(urlInput as HTMLElement, { target: { value: 'https://bobTheBuilder.com' } });
  });
  waitFor(() => {
    expect(queryByText('Invalid URL')).not.toBeInTheDocument();
  });

  const gpgKeyInput = queryByPlaceholderText('Paste GPG key or URL here');
  expect(gpgKeyInput).toBeInTheDocument();
  await act(async () => {
    fireEvent.change(gpgKeyInput as HTMLElement, { target: { value: 'aRealGPGKey' } });
  });

  waitFor(() => {
    expect(queryByLabelText('Package and metadata verification')).toHaveAttribute('checked');
  });
});

it('expect "Package verification only" to be pre-selected', async () => {
  (useValidateContentList as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    mutateAsync: async () => passingValidationMetaDataSigNotPresent,
    data: passingValidationMetaDataSigNotPresent,
  }));

  const { queryByText, queryByPlaceholderText, queryByLabelText } = render(
    <ReactQueryTestWrapper>
      <AddContent />
    </ReactQueryTestWrapper>,
  );

  const urlInput = queryByPlaceholderText('https://');
  expect(urlInput).toBeInTheDocument();

  await act(async () => {
    fireEvent.change(urlInput as HTMLElement, { target: { value: 'https://bobTheBuilder.com' } });
  });
  expect(queryByText('Invalid URL')).not.toBeInTheDocument();
  const gpgKeyInput = queryByPlaceholderText('Paste GPG key or URL here');
  expect(gpgKeyInput).toBeInTheDocument();
  await act(async () => {
    fireEvent.change(gpgKeyInput as HTMLElement, { target: { value: 'aRealGPGKey' } });
  });
  waitFor(() => {
    expect(queryByText('Package verification only')).toBeInTheDocument();
    expect(queryByLabelText('Package verification only')).toHaveAttribute('checked');
  });
});

it('Add content', async () => {
  (useValidateContentList as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    mutateAsync: async () => passingValidationErrorData,
    data: passingValidationErrorData,
  }));

  const { queryByText, queryByPlaceholderText, queryAllByText } = render(
    <ReactQueryTestWrapper>
      <AddContent />
    </ReactQueryTestWrapper>,
  );

  const nameInput = queryByPlaceholderText('Enter name');
  expect(nameInput).toBeInTheDocument();
  const urlInput = queryByPlaceholderText('https://');
  expect(urlInput).toBeInTheDocument();
  const gpgKeyInput = queryByPlaceholderText('Paste GPG key or URL here');
  if (urlInput && nameInput && gpgKeyInput) {
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'superCoolName' } });
    });

    waitFor(() => {
      expect(nameInput).toHaveAttribute('value', 'superCoolName');
    });

    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://google.com/' } });
    });

    waitFor(() => {
      expect(urlInput?.getAttribute('value')).toBe('https://google.com/');
    });

    await act(async () => {
      fireEvent.change(gpgKeyInput, { target: { value: 'test GPG key' } });
    });

    waitFor(() => {
      expect(gpgKeyInput?.getAttribute('value')).toBe('test GPG key');
    });
  }

  expect(queryByText('Use GPG key for')).toBeInTheDocument();
  expect(queryByText('test GPG key')).toBeInTheDocument();

  expect(queryByText('Invalid URL')).not.toBeInTheDocument();
  const addAnotherButton = queryByText('Add another repository');
  waitFor(() => {
    expect(addAnotherButton?.getAttribute('aria-disabled')).toBe('false');
  });
  if (addAnotherButton) {
    await act(async () => {
      fireEvent.click(addAnotherButton);
    });
  }
  const secondRemoveButton = queryAllByText('Remove')[1];

  waitFor(() => {
    expect(secondRemoveButton).toBeInTheDocument();
  });

  if (secondRemoveButton) {
    await act(async () => {
      fireEvent.click(secondRemoveButton);
    });
  }

  const saveButton = queryByText('Save');
  waitFor(() => {
    expect(saveButton?.getAttribute('disabled')).toBeNull();
  });

  if (saveButton) {
    await act(async () => {
      fireEvent.click(saveButton);
    });
  }
  waitFor(() => {
    expect(queryByText('Add custom repository')).not.toBeInTheDocument();
  });
});
