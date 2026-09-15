import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/app-shell';
import { requireSystemAdmin } from '@/features/auth/authorization';
import { env } from '@/lib/env';
import '@/styles/tailadmin.css';

export const metadata: Metadata = {
  title: 'Administração — Café da Vez',
  description: 'Administração global do Café da Vez.',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireSystemAdmin();

  return (
    <html
      lang="pt-BR"
      data-app-environment={env.NEXT_PUBLIC_APP_ENV}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{const t=localStorage.getItem('theme');const d=t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch{}",
          }}
        />
      </head>
      <body>
        <AppShell
          user={{
            displayName: profile.displayName,
            email: profile.email,
            role: 'SYSTEM_ADMIN',
            systemAdmin: true,
          }}
        >
          {children}
        </AppShell>
      </body>
    </html>
  );
}
