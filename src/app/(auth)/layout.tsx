import type { Metadata } from 'next';
import './login/login.css';

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
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
