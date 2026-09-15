# Configuração legada do magic link

> Este guia descreve o fluxo que está implantado no Preview em 13/09/2026, mas
> ele foi substituído no escopo do produto em 14/09/2026. Não o use para novas
> configurações. O fluxo desejado está em
> [AUTH_PASSWORD_AND_TEAM_SETUP.md](./AUTH_PASSWORD_AND_TEAM_SETUP.md).

O Café da Vez usa Supabase Auth com sessão em cookies e uma segunda camada de
autorização no banco da aplicação. Autenticar no Supabase não é suficiente: o
e-mail precisa existir em `AllowedEmail` e o integrante precisa estar ativo em
`TeamMember`.

## 1. Criar o projeto no Supabase

Crie inicialmente um projeto para desenvolvimento e Preview. No painel do
projeto, copie sem registrar valores neste documento:

- Project URL;
- Publishable key;
- connection string com pool para `DATABASE_URL`;
- connection string direta para `DIRECT_URL`.

## 2. Configurar o ambiente local

Preencha no `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
DATABASE_URL=
DIRECT_URL=
```

Nunca versione `.env.local`.

## 3. Configurar URLs do Auth

Em **Authentication → URL Configuration**, adicione:

```text
http://localhost:3000/**
https://*-leandro-martins-projects-a2887951.vercel.app/**
```

Quando o domínio de produção existir, use sua URL exata como **Site URL** e
adicione-a também à lista de redirects permitidos.

## 4. E-mail de magic link

O callback aceita o link padrão do Supabase. Não é necessário editar o template
para iniciar os testes. O SMTP padrão só envia para membros da organização do
Supabase e possui um limite baixo de mensagens.

Quando um SMTP próprio for configurado, o template pode apontar diretamente para
o callback usando o token hash:

```html
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">
  Entrar no Café da Vez
</a>
```

O callback troca o token por uma sessão armazenada em cookies.

## 5. Configurar a Vercel

Cadastre as quatro variáveis da seção 2 em **Settings → Environment Variables**
para o ambiente **Preview**. Não use as credenciais do banco local e não deixe
variáveis vazias cadastradas.

Depois de alterar variáveis, faça um novo deploy do Preview.

## 6. Autorizar o primeiro integrante

Antes de solicitar o link, aplique as migrations no banco do Supabase e cadastre
o administrador. No `.env.local`, informe sem versionar:

```dotenv
BOOTSTRAP_ADMIN_EMAIL=seu-email@empresa.com
BOOTSTRAP_TEAM_NAME=Café da Vez
```

Em seguida, execute:

```bash
npm run db:deploy
npm run db:bootstrap
```

O bootstrap pode ser executado novamente com segurança: ele reutiliza o time e
atualiza o e-mail informado para o papel `ADMIN`.

## Validação

O fluxo estará pronto quando:

1. e-mail não autorizado receber uma resposta neutra e não criar sessão;
2. e-mail autorizado receber o link;
3. o callback criar ou atualizar `Profile` e `TeamMember`;
4. usuário anônimo voltar para `/login`;
5. integrante ativo acessar `/` e conseguir sair.
