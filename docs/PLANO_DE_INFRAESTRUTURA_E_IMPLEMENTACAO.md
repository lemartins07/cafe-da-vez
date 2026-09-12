# Plano de infraestrutura e implementação

## Objetivo

Preparar o **Café da Vez** para desenvolvimento colaborativo e deploy seguro,
mantendo a infraestrutura proporcional a uma ferramenta interna pequena.

Este documento complementa o [plano funcional](./PLANO_DO_APP.md). Seu foco é o
ambiente local, banco de dados, testes e fluxo de entrega.

## Decisões confirmadas

| Área             | Decisão                                                           |
| ---------------- | ----------------------------------------------------------------- |
| Aplicação        | Next.js 16, React 19, TypeScript e Tailwind CSS 4                 |
| Interface        | Componentes do TailAdmin; paleta corporativa será aplicada depois |
| Hospedagem       | Vercel                                                            |
| Banco local      | PostgreSQL em Docker Compose                                      |
| Banco hospedado  | PostgreSQL gerenciado pelo Supabase                               |
| ORM              | Prisma ORM                                                        |
| Autenticação     | Supabase Auth e lista de e-mails autorizados                      |
| Validação        | Zod no servidor                                                   |
| Testes unitários | Vitest e Testing Library                                          |
| Versionamento    | GitFlow simplificado                                              |
| CI/CD            | GitHub Actions e Vercel                                           |

Ficam fora do escopo inicial: Kubernetes, Terraform, Redis, staging permanente,
monitoramento externo e uma suíte extensa de testes end-to-end.

## Arquitetura

```text
Desenvolvimento local
├── Next.js executado com npm
├── PostgreSQL no Docker Compose
├── Prisma ORM
└── Vitest

GitHub
├── feature/* ou fix/* → pull request para develop
│                         ├── CI
│                         └── Preview da Vercel
└── develop → pull request para main
              ├── CI
              ├── prisma migrate deploy
              └── Vercel Production

Produção
├── Next.js na Vercel
├── Supabase Auth
└── PostgreSQL do Supabase
```

O filesystem da Vercel não será usado para persistência.

## Ambientes

### Local

- Next.js executado com `npm run dev`.
- PostgreSQL executado pelo Docker Compose.
- Prisma conectado por `DATABASE_URL`.
- Seed contendo somente dados fictícios.
- Projeto Supabase de desenvolvimento para autenticação.

A aplicação será executada fora do container para preservar um desenvolvimento
rápido. O Docker padronizará apenas o PostgreSQL.

### Preview

- Um Preview Deployment para cada pull request.
- Banco e autenticação do ambiente de desenvolvimento.
- Nenhuma credencial ou informação de produção.
- O preview funcionará como homologação inicial.

### Produção

- Deploy somente a partir de `main`.
- Projeto Supabase exclusivo de produção.
- Migrations executadas com `prisma migrate deploy`.
- Verificações obrigatórias antes da publicação.

Não haverá staging permanente inicialmente.

## Docker

O `compose.yaml` terá um serviço PostgreSQL com:

- versão principal compatível com produção;
- volume nomeado para persistência local;
- health check;
- usuário, senha, porta e banco configuráveis.

Comandos planejados:

```bash
npm run db:up
npm run db:down
npm run db:logs
npm run db:reset
```

O reset será documentado como destrutivo e atuará somente sobre o banco local. A
Vercel não utilizará imagens Docker.

## Prisma ORM

Estrutura:

```text
prisma/
├── schema.prisma
├── migrations/
└── seed.ts
```

O cliente compartilhado ficará em `src/lib/prisma.ts`, evitando conexões duplicadas
durante o hot reload.

Modelo inicial:

- `Profile`: perfil ligado ao identificador do Supabase Auth;
- `Team`: time;
- `TeamMember`: integrante, papel e estado;
- `Rotation`: fila de preparo ou compra;
- `RotationMember`: participantes e ordem;
- `TurnEvent`: histórico das ações;
- `AllowedEmail`: pessoas autorizadas a entrar.

O Prisma administrará apenas as tabelas da aplicação, nunca as tabelas internas do
Supabase Auth.

Fluxo das migrations:

```bash
# Desenvolvimento
npx prisma migrate dev

# CI
npx prisma generate

# Produção
npx prisma migrate deploy
```

`prisma db push` não será usado em produção. Alterações destrutivas serão evitadas;
primeiro adicionaremos a nova estrutura e somente depois removeremos a antiga.

O seed local criará um time, integrantes, duas filas e alguns eventos fictícios.

## Autenticação e autorização

O Supabase Auth comprovará a identidade. A aplicação verificará `AllowedEmail` ou
`TeamMember` antes de conceder acesso.

Papéis iniciais:

- `ADMIN`: gerencia integrantes e filas;
- `MEMBER`: consulta as filas e registra ações permitidas.

Não haverá cadastro público nem painel administrativo no primeiro momento. Os
e-mails autorizados poderão ser administrados diretamente no banco.

Todas as consultas do Prisma ocorrerão no servidor. Credenciais do banco e chaves
administrativas nunca serão enviadas ao navegador.

