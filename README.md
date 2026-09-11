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

As variáveis de banco e autenticação poderão permanecer vazias até as fases de
Docker/Prisma e Supabase Auth, respectivamente. A configuração é validada com Zod
no servidor.

## Desenvolvimento local

```bash
npm ci
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

## Template base

O projeto foi iniciado a partir de
[`lemartins07/tailadmin-react-to-nextjs`](https://github.com/lemartins07/tailadmin-react-to-nextjs),
na branch `codex/migrar-tailwind-de-react-para-next.js`.

A base deriva do [TailAdmin](https://tailadmin.com) e inclui seu conjunto de
componentes premium. O uso desses componentes continua sujeito aos termos de
licenciamento aplicáveis do TailAdmin.
