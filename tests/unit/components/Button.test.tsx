import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderWithProviders, screen, userEvent } from '../../helpers/test-utils';

/**
 * Example Button component for testing
 */
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

function Button({ children, onClick, disabled = false, variant = 'primary' }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
      data-testid="test-button"
    >
      {children}
    </button>
  );
}

describe('Button Component', () => {
  it('should render button with text', () => {
    renderWithProviders(<Button>Click me</Button>);

    const button = screen.getByTestId('test-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');
  });

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByTestId('test-button');
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<Button onClick={handleClick} disabled>Click me</Button>);

    const button = screen.getByTestId('test-button');
    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should apply correct variant class', () => {
    const { rerender } = renderWithProviders(<Button variant="primary">Primary</Button>);

    let button = screen.getByTestId('test-button');
    expect(button).toHaveClass('btn-primary');

    rerender(<Button variant="secondary">Secondary</Button>);

    button = screen.getByTestId('test-button');
    expect(button).toHaveClass('btn-secondary');
  });

  it('should be disabled when disabled prop is true', () => {
    renderWithProviders(<Button disabled>Disabled</Button>);

    const button = screen.getByTestId('test-button');
    expect(button).toBeDisabled();
  });

  it('should have correct accessibility attributes', () => {
    renderWithProviders(<Button>Accessible Button</Button>);

    const button = screen.getByTestId('test-button');
    expect(button).toHaveAttribute('type', 'button');
  });
});

