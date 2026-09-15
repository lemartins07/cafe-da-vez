import type { ReactNode } from 'react';

type BadgeColor = 'error' | 'primary' | 'success' | 'warning';

const colors: Record<BadgeColor, string> = {
  error: 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500',
  primary:
    'bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400',
  success:
    'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500',
  warning:
    'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400',
};

export function Badge({
  children,
  color = 'primary',
}: {
  children: ReactNode;
  color?: BadgeColor;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-0.5 text-theme-xs font-medium ${colors[color]}`}
    >
      {children}
    </span>
  );
}
