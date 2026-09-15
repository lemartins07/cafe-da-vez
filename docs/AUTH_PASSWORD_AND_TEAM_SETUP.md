# Cadastro por senha e entrada em times

Este é o fluxo-alvo de autenticação do Café da Vez. Ele substitui magic link,
`AllowedEmail`, convites por e-mail e o bootstrap de administrador por e-mail.
O motivo é operacional: e-mails pessoais são bloqueados no trabalho e o e-mail
corporativo não recebe mensagens externas.

## Configuração do Supabase Auth

1. Mantenha o provedor de e-mail habilitado no Supabase Auth.
2. Habilite cadastro e login por e-mail e senha.
3. Desabilite **Confirm email** para que o cadastro não envie nem exija um
   e-mail de confirmação.
4. Mantenha as URLs de redirecionamento locais, Preview e produção configuradas
   para a sessão SSR, mesmo sem callback de magic link.
5. Configure `SUPABASE_SECRET_KEY` somente no servidor para a redefinição
   assistida de senhas. Nunca use o prefixo `NEXT_PUBLIC_` nessa variável.

Desabilitar a confirmação de e-mail reduz a garantia de que o endereço pertence
à pessoa cadastrada. Isso é aceitável para este caso somente porque a aprovação
de entrada pelo administrador permanece obrigatória e limita o acesso a cada
time.

## Fluxos esperados

### Cadastro e login

- O cadastro recebe e-mail e senha, valida os dados no servidor e usa o
  Supabase Auth para criar a conta.
- O login recebe e-mail e senha e cria a sessão em cookies.
- Uma conta autenticada não recebe dados de um time até ter um `TeamMember`
  ativo.
- Senhas nunca são incluídas em `Profile`, Prisma, logs, Server Action state ou
  mensagens de erro.

### Criação de time

Após o primeiro login, uma conta sem time pode criar um. Em uma transação, a
aplicação cria o `Team`, cria ou atualiza o `Profile` e cria o `TeamMember` do
criador com `role = ADMIN` e `status = ACTIVE`.

### Solicitação e aprovação

1. Uma conta autenticada consulta a listagem de times, filtra pelo nome e envia
   uma solicitação de entrada.
2. A aplicação cria uma `TeamJoinRequest` pendente, sem criar `TeamMember`.
3. Um administrador ativo do mesmo time aprova ou recusa o pedido.
4. Na aprovação, a solicitação é resolvida e o `TeamMember` é criado ou
   atualizado como `MEMBER` ativo na mesma transação.
5. Na recusa, a solicitação é resolvida sem criar vínculo.

O servidor deve conferir a identidade, o time, o estado da solicitação e o
papel do decisor em todas as ações. A interface não é fonte de autorização.

### Descoberta de times

A listagem e a busca por nome estão disponíveis somente após autenticação e
antes da existência de um vínculo ativo. A consulta devolve exclusivamente o
identificador e o nome do time; não devolve integrantes, solicitações, filas ou
qualquer outro dado operacional. A busca deve normalizar espaços e não depender
de diferenças entre maiúsculas e minúsculas.

## Modelo de dados e migration

A migration deve adicionar `TeamJoinRequest` com `teamId`, `profileId`,
`status`, `requestedAt`, `resolvedAt` e `resolvedById`. Ela deve incluir um
índice único parcial que impeça mais de uma solicitação `PENDING` por par de
time e perfil, sem impedir nova solicitação após uma recusa.

`AllowedEmail` não deve ser removida de imediato. Primeiro, o código novo deixa
de consultá-la; vínculos `TeamMember` existentes continuam válidos. Depois da
verificação em Preview e produção, outra migration remove a tabela e o bootstrap
baseado em `BOOTSTRAP_ADMIN_EMAIL`.

## Administração global e recuperação de acesso

`Profile.systemRole` diferencia `USER` de `SYSTEM_ADMIN`; esse papel global não
substitui `TeamMember.role` e não torna a pessoa integrante de todos os times.
Depois que o perfil existir, a promoção inicial é explícita e idempotente:

```bash
npm run admin:grant -- --email voce@empresa.com
```

O administrador do sistema pode listar contas e times, desativar ou reativar um
time e definir uma senha temporária pelo servidor. A senha é enviada diretamente
ao Supabase Auth e nunca é persistida no Prisma ou retornada pela action. O
perfil recebe `mustChangePassword = true`, e a aplicação exige uma senha pessoal
antes de liberar qualquer outro acesso.

Times com `status = DISABLED` deixam de aparecer na descoberta e não podem ser
selecionados nem usados por seus integrantes. Os vínculos são preservados para
permitir reativação posterior.

## Validação mínima

1. Criar uma conta sem receber e-mail e entrar com a senha cadastrada.
2. Confirmar que essa conta não vê dados de nenhum time antes de criar ou ter um
   pedido aprovado.
3. Criar um time e confirmar que o criador é administrador ativo.
4. Solicitar entrada com outra conta e confirmar que o pedido fica pendente.
5. Aprovar o pedido como administrador e confirmar o acesso somente ao time
   aprovado.
6. Recusar outro pedido e confirmar que nenhum vínculo é criado.
7. Tentar atuar sobre outro time, aprovar duas vezes o mesmo pedido e remover o
   último administrador; todas as ações devem falhar com segurança.
