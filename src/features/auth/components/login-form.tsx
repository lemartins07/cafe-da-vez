'use client';

import { useActionState, useState } from 'react';
import { requestMagicLink } from '@/features/auth/actions/request-magic-link';
import { initialLoginState, loginSchema } from '@/features/auth/login-schema';
import { LoginSubmitButton } from './login-submit-button';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [clientError, setClientError] = useState<string>();
  const [submittedEmail, setSubmittedEmail] = useState<string>();
  const [state, formAction] = useActionState(
    requestMagicLink,
    initialLoginState,
  );
  const validation = loginSchema.safeParse({ email });
  const showActionMessage = submittedEmail === email && state.message;
  const emailError =
    clientError ??
    (submittedEmail === email ? state.fieldErrors?.email?.[0] : undefined);

  const validateEmail = (value: string) => {
    const result = loginSchema.safeParse({ email: value });
    setClientError(
      result.success
        ? undefined
        : result.error.flatten().fieldErrors.email?.[0],
    );
  };

  return (
    <form
      action={formAction}
      className="space-y-6"
      noValidate
      onSubmit={(event) => {
        if (!validation.success) {
          event.preventDefault();
          validateEmail(email);
          return;
        }

        setSubmittedEmail(email);
      }}
    >
      {showActionMessage ? (
        <div
          className={`rounded-lg border p-4 text-sm ${
            state.status === 'success'
              ? 'border-success-200 bg-success-50 text-success-700 dark:border-success-500/20 dark:bg-success-500/10 dark:text-success-400'
              : 'border-error-200 bg-error-50 text-error-700 dark:border-error-500/20 dark:bg-error-500/10 dark:text-error-400'
          }`}
          role={state.status === 'success' ? 'status' : 'alert'}
        >
          {showActionMessage}
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
          onBlur={() => validateEmail(email)}
          onChange={(event) => {
            const value = event.target.value;
            setEmail(value);
            validateEmail(value);
          }}
          placeholder="voce@empresa.com"
          type="email"
          value={email}
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

      <LoginSubmitButton disabled={!validation.success} />
    </form>
  );
}
