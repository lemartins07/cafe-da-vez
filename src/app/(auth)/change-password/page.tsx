import { redirect } from 'next/navigation';
import { requireAuthenticatedUserForPasswordChange } from '@/features/auth/authorization';
import { ChangePasswordForm } from '@/features/auth/components/change-password-form';
import { LoginThemeToggle } from '@/features/auth/components/login-theme-toggle';

export default async function ChangePasswordPage() {
  const { profile } = await requireAuthenticatedUserForPasswordChange();
  if (!profile.mustChangePassword) {
    redirect(profile.systemRole === 'SYSTEM_ADMIN' ? '/admin' : '/');
  }

  return (
    <main className="relative flex min-h-screen bg-white dark:bg-gray-900">
      <section className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-5 sm:mb-8">
            <p className="mb-2 text-sm font-medium text-brand-500">
              Segurança da conta
            </p>
            <h1 className="mb-2 text-title-sm font-semibold text-gray-800 sm:text-title-md dark:text-white/90">
              Crie uma nova senha
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Você entrou com uma senha temporária. Defina uma senha pessoal
              antes de continuar.
            </p>
          </div>
          <ChangePasswordForm />
        </div>
      </section>

      <aside className="relative hidden min-h-screen w-1/2 items-center justify-center overflow-hidden bg-brand-950 px-12 lg:flex dark:bg-white/5">
        <div className="relative z-1 max-w-sm text-center">
          <span className="mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl bg-brand-500 text-4xl text-white shadow-theme-xl">
            ☕
          </span>
          <h2 className="text-3xl font-semibold text-white">Café da Vez</h2>
          <p className="mt-4 leading-7 text-gray-400 dark:text-white/60">
            Sua nova senha será usada nos próximos acessos.
          </p>
        </div>
      </aside>

      <div className="fixed right-6 bottom-6 z-50">
        <LoginThemeToggle />
      </div>
    </main>
  );
}
