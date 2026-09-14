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

## Controle de acesso

O aplicativo não terá cadastro público. O acesso seguirá este fluxo:

1. Um administrador convida o integrante pelo e-mail.
2. O integrante recebe um link para acessar ou criar sua sessão.
3. O sistema verifica se existe uma associação ativa entre o usuário e o time.
4. Somente depois dessa verificação o usuário pode acessar os dados.

Caso todos utilizem um domínio corporativo, a validação do domínio poderá ser usada como proteção adicional, mas não substituirá a lista de integrantes autorizados.

Papéis inicialmente previstos:

- `admin`: gerencia integrantes, filas e configurações;
- `member`: consulta as filas e registra ações permitidas.

Todas as tabelas expostas à aplicação deverão usar Row Level Security (RLS):

- visitantes não autenticados não terão acesso aos dados;
- integrantes acessarão somente dados dos times dos quais fazem parte;
- somente administradores executarão operações administrativas;
- credenciais com privilégios administrativos permanecerão exclusivamente no servidor.

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
- `created_at`.

### `team_members`

Relaciona usuários e times.

Campos principais:

- `team_id`;
- `user_id`;
- `role` (`admin` ou `member`);
- `status` (`active` ou `paused`);
- `created_at`.

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

- acesso por convite;
- autenticação por link enviado ao e-mail ou provedor corporativo, a definir.

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
- convite e remoção;
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
3. Implementar autenticação privada e convites.
4. Implementar o cadastro do time e de seus integrantes.
5. Implementar as duas filas independentes.
6. Implementar concluir, pular, pausar, reativar e desfazer.
7. Adicionar histórico e permissões administrativas.
8. Criar testes das regras de rotação e dos fluxos principais.
9. Revisar políticas de RLS e tratamento de concorrência.
10. Configurar backup e implantar na Vercel.

## Critérios de aceite do MVP

- Somente pessoas convidadas e ativas conseguem entrar.
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

- login por link enviado ao e-mail ou por Google/Microsoft corporativo;
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
