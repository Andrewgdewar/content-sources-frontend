import { fireEvent, render } from '@testing-library/react';
import { AddRepo } from './AddRepo';
import { useAppContext } from 'middleware/AppContext';

jest.mock('middleware/AppContext', () => ({
  useAppContext: jest.fn(),
}));

it('Render enabled with snapshots enabled', () => {
  (useAppContext as jest.Mock).mockImplementation(() => ({
    features: {
      snapshots: {
        enabled: true,
        accessible: true,
      },
    },
  }));

  const addRepo = jest.fn();

  const { queryByText } = render(<AddRepo isDisabled={false} addRepo={addRepo} />);

  const addWithSnapshot = queryByText('Add') as Element;
  expect(addWithSnapshot).toBeInTheDocument();
  fireEvent.click(addWithSnapshot);

  // One argument
  expect(addRepo.mock.calls).toHaveLength(1);
  // Called with snapshot = true
  expect(addRepo.mock.calls[0][0]).toBe(true);

  const toggle = document.getElementById('toggle-add') as Element;
  expect(toggle).toBeInTheDocument();
  fireEvent.click(toggle);

  const addWithoutSnapshot = queryByText('Add without snapshotting') as Element;
  expect(addWithoutSnapshot).toBeInTheDocument();
  fireEvent.click(addWithoutSnapshot);

  expect(addRepo.mock.calls).toHaveLength(2);
  expect(addRepo.mock.calls[1][0]).toBe(false);
});

it('Render disabled with snapshots enabled', () => {
  (useAppContext as jest.Mock).mockImplementation(() => ({
    features: {
      snapshots: {
        enabled: true,
        accessible: true,
      },
    },
  }));

  const addRepo = jest.fn();

  render(<AddRepo isDisabled={true} addRepo={addRepo} />);

  expect(document.getElementById('toggle-add') as Element).toHaveAttribute('disabled');
});

it('Render enabled with snapshots disabled', () => {
  (useAppContext as jest.Mock).mockImplementation(() => ({
    features: {
      snapshots: {
        enabled: false,
        accessible: false,
      },
    },
  }));

  const addRepo = jest.fn();

  const { queryByText } = render(<AddRepo isDisabled={false} addRepo={addRepo} />);

  const addWithSnapshot = queryByText('Add') as Element;
  expect(addWithSnapshot).toBeInTheDocument();
  fireEvent.click(addWithSnapshot);

  expect(addRepo.mock.calls).toHaveLength(1);
  expect(addRepo.mock.calls[0][0]).toBe(false);
});

it('Render disabled with snapshots disabld', () => {
  (useAppContext as jest.Mock).mockImplementation(() => ({
    features: {
      snapshots: {
        enabled: false,
        accessible: false,
      },
    },
  }));

  const addRepo = jest.fn();

  const { queryByText } = render(<AddRepo isDisabled={true} addRepo={addRepo} />);

  expect(queryByText('Add')).toHaveAttribute('disabled');
});
