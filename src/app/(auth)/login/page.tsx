import { LoginForm } from '@/features/auth/components/login-form';
import { LoginThemeToggle } from '@/features/auth/components/login-theme-toggle';

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

const errorMessages: Record<string, string> = {
  'magic-link-disabled': 'Este link não é mais aceito. Entre usando sua senha.',
  unauthorized: 'Não foi possível validar sua sessão.',
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <main className="relative flex min-h-screen bg-white dark:bg-gray-900">
      <section className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex size-11 items-center justify-center rounded-xl bg-brand-500 text-xl text-white">
              ☕
            </span>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              Café da Vez
            </span>
          </div>

          <div className="mb-8">
            <p className="mb-2 text-sm font-medium text-brand-500">
              Organize o café do seu time
            </p>
            <h1 className="text-title-sm font-semibold text-gray-800 sm:text-title-md dark:text-white/90">
              Entre ou crie sua conta
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
              Use seu e-mail e senha. Depois, crie um time ou solicite entrada
              em um já existente.
            </p>
          </div>

          {error ? (
            <div
              className="mb-6 rounded-lg border border-error-200 bg-error-50 p-4 text-sm text-error-700 dark:border-error-500/20 dark:bg-error-500/10 dark:text-error-400"
              role="alert"
            >
              {errorMessages[error] ?? 'Não foi possível concluir o acesso.'}
            </div>
          ) : null}

          <LoginForm />

          <p className="mt-6 text-center text-xs leading-5 text-gray-400 sm:text-left">
            O cadastro não exige confirmação por e-mail. O acesso aos dados de
            cada time depende da aprovação de um administrador.
          </p>
        </div>
      </section>

      <aside className="relative hidden min-h-screen w-1/2 items-center justify-center overflow-hidden bg-brand-950 px-12 lg:flex dark:bg-white/5">
        <div className="absolute inset-0 [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:40px_40px] opacity-20 [mask-image:radial-gradient(circle_at_center,black,transparent_75%)]" />
        <div className="relative z-1 flex max-w-sm flex-col items-center text-center">
          <span className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-brand-500 text-4xl text-white shadow-theme-xl">
            ☕
          </span>
          <h2 className="text-3xl font-semibold text-white">Café da Vez</h2>
          <p className="mt-4 leading-7 text-gray-400 dark:text-white/60">
            A forma simples de organizar quem prepara e quem compra o próximo
            café do time.
          </p>
        </div>
      </aside>

      <div className="fixed right-6 bottom-6 z-50">
        <LoginThemeToggle />
      </div>
    </main>
  );
}
