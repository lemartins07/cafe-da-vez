import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { LoginThemeToggle } from './login-theme-toggle';

afterEach(() => {
  document.documentElement.classList.remove('dark');
  localStorage.clear();
});

describe('LoginThemeToggle', () => {
  it('alterna o tema e persiste a preferência do usuário', async () => {
    const user = userEvent.setup();
    render(<LoginThemeToggle />);

    await user.click(screen.getByRole('button', { name: 'Alternar tema' }));

    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('theme')).toBe('dark');

    await user.click(screen.getByRole('button', { name: 'Alternar tema' }));

    expect(document.documentElement).not.toHaveClass('dark');
    expect(localStorage.getItem('theme')).toBe('light');
  });
});
