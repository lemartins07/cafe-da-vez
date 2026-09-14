import type { Metadata } from 'next';
import '@/styles/tailadmin.css';

export const metadata: Metadata = {
  title: 'Entrar — Café da Vez',
  description: 'Acesso privado ao Café da Vez.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{const t=localStorage.getItem('theme');const d=t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch{}",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
