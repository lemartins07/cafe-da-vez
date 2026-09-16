import type { ComponentPropsWithoutRef } from 'react';

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  size?: 'sm' | 'md';
  variant?: 'primary' | 'outline' | 'warning';
};

const sizes = {
  sm: 'px-4 py-3 text-sm',
  md: 'px-5 py-3.5 text-sm',
};

const variants = {
  primary:
    'bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300',
  outline:
    'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300',
  warning:
    'bg-warning-500 text-white shadow-theme-xs hover:bg-warning-600 disabled:bg-warning-300',
};

export function Button({
  className = '',
  size = 'sm',
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition disabled:cursor-not-allowed disabled:opacity-60 ${sizes[size]} ${variants[variant]} ${className}`}
      type={type}
    />
  );
}
