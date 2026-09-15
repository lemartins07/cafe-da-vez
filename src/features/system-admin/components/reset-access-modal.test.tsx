import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/system-admin/actions/manage-system', () => ({
  resetAccountAccess: vi.fn(),
}));

import { ResetAccessModal } from './reset-access-modal';

afterEach(cleanup);

describe('ResetAccessModal', () => {
  it('abre o modal e exige confirmação da senha temporária', async () => {
    const user = userEvent.setup();
    render(
      <ResetAccessModal
        displayName="Ana"
        profileId="c12e79bb-86f5-4bb4-9c60-5508bdda8a1e"
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Redefinir acesso' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const password = screen.getByLabelText(/^senha temporária/i);
    const confirmation = screen.getByLabelText(/confirme a senha/i);
    const submit = screen.getByRole('button', {
      name: 'Definir senha temporária',
    });

    expect(submit).toBeDisabled();
    await user.type(password, 'senha-temporaria');
    await user.tab();
    await user.type(confirmation, 'senha-temporaria');
    await user.tab();

    expect(submit).toBeEnabled();
  });
});
