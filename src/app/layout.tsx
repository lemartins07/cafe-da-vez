import type { Metadata } from 'next';
import { env } from '@/lib/env';
import '../index.css';

export const metadata: Metadata = {
  title: 'Café da Vez',
  description: 'Organize as vezes de preparar e comprar o café do time.',
};

export default function RootLayout({
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
