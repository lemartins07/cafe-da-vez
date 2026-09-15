import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/auth/actions/change-password', () => ({
  changeRequiredPassword: vi.fn(),
}));

import { ChangePasswordForm } from './change-password-form';

afterEach(cleanup);

describe('ChangePasswordForm', () => {
  it('libera a troca somente após validar senhas iguais no blur', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm />);

    const password = screen.getByLabelText(/^nova senha/i);
    const confirmation = screen.getByLabelText(/confirme a nova senha/i);
    const submit = screen.getByRole('button', { name: 'Atualizar senha' });

    expect(submit).toBeDisabled();
    await user.type(password, 'nova-senha-segura');
    await user.tab();
    await user.type(confirmation, 'senha-diferente');
    await user.tab();

    expect(screen.getByText('As senhas não coincidem.')).toBeInTheDocument();
    expect(submit).toBeDisabled();

    await user.clear(confirmation);
    await user.type(confirmation, 'nova-senha-segura');
    await user.tab();

    expect(submit).toBeEnabled();
  });
});