## GitFlow simplificado

Branches:

- `main`: código publicado em produção;
- `develop`: integração das próximas mudanças;
- `feature/<descricao>`: funcionalidades;
- `fix/<descricao>`: correções comuns;
- `hotfix/<descricao>`: correções urgentes criadas a partir de `main`.

Fluxo normal:

1. Criar `feature/*` ou `fix/*` a partir de `develop`.
2. Abrir pull request para `develop`.
3. Aguardar o CI e validar o preview.
4. Fazer merge após aprovação.
5. Abrir pull request de `develop` para `main` quando houver uma versão pronta.
6. O pipeline aplica migrations e publica em produção.

Hotfixes partem de `main` e retornam também para `develop`. Branches `release/*`
não serão usadas inicialmente.

`main` e `develop` deverão bloquear push direto e exigir CI aprovado. Uma revisão
será exigida quando houver outro integrante técnico disponível.

## Testes unitários

Vitest e Testing Library cobrirão principalmente:

- escolha do próximo integrante ativo;
- retorno ao início da fila;
- integrantes pausados;
- independência das filas de preparo e compra;
- idempotência por `requestId`;
- validação de ações inválidas;
- componentes com ações de concluir e pular.

As regras serão isoladas da interface e do Prisma, por exemplo:

```text
src/domain/rotation/
├── advance-rotation.ts
└── advance-rotation.test.ts
```

Scripts:

```bash
npm run test
npm run test:watch
npm run test:coverage
```

Não haverá meta percentual de cobertura no início. Todas as regras importantes da
rotação deverão possuir testes.

## Variáveis de ambiente

O `.env.example` documentará, sem valores reais:

```dotenv
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_ENV=
```

Separação:

| Contexto | Banco                       | Supabase Auth              |
| -------- | --------------------------- | -------------------------- |
| Local    | PostgreSQL Docker           | Projeto de desenvolvimento |
| Preview  | Supabase de desenvolvimento | Projeto de desenvolvimento |
| Produção | Supabase de produção        | Projeto de produção        |

As variáveis serão validadas com Zod. Arquivos `.env*`, exceto `.env.example`,
ficarão no `.gitignore`.

## CI

O arquivo `.github/workflows/ci.yml` será executado em pull requests e em pushes
para `develop` e `main`:

