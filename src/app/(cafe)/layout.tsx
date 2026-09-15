import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/app-shell';
import { requireActiveMember } from '@/features/auth/authorization';
import { env } from '@/lib/env';
import '@/styles/tailadmin.css';

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
  const { profile } = membership;

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
            role: membership.role,
            systemAdmin: profile.systemRole === 'SYSTEM_ADMIN',
          }}
        >
          {children}
        </AppShell>
      </body>
    </html>
  );
}
