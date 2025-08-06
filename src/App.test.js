import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Project Overload title', async () => {
  render(<App />);
  const linkElement = await screen.findByText(/Project Overload/i);
  expect(linkElement).toBeInTheDocument();
});
