import Link from 'next/link';

const foundations = [
  'Aplicação Next.js com rotas nativas',
  'PostgreSQL local preparado com Docker',
  'Schema inicial gerenciado pelo Prisma',
] as const;

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="w-full max-w-2xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm sm:p-12">
        <span className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
          Café da Vez
        </span>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
          A base do aplicativo está pronta.
        </h1>

        <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-600">
          Esta é a área do produto real. As telas do TailAdmin agora vivem em um
          catálogo separado e continuam disponíveis para consulta durante o
          desenvolvimento.
        </p>

        <ul className="mt-8 space-y-3 text-sm text-zinc-700">
          {foundations.map((foundation) => (
            <li className="flex items-center gap-3" key={foundation}>
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-zinc-900"
              />
              {foundation}
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
            href="/template"
          >
            Abrir catálogo do template
          </Link>

          <span className="text-sm text-zinc-500">
            A identidade visual será aplicada depois.
          </span>
        </div>
      </section>
    </main>
  );
}
