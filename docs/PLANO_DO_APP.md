# Plano do app Café da Vez

## Objetivo

Criar um aplicativo privado para organizar, dentro de um time de trabalho, duas responsabilidades independentes:

- preparar o café;
- comprar café ou outros suprimentos relacionados.

O aplicativo será hospedado na Vercel, deverá preservar os dados entre implantações e poderá ser acessado somente por integrantes autorizados do time.

## Escopo do MVP

A tela inicial deverá apresentar:

- a pessoa responsável por fazer o próximo café;
- a pessoa responsável pela próxima compra;
- os próximos participantes de cada fila;
- ações para concluir ou pular uma vez;
- integrantes temporariamente ausentes;
- o histórico recente das rotações.

Administradores poderão:

- convidar e remover integrantes;
- definir quem participa de cada fila;
- reordenar as filas;
- pausar e reativar integrantes;
- corrigir ou desfazer a última ação;
- alterar configurações do time.

## Regras das rotações

- As filas de preparo e compra serão independentes.
- Uma vez avança somente quando a ação for marcada como concluída ou pulada.
- Ao pular uma vez, a pessoa irá para o fim da fila e o evento será registrado.
- Integrantes pausados serão ignorados até serem reativados.
- A fila de preparo avançará a cada café concluído.
- A fila de compra avançará somente quando uma compra for concluída.
- Toda alteração relevante será registrada no histórico.
- Uma mesma requisição não poderá avançar a fila duas vezes, mesmo em caso de clique repetido.
- O avanço da fila e o registro no histórico deverão ocorrer em uma única transação no banco.

## Arquitetura escolhida

