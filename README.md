# Café da Vez

Aplicativo privado para organizar as filas de quem prepara e de quem compra o
café de um time.

## Estado atual

O repositório está na etapa de configuração da base:

- Next.js 16 com App Router e Webpack;
- React 19 e TypeScript;
- Tailwind CSS 4;
- componentes do TailAdmin preservados;
- rotas legadas do template funcionando por uma rota catch-all do Next.js;
- identidade visual e paleta corporativa ainda não aplicadas.

O escopo e as decisões de arquitetura estão em
[`docs/PLANO_DO_APP.md`](docs/PLANO_DO_APP.md). As decisões de infraestrutura e o
roteiro técnico estão em
[`docs/PLANO_DE_INFRAESTRUTURA_E_IMPLEMENTACAO.md`](docs/PLANO_DE_INFRAESTRUTURA_E_IMPLEMENTACAO.md).

## Pré-requisitos

- Node.js 24.18.0;
- npm 11.16.0.
- Docker Engine ou Docker Desktop com Docker Compose v2.

As versões estão registradas em `.nvmrc` e no `package.json`. Com NVM instalado:

```bash
nvm install
nvm use
```

## Configuração local

Crie o arquivo local de variáveis a partir do exemplo versionado:

```bash
cp .env.example .env.local
```

As credenciais presentes no exemplo são exclusivas do PostgreSQL local. As
variáveis do Supabase Auth poderão permanecer vazias até essa integração ser
configurada. A configuração é validada com Zod no servidor.

Instale as dependências e inicie o banco:

```bash
npm ci
npm run db:up
npm run db:deploy
npm run db:seed
```

O PostgreSQL ficará disponível em `localhost:5432`. O volume Docker mantém os
dados quando o container é parado ou reiniciado.

## Desenvolvimento local

```bash
npm run dev
```

A aplicação ficará disponível em `http://localhost:3000`.

## Verificações

```bash
npm run format:check
npm run lint
npm run typecheck
npm run build
```

Todas as verificações podem ser executadas em sequência com:

```bash
npm run quality
```

Para formatar o projeto:

```bash
npm run format
```

## Banco de dados

| Comando               | Ação                                               |
| --------------------- | -------------------------------------------------- |
| `npm run db:up`       | Inicia o PostgreSQL local e aguarda o healthcheck  |
| `npm run db:down`     | Para os containers e preserva os dados             |
| `npm run db:logs`     | Acompanha os logs do PostgreSQL                    |
| `npm run db:migrate`  | Cria e aplica migrations durante o desenvolvimento |
| `npm run db:deploy`   | Aplica migrations já versionadas                   |
| `npm run db:seed`     | Insere dados fictícios para desenvolvimento        |
| `npm run db:studio`   | Abre o Prisma Studio                               |
| `npm run db:generate` | Gera o Prisma Client                               |
| `npm run db:reset`    | Remove containers e o volume de dados local        |

> `npm run db:reset` é destrutivo e apaga somente os dados do PostgreSQL local
> deste projeto. Para recriá-los, execute `db:up`, `db:deploy` e `db:seed`.

Para alterar o modelo, edite `prisma/schema.prisma` e crie uma migration nomeada:

```bash
npm run db:migrate -- --name descricao_da_alteracao
```

Não use `prisma db push` em produção. A Vercel usará as URLs de conexão do
Supabase; o container Docker existe apenas no desenvolvimento local.

## Template base

O projeto foi iniciado a partir de
[`lemartins07/tailadmin-react-to-nextjs`](https://github.com/lemartins07/tailadmin-react-to-nextjs),
na branch `codex/migrar-tailwind-de-react-para-next.js`.

A base deriva do [TailAdmin](https://tailadmin.com) e inclui seu conjunto de
componentes premium. O uso desses componentes continua sujeito aos termos de
licenciamento aplicáveis do TailAdmin.
