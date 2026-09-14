type PagePlaceholderProps = {
  description: string;
  title: string;
};

export function PagePlaceholder({ description, title }: PagePlaceholderProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="text-sm font-medium text-brand-500">Café da Vez</p>
      <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </section>
  );
}