```text
Celular ou computador
        |
        v
Next.js + TypeScript
hospedado na Vercel
        |
        v
Supabase
|- Autenticação
|- PostgreSQL
|- Row Level Security
`- Histórico persistente
```

### Tecnologias

- Next.js com App Router e TypeScript;
- Tailwind CSS para a interface;
- Supabase PostgreSQL para persistência;
- Supabase Auth para autenticação;
- Zod para validação de dados;
- Vitest para testar as regras das filas;
- Vercel para hospedagem e gerenciamento das variáveis de ambiente.

### Template base

O projeto usará como ponto de partida o repositório
[`lemartins07/tailadmin-react-to-nextjs`](https://github.com/lemartins07/tailadmin-react-to-nextjs),
usando a pré-migração para Next.js disponível na branch
`codex/migrar-tailwind-de-react-para-next.js`. Essa base inclui os componentes premium
do TailAdmin que serão aproveitados no aplicativo.

Nesta primeira etapa, a estrutura, os componentes e a paleta de cores existentes no
template serão preservados. A identidade visual será adaptada posteriormente, em uma
etapa separada, com uma nova paleta baseada nas cores da empresa.

O banco de dados, e não o sistema de arquivos da Vercel ou o armazenamento local do navegador, será a fonte oficial dos dados.

## Controle de acesso e entrada em times

O aplicativo terá cadastro por e-mail e senha, sem confirmação de e-mail. Essa
decisão elimina a dependência de entrega de e-mails externos, que não funciona
no ambiente de trabalho atual. O e-mail continuará sendo um identificador único
da conta, mas não será usado como prova de posse nem como mecanismo de convite.

O acesso aos dados de um time só será concedido após aprovação explícita de um
administrador ativo daquele time. O fluxo será:

1. A pessoa cria uma conta com e-mail e senha e inicia uma sessão.
2. Sem um vínculo ativo, ela só pode criar um time ou solicitar entrada em um
   time existente; não pode consultar dados operacionais.
3. Ao criar um time, a pessoa criadora passa a ser integrante `admin` ativo na
   mesma transação que cria o time.
4. Para entrar em um time existente, a pessoa envia uma solicitação. Ela fica
   com estado `pending` até que um administrador a aprove ou recuse.
5. A aprovação cria ou atualiza o vínculo `team_member` como `member` ativo e
   registra quem tomou a decisão. A recusa não cria vínculo com o time.

Após autenticar, a pessoa verá uma listagem de times e poderá filtrá-la pelo
nome. Essa listagem expõe somente o nome do time necessário para solicitar
entrada; participantes, filas, histórico e outras informações operacionais só
ficam disponíveis depois da aprovação.

O modelo continuará permitindo que uma mesma conta pertença a mais de um time.
Quando houver mais de um vínculo ativo, a aplicação deverá exigir a seleção do
time em uso; nunca poderá escolher um vínculo arbitrariamente.

Papéis inicialmente previstos:

- `admin`: gerencia integrantes, filas e configurações;
- `member`: consulta as filas e registra ações permitidas.

Esses papéis são locais ao time. O papel global `system_admin`, armazenado no
perfil, permite listar contas e times, desativar ou reativar times e redefinir o
acesso de uma conta com senha temporária. O usuário deverá trocar essa senha no
próximo acesso. Um administrador do sistema não se torna automaticamente membro
ou administrador dos times.

Todas as tabelas expostas à aplicação deverão usar Row Level Security (RLS):

- visitantes não autenticados não terão acesso aos dados;
- integrantes acessarão somente dados dos times dos quais fazem parte;
- somente administradores executarão operações administrativas;
- credenciais com privilégios administrativos permanecerão exclusivamente no servidor.

O administrador que aprova solicitações não pode remover, pausar ou rebaixar o
último administrador ativo do próprio time. A aprovação, a criação do vínculo e
a atualização da solicitação devem ser atômicas.

## Modelo de dados inicial

### `teams`

Representa um time.

Campos principais:

- `id`;
- `name`;
- `created_at`.

### `profiles`

Contém os dados públicos internos de cada usuário.

Campos principais:

- `id`, relacionado ao usuário de autenticação;
- `display_name`;
- `avatar_url`;
- `system_role` (`user` ou `system_admin`);
- `must_change_password`;
- `created_at`.

### `team_members`

Relaciona usuários e times.

Campos principais:

- `team_id`;
- `user_id`;
- `role` (`admin` ou `member`);
- `status` (`active` ou `paused`);
- `created_at`.

### `team_join_requests`

Registra pedidos de entrada antes que exista um vínculo de integrante.

Campos principais:

- `id`;
- `team_id`;
- `profile_id`;
- `status` (`pending`, `approved` ou `rejected`);
- `requested_at`;
- `resolved_at`;
- `resolved_by`, quando houver decisão.

Haverá no máximo uma solicitação pendente por pessoa e time. Após uma recusa, a
pessoa poderá enviar uma nova solicitação; o histórico das decisões anteriores
deve ser preservado.

### `rotations`

Representa uma fila do time.

Campos principais:

- `id`;
- `team_id`;
- `type` (`make_coffee` ou `buy_coffee`);
- `name`;
- `current_position`;
- `created_at`.

### `rotation_members`

Define quem participa e a ordem de cada fila.

Campos principais:

- `rotation_id`;
- `user_id`;
- `position`;
- `active`;
- `created_at`.

### `turn_events`

Mantém a trilha de auditoria das rotações.

Campos principais:

- `id`;
- `rotation_id`;
- `user_id`;
- `action` (`completed`, `skipped`, `paused`, `resumed`, `reordered` ou `undone`);
- `reason`, quando aplicável;
- `request_id`, para impedir processamento duplicado;
- `performed_by`;
- `created_at`.

O histórico deverá continuar legível mesmo depois que um integrante deixar o time.

## Persistência, recuperação e auditoria

- Todos os dados operacionais ficarão no PostgreSQL do Supabase.
- Mudanças no banco serão versionadas como migrations no repositório Git.
- Eventos das filas serão preservados como uma trilha de auditoria.
- No plano gratuito, será necessário executar exportações periódicas com `supabase db dump` e guardar uma cópia fora do Supabase.
- Para produção com maior garantia de recuperação, deverá ser avaliado um plano com backups automáticos diários.
- Recuperação ponto a ponto poderá ser adicionada futuramente caso o impacto de perda de dados justifique o custo.

## Telas previstas

### Login

- cadastro e login por e-mail e senha;
- sem confirmação de e-mail;
- tela de entrada para criar um time ou solicitar participação quando a conta
  ainda não possuir vínculo ativo.

### Painel principal

- cartão da vez de fazer o café;
- cartão da vez de comprar café;
- próximos participantes;
- botões de concluir e pular;
- indicação de ausências.

### Histórico

- eventos em ordem cronológica;
- filtro por rotação, pessoa e tipo de ação.

### Integrantes

- lista de participantes;
- lista de solicitações pendentes e ações de aprovar ou recusar;
- pausa e reativação;
- definição de papel.

### Configurações das filas

- participantes de cada rotação;
- reordenação;
- correção manual da vez atual;
- desfazer última ação.

## Ordem de implementação

1. Criar o projeto Next.js e configurar a qualidade de código.
2. Configurar o Supabase e as migrations iniciais.
3. Implementar cadastro e login por e-mail e senha, sem confirmação de e-mail.
4. Implementar criação de time, solicitação de entrada e aprovação de integrantes.
5. Implementar as duas filas independentes.
6. Implementar concluir, pular, pausar, reativar e desfazer.
7. Adicionar histórico e permissões administrativas.
8. Criar testes das regras de rotação e dos fluxos principais.
9. Revisar políticas de RLS e tratamento de concorrência.
10. Configurar backup e implantar na Vercel.

## Critérios de aceite do MVP

- Uma conta sem vínculo ativo não consulta dados de nenhum time.
- Quem cria um time torna-se seu administrador ativo.
- Somente solicitações aprovadas geram integrantes ativos.
- Usuários de um time não conseguem consultar dados de outro time.
- As filas de preparo e compra funcionam de forma independente.
- Concluir ou pular uma vez seleciona corretamente o próximo integrante ativo.
- Pausar alguém não remove seu cadastro nem apaga seu histórico.
- Cliques repetidos não avançam a mesma fila mais de uma vez.
- Um administrador consegue corrigir uma ação indevida.
- O histórico identifica o que aconteceu, quando e quem realizou a ação.
- Os dados continuam disponíveis depois de uma nova implantação na Vercel.
- Existe um procedimento documentado e testado de backup e restauração.

## Decisões pendentes

Estas decisões poderão ser tomadas antes ou durante a implementação sem alterar a arquitetura principal:

- recuperação e redefinição de senha sem depender de e-mail externo;
- possibilidade de mais de um preparo de café por dia;
- exigência de motivo ao pular uma vez;
- registro de valor, itens e comprovante nas compras;
- envio de notificações por e-mail, Slack ou Microsoft Teams;
- existência de apenas um time ou suporte a vários times desde o MVP;
- frequência e destino das cópias externas de segurança.

## Referências técnicas

- [Armazenamento e bancos na Vercel](https://vercel.com/docs/storage)
- [Autenticação com Supabase](https://supabase.com/docs/guides/auth)
- [Row Level Security no Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Backups de banco no Supabase](https://supabase.com/docs/guides/platform/backups)
- [Autenticação e autorização no Next.js](https://nextjs.org/docs/app/guides/authentication)
