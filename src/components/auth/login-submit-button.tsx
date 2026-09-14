'use client';

import { useFormStatus } from 'react-dom';

export function LoginSubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="flex w-full items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-wait disabled:opacity-70"
      disabled={disabled || pending}
      type="submit"
    >
      {pending ? 'Enviando link...' : 'Enviar link de acesso'}
    </button>
  );
}
