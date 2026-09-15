'use client';

import { useActionState, useState } from 'react';
import { PasswordInput } from '@/components/form/password-input';
import { Modal } from '@/components/ui/modal';
import { resetAccountAccess } from '@/features/system-admin/actions/manage-system';
import {
  accessResetSchema,
  initialAdminActionState,
} from '@/features/system-admin/admin-schema';

type PasswordField = 'password' | 'passwordConfirmation';

export function ResetAccessModal({
  displayName,
  profileId,
}: {
  displayName: string;
  profileId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
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
  const [state, formAction, pending] = useActionState(
    resetAccountAccess,
    initialAdminActionState,
  );

  const validate = (field: PasswordField) => {
    const result = accessResetSchema.safeParse({ ...values, profileId });
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

  return (
    <>
      <button
        className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        Redefinir acesso
      </button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <form action={formAction} className="space-y-5">
          <div className="pr-12">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white/90">
              Redefinir acesso
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Defina uma senha temporária para {displayName}. A pessoa precisará
              trocá-la no próximo acesso.
            </p>
          </div>

          <input name="profileId" type="hidden" value={profileId} />
          <label
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
            htmlFor={`temporary-password-${profileId}`}
          >
            Senha temporária <span className="text-error-500">*</span>
            <PasswordInput
              aria-invalid={Boolean(errors.password)}
              autoComplete="new-password"
              error={Boolean(errors.password)}
              id={`temporary-password-${profileId}`}
              name="password"
              onBlur={() => validate('password')}
              onChange={(event) => change('password', event.target.value)}
              placeholder="No mínimo 8 caracteres"
              value={values.password}
              visibilityLabel="senha temporária"
            />
            {errors.password ? (
              <span className="mt-1.5 block text-xs text-error-500">
                {errors.password}
              </span>
            ) : null}
          </label>

          <label
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
            htmlFor={`temporary-password-confirmation-${profileId}`}
          >
            Confirme a senha <span className="text-error-500">*</span>
            <PasswordInput
              aria-invalid={Boolean(errors.passwordConfirmation)}
              autoComplete="new-password"
              error={Boolean(errors.passwordConfirmation)}
              id={`temporary-password-confirmation-${profileId}`}
              name="passwordConfirmation"
              onBlur={() => validate('passwordConfirmation')}
              onChange={(event) =>
                change('passwordConfirmation', event.target.value)
              }
              placeholder="Repita a senha temporária"
              value={values.passwordConfirmation}
              visibilityLabel="confirmação da senha temporária"
            />
            {errors.passwordConfirmation ? (
              <span className="mt-1.5 block text-xs text-error-500">
                {errors.passwordConfirmation}
              </span>
            ) : null}
          </label>

          {state.message ? (
            <p
              aria-live="polite"
              className={`text-sm ${
                state.status === 'error' ? 'text-error-500' : 'text-success-500'
              }`}
            >
              {state.message}
            </p>
          ) : null}

          <div className="flex w-full items-center justify-end gap-3">
            <button
              className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-300"
              disabled={
                pending ||
                !validated.password ||
                !validated.passwordConfirmation
              }
              type="submit"
            >
              {pending ? 'Redefinindo...' : 'Definir senha temporária'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
