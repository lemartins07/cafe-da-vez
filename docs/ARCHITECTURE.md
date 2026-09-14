# Arquitetura do Café da Vez

## Objetivo

Este documento define a arquitetura usada no código do produto. O objetivo é
manter um projeto pequeno fácil de entender e testar, sem transformar a aplicação
em um conjunto de camadas cerimoniais.

## Estilo arquitetural

O Café da Vez é um **monólito modular organizado por features**, executado como
uma aplicação Next.js. As regras importantes são escritas como domínio puro e as
integrações permanecem nas bordas da aplicação.

Não adotamos microserviços, Clean Architecture completa ou DDD tático completo.
Usamos apenas a separação necessária para impedir que regras de rotação fiquem
acopladas à interface, ao framework ou ao banco.

```text
Navegador
   |
   v
Next.js App Router ──────> Componentes de interface
   |
   v
Casos de uso das features
   |
   +────────> Regras de domínio puras
   |
   +────────> Prisma ─────> PostgreSQL/Supabase
   |
   `────────> Supabase Auth / Resend
```

## Organização dos diretórios

### `src/app`

Camada de entrada e composição do Next.js:

- páginas e layouts;
- route handlers;
- metadata;
- integração das features com o ciclo de vida do framework.

Essa camada deve ser fina. Regras de negócio não devem ser implementadas dentro
de páginas, layouts ou route handlers.

### `src/features`

Cada capacidade do produto possui um módulo próprio. Estrutura recomendada:

```text
src/features/rotations/
├── domain/
│   ├── advance-rotation.ts
│   └── advance-rotation.test.ts
├── actions/
├── components/
├── repositories/
└── schemas/
```

Nem toda feature precisa começar com todas essas pastas. Uma pasta só deve ser
criada quando houver código com essa responsabilidade.

- `domain`: regras puras, sem I/O ou dependências de framework;
- `actions`: adaptação para server actions e autorização;
- `components`: interface exclusiva da feature;
- `repositories`: persistência e transações;
- `schemas`: contratos e validação de entrada compartilhável.

Testes ficam próximos do código testado.

### `src/components`

Componentes visuais reutilizáveis por mais de uma feature, como shell, botões e
elementos de formulário. Eles não devem acessar banco nem conhecer regras de uma
feature específica.

### `src/lib`

Clientes e infraestrutura compartilhada, como Prisma, Supabase e validação de
variáveis de ambiente. `lib` não é um destino genérico para regras sem lugar.

### `src/styles`

Tokens e estilos globais do produto. Atualmente contém o design system adaptado
do TailAdmin. A futura paleta da empresa será aplicada nessa fronteira.

### `src/template`

Catálogo legado executável, mantido somente como referência visual. O código do
produto não pode importá-lo. Componentes escolhidos devem ser copiados,
simplificados e adaptados às APIs e convenções atuais.

### `prisma`

Modelo persistente, migrations, seed e bootstrap. O Prisma só deve aparecer nas
bordas de persistência ou em casos de uso exclusivamente server-side, nunca nas
regras puras do domínio.

## Fluxo de uma operação

Uma ação de concluir uma vez, por exemplo, seguirá esta sequência:

```text
Componente
  -> Server Action
  -> validação do payload
  -> autenticação e autorização
  -> caso de uso
  -> regra pura de rotação
  -> transação Prisma
       |- atualiza a posição/versão
       `- grava o evento de histórico
  -> resposta estruturada
  -> atualização da interface
```

O avanço e o evento devem ocorrer na mesma transação. `requestId` garante que uma
requisição repetida não avance a fila novamente. O campo `version` permite
detectar atualizações concorrentes.

## Dependências permitidas

```text
app ----------------------> features
app ----------------------> components
app ----------------------> lib
features/components ------> components
features/actions ---------> domain + repositories + lib
features/repositories ----> Prisma/lib
domain -------------------> TypeScript puro
```

Dependências proibidas:

- `domain` para React, Next.js, Prisma, Supabase ou navegador;
- `features` para `app`;
- produto para `template`;
- Client Components para módulos que contenham segredos ou acesso ao banco.

## Estratégia de testes

### Unitários

Vitest cobrirá regras e schemas sem serviços externos:

- seleção do próximo integrante elegível;
- retorno ao início da fila;
- salto da vez;
- integrantes pausados ou inativos;
- independência entre filas;
- idempotência;
- validações de entrada.

### Componentes

Testing Library verificará comportamento observável:

- feedback de validação;
- estados de carregamento;
- bloqueio de ações inválidas;
- ações principais das filas.

### Integração

Testes de integração serão adicionados somente para operações em que a transação,
constraints ou comportamento real do Prisma sejam essenciais. Eles usarão banco
de teste separado.

## Segurança

- Supabase comprova identidade; o banco da aplicação determina autorização.
- Toda operação valida vínculo, status e papel no servidor.
- `PAUSED` nunca é revertido implicitamente durante autenticação.
- Respostas de login não revelam a lista de e-mails autorizados.
- Banco e chaves administrativas são acessados apenas no servidor.
- Entrada do cliente é sempre validada novamente no servidor.

## Estado atual e débitos conhecidos

A separação principal já existe, mas ainda há pontos a alinhar:

- Vitest e Testing Library ainda não estão instalados.
- Ainda não existem testes automatizados no produto.
- Alguns componentes específicos de autenticação estão em
  `src/components/auth`; eles deverão migrar para `src/features/auth/components`.
- A server action de login está em `src/app`; ela deverá migrar para a feature de
  autenticação para eliminar a dependência `components -> app`.
- A camada de repositórios será introduzida junto das regras de rotação, somente
  onde ajudar a separar domínio puro e transação Prisma.

Esses débitos serão tratados gradualmente e não justificam uma reestruturação
ampla do template ou do código já validado.

## Critério para novas abstrações

Uma interface, camada ou serviço novo deve resolver pelo menos um destes
problemas:

- isolar uma regra para teste;
- proteger uma fronteira de segurança;
- centralizar uma transação;
- evitar duplicação real;
- separar uma integração externa.

Se não resolver um problema concreto, a implementação direta e legível é
preferível.
