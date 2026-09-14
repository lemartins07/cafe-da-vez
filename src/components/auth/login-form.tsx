'use client';

import { useActionState } from 'react';
import {
  initialLoginState,
  requestMagicLink,
} from '@/app/(auth)/login/actions';
import { LoginSubmitButton } from './login-submit-button';

export function LoginForm() {
  const [state, formAction] = useActionState(
    requestMagicLink,
    initialLoginState,
  );
  const emailError = state.fieldErrors?.email?.[0];

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {state.message ? (
        <div
          className={`rounded-lg border p-4 text-sm ${
            state.status === 'success'
              ? 'border-success-200 bg-success-50 text-success-700 dark:border-success-500/20 dark:bg-success-500/10 dark:text-success-400'
              : 'border-error-200 bg-error-50 text-error-700 dark:border-error-500/20 dark:bg-error-500/10 dark:text-error-400'
          }`}
          role={state.status === 'success' ? 'status' : 'alert'}
        >
          {state.message}
        </div>
      ) : null}

      <label
        className="block text-sm font-medium text-gray-700 dark:text-gray-400"
        htmlFor="email"
      >
        E-mail corporativo <span className="text-error-500">*</span>
        <input
          aria-describedby={emailError ? 'email-error' : undefined}
          aria-invalid={emailError ? true : undefined}
          autoComplete="email"
          autoFocus
          className={`mt-2 h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs outline-none placeholder:text-gray-400 focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
            emailError
              ? 'border-error-300 focus:border-error-300 focus:ring-error-500/10 dark:border-error-700'
              : 'border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800'
          }`}
          id="email"
          name="email"
          placeholder="voce@empresa.com"
          type="email"
        />
        {emailError ? (
          <span
            className="mt-1.5 block text-xs text-error-500"
            id="email-error"
          >
            {emailError}
          </span>
        ) : null}
      </label>

      <LoginSubmitButton />
    </form>
  );
}
