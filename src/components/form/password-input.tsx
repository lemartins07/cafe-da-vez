'use client';

import { forwardRef, type ComponentPropsWithoutRef, useState } from 'react';
import EyeCloseIcon from '@/components/icons/eye-close.svg';
import EyeIcon from '@/components/icons/eye.svg';

type PasswordInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'> & {
  error?: boolean;
  visibilityLabel: string;
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className = '', error = false, visibilityLabel, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const action = showPassword ? 'Ocultar' : 'Mostrar';

    return (
      <div className="relative">
        <input
          {...props}
          className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
            error
              ? 'border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:border-error-500 dark:text-error-400 dark:focus:border-error-800'
              : 'border-gray-300 bg-transparent text-gray-800 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800'
          } ${className}`}
          ref={ref}
          type={showPassword ? 'text' : 'password'}
        />
        <button
          aria-label={`${action} ${visibilityLabel}`}
          aria-pressed={showPassword}
          className="absolute top-1/2 right-4 z-30 -translate-y-1/2 cursor-pointer"
          onClick={() => setShowPassword((current) => !current)}
          type="button"
        >
          {showPassword ? (
            <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
          ) : (
            <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
          )}
        </button>
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
