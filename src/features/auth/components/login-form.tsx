'use client';

import { useActionState, useState } from 'react';
import {
  signInWithPassword,
  signUpWithPassword,
} from '@/features/auth/actions/password-auth';
import {
  initialLoginState,
  loginSchema,
  signUpSchema,
} from '@/features/auth/login-schema';
import { PasswordInput } from '@/components/form/password-input';
import { LoginSubmitButton } from './login-submit-button';

type AuthMode = 'sign-in' | 'sign-up';
type FieldName = 'email' | 'password' | 'passwordConfirmation';
type FormValues = Record<FieldName, string>;
type SchemaFieldErrors = Partial<Record<FieldName, string[]>>;

const copy: Record<
  AuthMode,
  { action: typeof signInWithPassword; label: string; pendingLabel: string }
> = {
  'sign-in': {
    action: signInWithPassword,
    label: 'Entrar',
    pendingLabel: 'Entrando...',
  },
  'sign-up': {
    action: signUpWithPassword,
    label: 'Criar conta',
    pendingLabel: 'Criando conta...',
  },
};

const inputClass = (hasError: boolean) =>
  `mt-2 h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs outline-none placeholder:text-gray-400 focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
    hasError
      ? 'border-error-300 focus:border-error-300 focus:ring-error-500/10 dark:border-error-700'
      : 'border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800'
  }`;

function CredentialsForm({ mode }: { mode: AuthMode }) {
  const [values, setValues] = useState<FormValues>({
    email: '',
    password: '',
    passwordConfirmation: '',
  });
  const [clientErrors, setClientErrors] = useState<Partial<FormValues>>({});
  const [validated, setValidated] = useState<
    Partial<Record<FieldName, boolean>>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const content = copy[mode];
  const [state, formAction] = useActionState(content.action, initialLoginState);
  const fields: readonly FieldName[] =
    mode === 'sign-up'
      ? ['email', 'password', 'passwordConfirmation']
      : ['email', 'password'];
  const schema = mode === 'sign-up' ? signUpSchema : loginSchema;
  const canSubmit = fields.every((field) => validated[field]);

  const errorFor = (field: FieldName) =>
    clientErrors[field] ??
    (submitted ? state.fieldErrors?.[field]?.[0] : undefined);

  const validateField = (field: FieldName) => {
    const result = schema.safeParse(values);
    const fieldErrors = result.success
      ? undefined
      : (result.error.flatten().fieldErrors as SchemaFieldErrors);
    const error = fieldErrors?.[field]?.[0];

    setClientErrors((current) => ({ ...current, [field]: error }));
    setValidated((current) => ({ ...current, [field]: !error }));
  };

  const changeValue = (field: FieldName, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setClientErrors((current) => {
      const next = { ...current, [field]: undefined };
      if (field === 'password' && mode === 'sign-up') {
        next.passwordConfirmation = undefined;
      }
      return next;
    });
    setValidated((current) => {
      const next = { ...current, [field]: false };
      if (field === 'password' && mode === 'sign-up') {
        next.passwordConfirmation = false;
      }
      return next;
    });
    setSubmitted(false);
  };

  const emailError = errorFor('email');
  const passwordError = errorFor('password');
  const passwordConfirmationError = errorFor('passwordConfirmation');

  return (
    <form
      action={formAction}
      className="space-y-6"
      noValidate
      onSubmit={() => setSubmitted(true)}
    >
      {submitted && state.message ? (
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
        E-mail <span className="text-error-500">*</span>
        <input
          aria-describedby={emailError ? 'email-error' : undefined}
          aria-invalid={Boolean(emailError)}
          autoComplete="email"
          className={inputClass(Boolean(emailError))}
          id="email"
          name="email"
          onBlur={() => validateField('email')}
          onChange={(event) => changeValue('email', event.target.value)}
          placeholder="voce@empresa.com"
          type="email"
          value={values.email}
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

      <label
        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
        htmlFor="password"
      >
        Senha <span className="text-error-500">*</span>
        <PasswordInput
          aria-describedby={passwordError ? 'password-error' : undefined}
          aria-invalid={Boolean(passwordError)}
          autoComplete={
            mode === 'sign-in' ? 'current-password' : 'new-password'
          }
          error={Boolean(passwordError)}
          id="password"
          name="password"
          onBlur={() => validateField('password')}
          onChange={(event) => changeValue('password', event.target.value)}
          placeholder="No mínimo 8 caracteres"
          value={values.password}
          visibilityLabel="senha"
        />
        {passwordError ? (
          <span
            className="mt-1.5 block text-xs text-error-500"
            id="password-error"
          >
            {passwordError}
          </span>
        ) : null}
      </label>

      {mode === 'sign-up' ? (
        <label
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
          htmlFor="passwordConfirmation"
        >
          Confirme sua senha <span className="text-error-500">*</span>
          <PasswordInput
            aria-describedby={
              passwordConfirmationError
                ? 'password-confirmation-error'
                : undefined
            }
            aria-invalid={Boolean(passwordConfirmationError)}
            autoComplete="new-password"
            error={Boolean(passwordConfirmationError)}
            id="passwordConfirmation"
            name="passwordConfirmation"
            onBlur={() => validateField('passwordConfirmation')}
            onChange={(event) =>
              changeValue('passwordConfirmation', event.target.value)
            }
            placeholder="Repita a senha"
            value={values.passwordConfirmation}
            visibilityLabel="confirmação de senha"
          />
          {passwordConfirmationError ? (
            <span
              className="mt-1.5 block text-xs text-error-500"
              id="password-confirmation-error"
            >
              {passwordConfirmationError}
            </span>
          ) : null}
        </label>
      ) : null}

      <LoginSubmitButton
        disabled={!canSubmit}
        label={content.label}
        pendingLabel={content.pendingLabel}
      />
    </form>
  );
}

export function LoginForm() {
  const [mode, setMode] = useState<AuthMode>('sign-in');

  return (
    <>
      <div className="mb-6 grid grid-cols-2 rounded-lg bg-gray-100 p-1 text-sm font-medium dark:bg-white/5">
        <button
          className={`rounded-md px-3 py-2 transition ${
            mode === 'sign-in'
              ? 'bg-white text-gray-900 shadow-theme-xs dark:bg-gray-800 dark:text-white'
              : 'text-gray-500 dark:text-gray-400'
          }`}
          onClick={() => setMode('sign-in')}
          type="button"
        >
          Entrar
        </button>
        <button
          className={`rounded-md px-3 py-2 transition ${
            mode === 'sign-up'
              ? 'bg-white text-gray-900 shadow-theme-xs dark:bg-gray-800 dark:text-white'
              : 'text-gray-500 dark:text-gray-400'
          }`}
          onClick={() => setMode('sign-up')}
          type="button"
        >
          Criar conta
        </button>
      </div>
      <CredentialsForm key={mode} mode={mode} />
    </>
  );
}
