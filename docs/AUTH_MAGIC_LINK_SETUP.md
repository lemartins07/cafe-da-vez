# Configuração do magic link

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

## 4. Configurar o e-mail de magic link

Em **Authentication → Email Templates → Magic Link**, faça o link chegar ao
callback do aplicativo usando o token hash:

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

Antes de solicitar o link, o e-mail precisa existir em `AllowedEmail`. No banco
local, o seed cria contas fictícias para validar o fluxo. A forma de cadastrar o
primeiro administrador no Supabase será adicionada antes de testar o fluxo real.

## Validação

O fluxo estará pronto quando:

1. e-mail não autorizado receber uma resposta neutra e não criar sessão;
2. e-mail autorizado receber o link;
3. o callback criar ou atualizar `Profile` e `TeamMember`;
4. usuário anônimo voltar para `/login`;
5. integrante ativo acessar `/` e conseguir sair.
