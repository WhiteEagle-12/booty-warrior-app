import { render, screen } from '@testing-library/react';

test('simple test to check jest runner', () => {
  render(<div>Hello World</div>);
  const element = screen.getByText(/Hello World/i);
  expect(element).toBeInTheDocument();
});
