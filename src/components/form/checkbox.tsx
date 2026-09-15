import type { ComponentPropsWithoutRef } from 'react';

type CheckboxProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'> & {
  label: string;
};

export function Checkbox({ checked, id, label, ...props }: CheckboxProps) {
  return (
    <label
      className="group flex cursor-pointer items-center gap-3"
      htmlFor={id}
    >
      <span className="relative size-5">
        <input
          {...props}
          checked={checked}
          className="size-5 cursor-pointer appearance-none rounded-md border border-gray-300 checked:border-transparent checked:bg-brand-500 focus:ring-3 focus:ring-brand-500/20 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700"
          id={id}
          type="checkbox"
        />
        {checked ? (
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            fill="none"
            height="14"
            viewBox="0 0 14 14"
            width="14"
          >
            <path
              d="m11.667 3.5-6.417 6.417L2.333 7"
              stroke="white"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.94"
            />
          </svg>
        ) : null}
      </span>
      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
        {label}
      </span>
    </label>
  );
}
