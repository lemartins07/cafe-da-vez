'use client';

import { useActionState, useState } from 'react';
import { PasswordInput } from '@/components/form/password-input';
import { changeRequiredPassword } from '@/features/auth/actions/change-password';
import {
  initialLoginState,
  passwordChangeSchema,
} from '@/features/auth/login-schema';
import { LoginSubmitButton } from './login-submit-button';

type PasswordField = 'password' | 'passwordConfirmation';

export function ChangePasswordForm() {
  const [values, setValues] = useState<Record<PasswordField, string>>({
    password: '',
    passwordConfirmation: '',
  });
  const [errors, setErrors] = useState<Partial<Record<PasswordField, string>>>(
    {},
  );
  const [validated, setValidated] = useState<
    Partial<Record<PasswordField, boolean>>
  >({});
  const [state, formAction] = useActionState(
    changeRequiredPassword,
    initialLoginState,
  );

  const validate = (field: PasswordField) => {
    const result = passwordChangeSchema.safeParse(values);
    const fieldErrors = result.success
      ? undefined
      : result.error.flatten().fieldErrors;
    const error = fieldErrors?.[field]?.[0];
    setErrors((current) => ({ ...current, [field]: error }));
    setValidated((current) => ({ ...current, [field]: !error }));
  };

  const change = (field: PasswordField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setValidated((current) => ({ ...current, [field]: false }));

    if (field === 'password') {
      setErrors((current) => ({
        ...current,
        passwordConfirmation: undefined,
      }));
      setValidated((current) => ({
        ...current,
        passwordConfirmation: false,
      }));
    }
  };

  const canSubmit = validated.password && validated.passwordConfirmation;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.message ? (
        <div
          className="rounded-lg border border-error-200 bg-error-50 p-4 text-sm text-error-700 dark:border-error-500/20 dark:bg-error-500/10 dark:text-error-400"
          role="alert"
        >
          {state.message}
        </div>
      ) : null}

      <label
        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
        htmlFor="password"
      >
        Nova senha <span className="text-error-500">*</span>
        <PasswordInput
          aria-describedby={errors.password ? 'password-error' : undefined}
          aria-invalid={Boolean(errors.password)}
          autoComplete="new-password"
          error={Boolean(errors.password)}
          id="password"
          name="password"
          onBlur={() => validate('password')}
          onChange={(event) => change('password', event.target.value)}
          placeholder="No mínimo 8 caracteres"
          value={values.password}
          visibilityLabel="nova senha"
        />
        {errors.password ? (
          <span
            className="mt-1.5 block text-xs text-error-500"
            id="password-error"
          >
            {errors.password}
          </span>
        ) : null}
      </label>

      <label
        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
        htmlFor="passwordConfirmation"
      >
        Confirme a nova senha <span className="text-error-500">*</span>
        <PasswordInput
          aria-describedby={
            errors.passwordConfirmation
              ? 'password-confirmation-error'
              : undefined
          }
          aria-invalid={Boolean(errors.passwordConfirmation)}
          autoComplete="new-password"
          error={Boolean(errors.passwordConfirmation)}
          id="passwordConfirmation"
          name="passwordConfirmation"
          onBlur={() => validate('passwordConfirmation')}
          onChange={(event) =>
            change('passwordConfirmation', event.target.value)
          }
          placeholder="Repita a nova senha"
          value={values.passwordConfirmation}
          visibilityLabel="confirmação da nova senha"
        />
        {errors.passwordConfirmation ? (
          <span
            className="mt-1.5 block text-xs text-error-500"
            id="password-confirmation-error"
          >
            {errors.passwordConfirmation}
          </span>
        ) : null}
      </label>

      <LoginSubmitButton
        disabled={!canSubmit}
        label="Atualizar senha"
        pendingLabel="Atualizando..."
      />
    </form>
  );
}
