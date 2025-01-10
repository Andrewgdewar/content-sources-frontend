import { fireEvent, render, waitFor } from '@testing-library/react';
import RepositoryQuickStart from './RepositoryQuickStart';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: jest.fn(),
}));

it('Confirm that RepositoryQuickStart is hidden if not inBeta', () => {
  (useChrome as jest.Mock).mockImplementation(() => ({
    isBeta: () => false,
    quickStarts: { activateQuickstart: () => new Promise((resolve) => resolve(undefined)) },
  }));
  const { queryByText } = render(
    <div>
      <RepositoryQuickStart />
    </div>,
  );

  // Confirm that the expansion panel does not exist
  expect(queryByText('Need help getting started with Preview features?')).not.toBeInTheDocument();
});

it('Confirm that QuickStart is shown, can be clicked, and then collapses', async () => {
  (useChrome as jest.Mock).mockImplementation(() => ({
    isBeta: () => true,
    quickStarts: { activateQuickstart: () => setTimeout(() => undefined, 0) },
  }));
  const { queryByText, getByLabelText } = render(
    <div>
      <RepositoryQuickStart />
    </div>,
  );

  const expansionToggle = getByLabelText('quickStart-expansion')?.firstChild;
  const linkButton = queryByText('Build an Image with Custom Content');

  // Confirm that the expansion panel exists and is open
  expect(expansionToggle).toBeInTheDocument();
  expect(expansionToggle).toHaveAttribute('aria-expanded', 'true');

  // Confirm that the linkButton exists and click it
  expect(linkButton).toBeInTheDocument();
  fireEvent.click(linkButton as Element);

  expect(linkButton).toHaveAttribute('aria-disabled', 'true');

  // As this is the loading state, the expansion panel will remain open
  expect(expansionToggle).toHaveAttribute('aria-expanded', 'true');

  // After the promise call completes, confirm that the expansion panel is closed.
  await waitFor(() => {
    expect(expansionToggle).toHaveAttribute('aria-expanded', 'false');
  });

  // Although the expansion panel is closed, the linkButton is still "on the dom" and hidden
  // Confirm that the link is not disabled for future interaction
  expect(linkButton).toHaveAttribute('aria-disabled', 'false');
});
