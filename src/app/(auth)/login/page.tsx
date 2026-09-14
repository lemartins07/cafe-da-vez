import { LoginSubmitButton } from '@/components/auth/login-submit-button';
import { LoginThemeToggle } from '@/components/auth/login-theme-toggle';
import { requestMagicLink } from './actions';

type LoginPageProps = {
  searchParams: Promise<{ error?: string; sent?: string }>;
};

const errorMessages: Record<string, string> = {
  'invalid-email': 'Informe um e-mail válido.',
  'invalid-link': 'Este link é inválido ou expirou.',
  'send-failed': 'Não foi possível enviar o link. Tente novamente.',
  unauthorized: 'Este e-mail não possui acesso ao Café da Vez.',
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, sent } = await searchParams;

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
              Acesso exclusivo do time
            </p>
            <h1 className="text-title-sm font-semibold text-gray-800 sm:text-title-md dark:text-white/90">
              Entre pelo seu e-mail
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
              Enviaremos um link de acesso seguro. Somente integrantes
              autorizados poderão entrar.
            </p>
          </div>

          {sent === '1' ? (
            <div
              className="mb-6 rounded-lg border border-success-200 bg-success-50 p-4 text-sm text-success-700 dark:border-success-500/20 dark:bg-success-500/10 dark:text-success-400"
              role="status"
            >
              Se o e-mail estiver autorizado, o link chegará em alguns
              instantes. Você já pode conferir sua caixa de entrada.
            </div>
          ) : null}

          {error ? (
            <div
              className="mb-6 rounded-lg border border-error-200 bg-error-50 p-4 text-sm text-error-700 dark:border-error-500/20 dark:bg-error-500/10 dark:text-error-400"
              role="alert"
            >
              {errorMessages[error] ?? 'Não foi possível concluir o acesso.'}
            </div>
          ) : null}

          <form action={requestMagicLink} className="space-y-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              E-mail corporativo <span className="text-error-500">*</span>
              <input
                autoComplete="email"
                autoFocus
                className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs outline-none placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                name="email"
                placeholder="voce@empresa.com"
                required
                type="email"
              />
            </label>
            <LoginSubmitButton />
          </form>

          <p className="mt-6 text-center text-xs leading-5 text-gray-400 sm:text-left">
            O link é temporário e pode ser usado somente uma vez.
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
