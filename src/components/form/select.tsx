import { forwardRef, type ComponentPropsWithoutRef } from 'react';

type SelectProps = ComponentPropsWithoutRef<'select'>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ children, className = '', ...props }, ref) => (
    <select
      {...props}
      className={`h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs outline-none focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 ${className}`}
      ref={ref}
    >
      {children}
    </select>
  ),
);

Select.displayName = 'Select';
