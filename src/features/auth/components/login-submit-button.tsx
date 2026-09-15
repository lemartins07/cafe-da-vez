'use client';

import { useFormStatus } from 'react-dom';

export function LoginSubmitButton({
  disabled,
  label,
  pendingLabel,
}: {
  disabled: boolean;
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      className={`flex w-full items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:opacity-70 ${
        pending ? 'cursor-wait' : 'disabled:cursor-not-allowed'
      }`}
      disabled={disabled || pending}
      type="submit"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
