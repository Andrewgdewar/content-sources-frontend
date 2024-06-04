import { render } from '@testing-library/react';
import { useAddTemplateContext } from '../AddTemplateContext';
import { defaultTemplateItem, testRepositoryParamsResponse } from 'testingHelpers';
import DefineContentStep from './DefineContentStep';

jest.mock('../AddTemplateContext', () => ({
  useAddTemplateContext: jest.fn(),
}));

it('expect DefineContentStep to render correctly', () => {
  (useAddTemplateContext as jest.Mock).mockImplementation(() => ({
    isEdit: false,
    templateRequest: defaultTemplateItem,
    setTemplateRequest: () => undefined,
    distribution_arches: testRepositoryParamsResponse.distribution_arches,
    distribution_versions: testRepositoryParamsResponse.distribution_versions,
  }));

  const { getByRole } = render(<DefineContentStep />);

  const archTextBox = getByRole('button', { name: defaultTemplateItem.arch });

  expect(archTextBox).toBeInTheDocument();
  expect(archTextBox).not.toHaveAttribute('disabled');

  const versionTextBox = getByRole('button', { name: 'el' + defaultTemplateItem.version });

  expect(versionTextBox).toBeInTheDocument();
  expect(versionTextBox).not.toHaveAttribute('disabled');
});

it('expect DefineContentStep to render with disabled inputs', () => {
  (useAddTemplateContext as jest.Mock).mockImplementation(() => ({
    isEdit: true,
    templateRequest: defaultTemplateItem,
    setTemplateRequest: () => undefined,
    distribution_arches: testRepositoryParamsResponse.distribution_arches,
    distribution_versions: testRepositoryParamsResponse.distribution_versions,
  }));

  const { getByRole } = render(<DefineContentStep />);

  const archTextBox = getByRole('button', { name: defaultTemplateItem.arch });

  expect(archTextBox).toBeInTheDocument();
  expect(archTextBox).toHaveAttribute('disabled');

  const versionTextBox = getByRole('button', { name: 'el' + defaultTemplateItem.version });

  expect(versionTextBox).toBeInTheDocument();
  expect(versionTextBox).toHaveAttribute('disabled');
});
