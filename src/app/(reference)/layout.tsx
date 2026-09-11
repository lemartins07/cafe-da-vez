import type { Metadata } from 'next';
import { env } from '@/lib/env';
import '@/template/template.css';

export const metadata: Metadata = {
  title: 'TailAdmin — Referência',
  description: 'Catálogo visual usado como referência pelo Café da Vez.',
};

export default function ReferenceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" data-app-environment={env.NEXT_PUBLIC_APP_ENV}>
      <body className="dark:bg-gray-900">{children}</body>
    </html>
  );
}
