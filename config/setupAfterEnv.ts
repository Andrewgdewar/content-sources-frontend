import '@testing-library/jest-dom/jest-globals';
import '@testing-library/jest-dom';
import { jestPreviewConfigure } from 'jest-preview';

jestPreviewConfigure({ autoPreview: true });

// Add mocks here that will not need customization.
jest.mock('Hooks/useDebounce', () => (value) => value);
