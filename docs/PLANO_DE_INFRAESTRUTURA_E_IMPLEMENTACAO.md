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
| Autenticação     | Supabase Auth por e-mail e senha, sem confirmação de e-mail       |
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
```

O cliente compartilhado ficará em `src/lib/prisma.ts`, evitando conexões duplicadas
durante o hot reload.

Modelo inicial:

- `Profile`: perfil ligado ao identificador do Supabase Auth;
- `Team`: time criado e administrado por seus integrantes;
- `TeamMember`: vínculo aprovado, papel e estado;
- `TeamJoinRequest`: solicitação pendente, aprovada ou recusada para entrar em
  um time;
- `Rotation`: fila de preparo ou compra;
- `RotationMember`: participantes e ordem;
- `TurnEvent`: histórico das ações;

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

O banco local permanecerá vazio após as migrations. Dados de demonstração não
serão incluídos no repositório nem inseridos automaticamente.

## Autenticação e autorização

O Supabase Auth comprovará a identidade por e-mail e senha. A opção de
confirmação de e-mail será desabilitada no projeto Supabase; portanto, o
cadastro cria uma conta apta a iniciar sessão sem depender de uma mensagem
externa.

A identidade não autoriza acesso a um time. A aplicação verificará um
`TeamMember` ativo antes de conceder acesso aos dados daquele time. Contas sem
vínculo ativo serão encaminhadas para a entrada de times, onde podem criar um
time ou consultar uma listagem pesquisável pelo nome para enviar uma
`TeamJoinRequest`. A listagem exibirá somente o nome do time.

Papéis iniciais:

- `ADMIN`: gerencia integrantes e filas;
- `MEMBER`: consulta as filas e registra ações permitidas.

Esses papéis pertencem a `TeamMember`. Separadamente, `Profile.systemRole`
possui `USER` e `SYSTEM_ADMIN`. O administrador do sistema acessa o painel
global para listar contas e times, desativar ou reativar times e redefinir
acessos com senha temporária. Esse papel não cria vínculo automático com times.

Qualquer pessoa que alcance o formulário poderá criar uma conta; isso não lhe
concede acesso a dados de terceiros. Administradores ativos gerenciam as
solicitações e integrantes apenas dos seus times, sempre no servidor. O último
administrador ativo de um time não poderá ser removido, pausado ou rebaixado.

A recuperação de senha não fará parte deste fluxo enquanto depender de envio de
e-mail externo. A política alternativa (por exemplo, redefinição assistida por
administrador) deve ser decidida antes da implementação.

### Migração do fluxo atual

O magic link e `AllowedEmail` existentes serão substituídos por uma migration
nova, sem alterar migrations já aplicadas. A ordem segura é:

1. criar `TeamJoinRequest` e os índices necessários;
2. publicar cadastro/login por senha, criação de time e aprovação de pedidos;
3. preservar `TeamMember` já existente como vínculo válido;
4. retirar o uso de `AllowedEmail`, o bootstrap por e-mail e o magic link;
5. em migration posterior, remover `AllowedEmail` depois de confirmar que não
   restam referências no código ou nos dados necessários.

Solicitações pendentes terão unicidade por pessoa e time. Em PostgreSQL, a
permissão de novos pedidos após uma recusa exige um índice único parcial para
apenas o estado `PENDING`; esse detalhe deverá ser incluído na migration SQL.

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
4. [x] Criar migration inicial.
5. [x] Adicionar scripts `db:*`.

Concluída quando um banco vazio puder ser criado somente pelos comandos
documentados, preservando o schema após reiniciar o container.

> Validada em 12/09/2026 com Docker Desktop e WSL 2. O PostgreSQL iniciou com
> healthcheck saudável e a migration inicial foram aplicados. Em 14/09/2026, o
> seed foi removido do projeto e os dados de demonstração foram apagados; novas
> instalações começam vazias. Overrides temporários atualizam `deepmerge-ts` e
> `mysql2`, dependências internas do Prisma CLI, enquanto uma versão estável do
> Prisma com as correções não é publicada; eles devem ser removidos assim que o
> Prisma incorporar essas versões.

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

### Fase 3 — Autenticação e entrada autônoma em times

1. [x] Configurar o projeto Supabase e as credenciais de Preview.
2. [x] Configurar os clientes Supabase para browser, servidor e proxy.
3. [x] Criar migration aditiva para solicitações de entrada e a estratégia de
       retirada de `AllowedEmail`.
4. [x] Habilitar cadastro e login por e-mail e senha sem confirmação de e-mail.
5. [x] Proteger rotas por `TeamMember` ativo e encaminhar contas sem vínculo à
       entrada de times.
6. [x] Permitir criar um time com o criador como `ADMIN` ativo.
7. [x] Permitir solicitar entrada, aprovar ou recusar solicitações de forma
       atômica e impedir a remoção do último administrador ativo.
8. [x] Cobrir schemas, regras de autorização e fluxos interativos relevantes com
       testes sem serviços externos.
9. [ ] Validar no Preview uma conta sem time, criador de time, pedido aprovado,
       pedido recusado e integrante pausado.

Concluída quando somente integrantes ativos acessarem os dados de um time, sem
que criação de conta, login ou entrada no time dependam de e-mail externo.

> Estado em 14/09/2026: a fase anterior, baseada em magic link e
> `AllowedEmail`, foi substituída por cadastro com senha, onboarding de times e
> solicitações aprovadas por administradores. A migration aditiva, o fluxo de
> código e os testes automatizados foram concluídos. Falta configurar a
> confirmação de e-mail no Supabase e validar o fluxo completo no Preview.

### Fase 3.5 — Shell da aplicação

1. [x] Adaptar o design system do TailAdmin para o CSS do produto.
2. [x] Criar sidebar e header responsivos sem dependência do React Router.
3. [x] Integrar o usuário autenticado e o logout ao menu de perfil.
4. [x] Preservar o tema claro/escuro e a preferência do usuário.
5. [x] Criar a navegação inicial de Início, Filas, Integrantes e Histórico.
6. [x] Validar visualmente o shell no Preview em desktop e dispositivo móvel.
7. [x] Adaptar a página de login ao mesmo design system.

Os componentes foram copiados conceitualmente do catálogo e adaptados em
`src/components/layout`; o produto não importa código de `src/template`. A
paleta continua sendo a original do TailAdmin até a definição da identidade
visual da empresa.

Concluída quando a navegação, responsividade, menu do usuário e os dois temas
forem validados no Preview.

> Validada no Preview em 13/09/2026. Login por magic link com Resend, validação
> do formulário, navegação, responsividade, menu do usuário e temas claro e
> escuro estão funcionando; a Fase 3.5 está concluída.

### Fase 4 — Regras e testes unitários

1. [x] Extrair as regras da rotação para módulos de domínio.
2. [x] Instalar e configurar Vitest e Testing Library.
3. [x] Cobrir avanço, ciclo, salto, pausa e idempotência.
4. [x] Adicionar testes dos componentes interativos essenciais.

Concluída quando `npm run test` passar sem depender de serviços externos.

> Concluída em 13/09/2026. O domínio puro em
> `src/features/rotations/domain` cobre a seleção da vez e o avanço da fila. A
> suíte Vitest roda sem serviços externos e inclui o schema de login e a
> alternância de tema como cobertura de interface. A persistência transacional
> das rotações será incluída junto da próxima funcionalidade de filas.

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
deploy, rollback, cadastro por senha e gestão de solicitações de entrada.

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
- [x] Migrations recriam um banco vazio.
- [ ] Nenhum segredo ou dado real está versionado.
- [ ] Cadastro e login por senha funcionam sem confirmação de e-mail.
- [ ] Somente integrantes ativos acessam dados de seus próprios times.
- [ ] Criação de time e aprovação de entrada são atômicas e auditáveis.
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

- política de recuperação de senha sem e-mail externo;

Antes da produção:

- contas proprietárias do GitHub, Supabase e Vercel;
- domínio final;
- pessoas autorizadas a publicar e administrar segredos;
- necessidade de aprovação manual do deploy.

Essas decisões não bloqueiam a configuração local, o Prisma ou os testes.
