import { render } from '@testing-library/react';
import DetailtItem from './DetaiItem';

it('expect DetailtItem to render empty state', () => {
  const { queryByText } = render(<DetailtItem title='Something' value='' />);

  expect(queryByText('Something')).not.toBeInTheDocument();
});

it('expect DetailtItem to render with a value', () => {
  const { queryByText } = render(<DetailtItem title='Something' value='with a value' />);

  expect(queryByText('Something')).toBeInTheDocument();
  expect(queryByText('Something')).toBeInTheDocument();
});
