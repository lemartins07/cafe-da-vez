'use client';

import { useActionState } from 'react';
import { changeTeamStatus } from '@/features/system-admin/actions/manage-system';
import { initialAdminActionState } from '@/features/system-admin/admin-schema';

export function TeamStatusAction({
  status,
  teamId,
}: {
  status: 'ACTIVE' | 'DISABLED';
  teamId: string;
}) {
  const [state, formAction, pending] = useActionState(
    changeTeamStatus,
    initialAdminActionState,
  );
  const disabling = status === 'ACTIVE';

  return (
    <form action={formAction}>
      <input name="teamId" type="hidden" value={teamId} />
      <input
        name="status"
        type="hidden"
        value={disabling ? 'DISABLED' : 'ACTIVE'}
      />
      <button
        className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium shadow-theme-xs transition disabled:cursor-not-allowed disabled:opacity-50 ${
          disabling
            ? 'border border-error-300 bg-white text-error-600 hover:bg-error-50 dark:border-error-700 dark:bg-gray-800 dark:text-error-400'
            : 'bg-brand-500 text-white hover:bg-brand-600'
        }`}
        disabled={pending}
        type="submit"
      >
        {pending ? 'Salvando...' : disabling ? 'Desativar' : 'Reativar'}
      </button>
      {state.message ? (
        <span
          aria-live="polite"
          className={`mt-1 block text-xs ${
            state.status === 'error' ? 'text-error-500' : 'text-success-500'
          }`}
        >
          {state.message}
        </span>
      ) : null}
    </form>
  );
}
