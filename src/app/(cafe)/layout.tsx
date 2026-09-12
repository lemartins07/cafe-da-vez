import type { Metadata } from 'next';
import { requireActiveMember } from '@/features/auth/authorization';
import { env } from '@/lib/env';
import { logout } from './auth-actions';
import './globals.css';

export const metadata: Metadata = {
  title: 'Café da Vez',
  description: 'Organize as vezes de preparar e comprar o café do time.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { membership } = await requireActiveMember();

  return (
    <html lang="pt-BR" data-app-environment={env.NEXT_PUBLIC_APP_ENV}>
      <body>
        <header className="flex items-center justify-end border-b border-zinc-200 bg-white px-6 py-3">
          <span className="mr-4 text-sm text-zinc-600">
            {membership.profile.displayName}
          </span>
          <form action={logout}>
            <button
              className="text-sm font-semibold text-zinc-900"
              type="submit"
            >
              Sair
            </button>
          </form>
        </header>
        {children}
      </body>
    </html>
  );
}
