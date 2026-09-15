import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/auth/actions/password-auth', () => ({
  signInWithPassword: vi.fn(),
  signUpWithPassword: vi.fn(),
}));

import { LoginForm } from './login-form';

const getSubmitButton = (name: string) =>
  screen.getAllByRole('button', { name: new RegExp(`^${name}$`) })[1];

afterEach(cleanup);

describe('LoginForm', () => {
  it('mostra erro apenas quando o próprio campo perde foco', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const email = screen.getByLabelText(/e-mail/i);
    expect(screen.queryByText('Informe seu e-mail.')).not.toBeInTheDocument();

    await user.click(email);
    await user.tab();

    expect(screen.getByText('Informe seu e-mail.')).toBeInTheDocument();
    expect(
      screen.queryByText('A senha deve ter pelo menos 8 caracteres.'),
    ).not.toBeInTheDocument();
  });

  it('exige confirmação de senha válida antes de liberar o cadastro', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getAllByRole('button', { name: 'Criar conta' })[0]);

    const email = screen.getByLabelText(/e-mail/i);
    const password = screen.getByLabelText(/^senha/i);
    const passwordConfirmation = screen.getByLabelText(/confirme sua senha/i);
    const submit = getSubmitButton('Criar conta');

    expect(submit).toBeDisabled();

    await user.type(email, 'ana@empresa.com');
    await user.tab();
    await user.type(password, 'senha-segura');
    await user.tab();
    await user.type(passwordConfirmation, 'senha-diferente');
    await user.tab();

    expect(screen.getByText('As senhas não coincidem.')).toBeInTheDocument();
    expect(submit).toBeDisabled();

    await user.clear(passwordConfirmation);
    await user.type(passwordConfirmation, 'senha-segura');
    await user.tab();

    expect(
      screen.queryByText('As senhas não coincidem.'),
    ).not.toBeInTheDocument();
    expect(submit).toBeEnabled();
  });

  it('alterna a visibilidade das senhas no login e no cadastro', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const loginPassword = screen.getByLabelText(/^senha/i);
    expect(loginPassword).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Mostrar senha' }));

    expect(loginPassword).toHaveAttribute('type', 'text');
    expect(
      screen.getByRole('button', { name: 'Ocultar senha' }),
    ).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getAllByRole('button', { name: 'Criar conta' })[0]);

    const signupPassword = screen.getByLabelText(/^senha/i);
    const passwordConfirmation = screen.getByLabelText(/confirme sua senha/i);

    await user.click(screen.getByRole('button', { name: 'Mostrar senha' }));
    await user.click(
      screen.getByRole('button', { name: 'Mostrar confirmação de senha' }),
    );

    expect(signupPassword).toHaveAttribute('type', 'text');
    expect(passwordConfirmation).toHaveAttribute('type', 'text');
  });
});