```text
npm ci
npx prisma generate
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

Node e npm terão versões fixadas. Um resultado inválido impedirá o merge.

## CD

### Preview

A integração GitHub–Vercel publicará um preview para cada pull request. Ele será
considerado válido quando o CI passar e o fluxo alterado for testado manualmente.

### Produção

O workflow de produção executará, em ordem:

1. verificações do CI;
2. `prisma migrate deploy` com o banco de produção;
3. build;
4. deploy na Vercel;
5. verificação de `/api/health`.

O deploy automático de produção da integração Vercel deverá ser ajustado para não
concorrer com esse workflow. A publicação usará Vercel CLI com os segredos:

- `VERCEL_TOKEN`;
- `VERCEL_ORG_ID`;
- `VERCEL_PROJECT_ID`.

Rollback do código será feito promovendo o último deployment estável da Vercel.
Problemas de banco serão corrigidos por uma nova migration, preservando dados.

## Plano de implementação

### Fase 1 — Fundação

1. [x] Fixar versões de Node e npm.
2. [x] Completar `.gitignore` e criar `.env.example`.
3. [x] Validar variáveis com Zod.
4. [x] Configurar Prettier e scripts de qualidade.
5. [x] Inicializar o Git e criar `main` e `develop`.
6. [x] Publicar `develop` e `main` no GitHub.
7. [ ] Proteger `develop` e `main` nas configurações do GitHub.

Concluída quando `npm ci`, lint, typecheck e build passarem em uma instalação limpa.

> Estado em 11/09/2026: a fundação local está pronta. O repositório Git foi
> inicializado, o primeiro commit foi criado em `main` e a branch `develop` está
> ativa. As duas branches foram publicadas no repositório privado
> `lemartins07/cafe-da-vez`. Resta configurar as regras de proteção no GitHub. O
> ESLint permanece temporariamente na linha 9 porque os plugins React do
> `eslint-config-next` 16.3.4 ainda não são compatíveis com ESLint 10.

### Fase 2 — Docker e Prisma

1. [x] Criar `compose.yaml` com PostgreSQL e volume.
2. [x] Instalar e configurar Prisma.
3. [x] Criar o modelo inicial e `src/lib/prisma.ts`.
4. [x] Criar migration e seed.
5. [x] Adicionar scripts `db:*`.

Concluída quando um banco vazio puder ser criado e populado somente pelos comandos
documentados, preservando dados após reiniciar o container.

> Validada em 12/09/2026 com Docker Desktop e WSL 2. O PostgreSQL iniciou com
> healthcheck saudável, a migration inicial e o seed foram aplicados e os dados
> permaneceram no volume após destruir e recriar o container. Antes e depois do
> reinício foram encontrados 3 perfis, 2 filas e 1 evento. Overrides temporários
> atualizam `deepmerge-ts` e `mysql2`, dependências internas do Prisma CLI,
> enquanto uma versão estável do Prisma com as correções não é publicada; eles
> devem ser removidos assim que o Prisma incorporar essas versões.

### Fase 2.5 — Separação do template

1. [x] Mover o código legado para `src/template`.
2. [x] Publicar o catálogo em `/template` e suas páginas em um catch-all dedicado.
3. [x] Criar layouts raiz separados para o produto e para o catálogo.
4. [x] Isolar os assets em `public/template/images`.
5. [x] Criar a estrutura inicial de `components` e `features` do produto.
6. [x] Impedir imports do template no código real por meio do ESLint.
7. [x] Validar `/`, `/template` e uma rota interna do catálogo em execução.

O template continua navegável, mas não faz parte da arquitetura do produto. Um
componente escolhido como referência deverá ser copiado e adaptado para as APIs
do Next.js antes de entrar no Café da Vez.

> Validado em 11/09/2026 com build de produção e smoke tests HTTP em `/`,
> `/template`, `/template/analytics` e `/template/images/logo/logo.svg`.

### Fase 3 — Autenticação privada

1. [ ] Configurar o projeto Supabase e suas credenciais.
2. [x] Configurar os clientes Supabase para browser, servidor e proxy.
3. [x] Criar login por magic link, callback e logout.
4. [x] Proteger rotas privadas.
5. [x] Verificar `AllowedEmail`/`TeamMember` pelo Prisma.
6. [ ] Cadastrar o primeiro administrador.
7. [ ] Testar usuário autorizado, não autorizado e anônimo.

Concluída quando somente um integrante ativo conseguir acessar a aplicação.

> Estado em 12/09/2026: escolhido magic link com Supabase Auth. A integração SSR,
> o callback PKCE, a proteção da aplicação e a autorização no Prisma estão
> implementados e passam no build. A configuração externa está documentada em
> `docs/AUTH_MAGIC_LINK_SETUP.md`; faltam o projeto Supabase, suas credenciais e o
> e-mail do primeiro administrador para executar os testes reais.

### Fase 4 — Regras e testes unitários

1. Extrair as regras da rotação para módulos de domínio.
2. Instalar e configurar Vitest e Testing Library.
3. Cobrir avanço, ciclo, salto, pausa e idempotência.
4. Adicionar testes dos componentes interativos essenciais.

Concluída quando `npm run test` passar sem depender de serviços externos.

### Fase 5 — CI, preview e GitFlow

1. Criar o workflow de CI.
2. Configurar proteção das branches.
3. Integrar GitHub e Vercel.
4. Separar variáveis de Preview e Production.
5. Validar uma pull request real de `feature/*` até `develop`.

Concluída quando uma falha bloquear o merge e uma PR válida gerar um preview.

### Fase 6 — Produção

1. Criar o Supabase de produção.
2. Configurar o projeto e segredos da Vercel.
3. Criar o workflow sequencial de migration e deploy.
4. Criar `/api/health`.
5. Publicar uma release de `develop` para `main`.
6. Testar o rollback da aplicação.

Concluída quando somente `main` publicar em produção e dados continuarem disponíveis
após um novo deploy.

### Fase 7 — Documentação

Atualizar o README com onboarding, comandos locais, migrations, GitFlow, ambientes,
deploy, rollback e manutenção da lista de e-mails autorizados.

## Ordem e dependências

```text
Fundação
├── Docker e Prisma → autenticação → funcionalidades
├── testes unitários
└── GitFlow e CI → preview → produção
```

O ambiente local pode ser preparado antes de decidir o provedor de login. O deploy
de produção depende do Prisma, CI e separação dos segredos.

## Definition of Done

- [x] `npm ci` instala o projeto de forma reproduzível.
- [x] PostgreSQL local inicia com um comando e mantém os dados.
- [x] Migrations e seed recriam um banco vazio.
- [ ] Nenhum segredo ou dado real está versionado.
- [ ] Somente e-mails autorizados acessam páginas privadas.
- [ ] Regras das filas possuem testes unitários.
- [ ] Formatação, lint, tipos, testes e build passam no CI.
- [ ] Push direto em `develop` e `main` está bloqueado.
- [ ] Cada pull request recebe um preview.
- [ ] Preview e produção usam dados e segredos separados.
- [ ] Produção executa `prisma migrate deploy` antes do deploy.
- [ ] Somente `main` publica em produção.
- [ ] `/api/health` é verificada depois da publicação.
- [ ] O rollback de código foi testado.
- [ ] O README permite que outra pessoa execute o projeto.

## Decisões pendentes

Antes da autenticação:

- Google Workspace, Microsoft 365 ou magic link;
- e-mail do primeiro administrador.

Antes da produção:

- contas proprietárias do GitHub, Supabase e Vercel;
- domínio final;
- pessoas autorizadas a publicar e administrar segredos;
- necessidade de aprovação manual do deploy.

Essas decisões não bloqueiam a configuração local, o Prisma ou os testes.
