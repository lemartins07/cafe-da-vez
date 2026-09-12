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
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16">
      <section className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <span className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
          Café da Vez
        </span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
          Entre pelo seu e-mail
        </h1>
        <p className="mt-3 leading-7 text-zinc-600">
          Enviaremos um link de acesso. Somente integrantes autorizados poderão
          entrar.
        </p>

        {sent === '1' ? (
          <p className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
            Se o e-mail estiver autorizado, o link chegará em alguns instantes.
          </p>
        ) : null}

        {error ? (
          <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {errorMessages[error] ?? 'Não foi possível concluir o acesso.'}
          </p>
        ) : null}

        <form action={requestMagicLink} className="mt-8 space-y-5">
          <label className="block text-sm font-medium text-zinc-800">
            E-mail corporativo
            <input
              autoComplete="email"
              className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 transition outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
              name="email"
              placeholder="voce@empresa.com"
              required
              type="email"
            />
          </label>
          <button
            className="w-full rounded-xl bg-zinc-900 px-5 py-3 font-semibold text-white transition hover:bg-zinc-700"
            type="submit"
          >
            Enviar link de acesso
          </button>
        </form>
      </section>
    </main>
  );
}
