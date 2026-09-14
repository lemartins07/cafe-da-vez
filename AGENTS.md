# Instruções do projeto para agentes

Este arquivo é o contrato operacional para qualquer agente ou ferramenta que
altere o Café da Vez. Leia também `docs/ARCHITECTURE.md` e
`docs/PLANO_DE_INFRAESTRUTURA_E_IMPLEMENTACAO.md` antes de iniciar uma feature.

## Comunicação e aprovação

- Antes de alterar arquivos, explique o objetivo, as decisões técnicas, os
  arquivos previstos, os riscos e o comportamento esperado.
- Trabalhe em etapas pequenas e apresente atualizações durante a execução.
- Ao concluir uma etapa, mostre o resumo das mudanças, as validações executadas,
  os resultados e um roteiro de teste manual.
- Nunca crie commit, tag, faça push ou finalize uma branch antes da aprovação
  explícita do usuário após os testes manuais.
- Aprovação para implementar não significa aprovação para versionar. A
  autorização para commit deve ser dada depois da apresentação dos resultados.
- Não agrupe mudanças não relacionadas na mesma etapa ou no mesmo commit.

## Fluxo obrigatório de cada etapa

1. **Alinhar:** confirmar o objetivo e identificar decisões ainda pendentes.
2. **Explicar:** informar o que será alterado e como será validado.
3. **Implementar:** editar apenas o escopo combinado, sem commit ou push.
4. **Validar automaticamente:** executar os testes proporcionais à mudança.
5. **Revisar:** verificar o diff, arquivos não rastreados e possíveis segredos.
6. **Entregar para avaliação:** apresentar arquivos alterados, decisões, riscos
   remanescentes e passos de teste manual.
7. **Aguardar:** interromper o fluxo até o usuário testar e aprovar.
8. **Versionar:** somente após aprovação explícita, criar um commit coeso.
9. **Publicar:** fazer push apenas depois da mesma aprovação ou de autorização
   específica do usuário.
10. **Integrar:** abrir PR para a branch correta e aguardar os checks e a revisão.

Se o teste manual encontrar um problema, volte ao passo 2. Não empilhe commits de
tentativa antes da aprovação.

## Git Flow

O repositório usa Git Flow AVH com esta configuração:

```text
Produção: main
Integração: develop
Features: feature/
Correções comuns: bugfix/
Releases: release/
Correções urgentes: hotfix/
Suporte: support/
Tags: v
```

Regras:

- Atualize `develop` antes de iniciar trabalho comum.
- Inicie features com `git flow feature start <nome>`.
- Inicie correções não urgentes com `git flow bugfix start <nome>`.
- Features e bugfixes devem partir de `develop` e abrir PR para `develop`.
- Releases partem de `develop` e são integradas em `main` por PR.
- Hotfixes partem de `main` e devem retornar a `main` e `develop`.
- Nunca faça push direto em `main` ou `develop`.
- Neste repositório, não use `git flow feature finish` para integrar localmente;
  a integração acontece por pull request no GitHub.
- Antes de orientar um merge, confirme explicitamente a branch-base do PR.
- Não apague branches locais ou remotas sem confirmar que o PR foi integrado.

A configuração do Git Flow fica em `.git/config` e não é versionada. Este arquivo
é a referência versionada para reproduzi-la em outro clone.

## Arquitetura

O Café da Vez é um monólito modular organizado por features. Não adicione novas
camadas ou abstrações sem uma necessidade concreta.

```text
src/app                  Rotas, layouts e composição do Next.js
src/features/<feature>   Regras, casos de uso, schemas, UI e testes da feature
src/components           Componentes visuais realmente compartilhados
src/lib                  Integrações técnicas compartilhadas
src/styles               Design system e estilos globais do produto
src/template             Catálogo visual legado, somente para consulta
prisma                   Schema, migrations, seed e bootstrap
```

Direção das dependências:

- `app` pode compor `features`, `components` e `lib`.
- Uma feature não deve importar arquivos de `app`.
- Regras em `features/*/domain` não podem depender de React, Next.js, Prisma,
  Supabase ou APIs do navegador.
- Acesso ao banco e serviços externos deve ficar fora do domínio puro.
- `components` compartilhados não devem conhecer rotas ou regras de uma feature.
- Código do produto nunca deve importar de `src/template`; copie, simplifique e
  adapte o componente necessário.
- Código exclusivo do servidor deve usar `server-only` quando aplicável.
- Credenciais e segredos nunca podem chegar a Client Components.

Consulte `docs/ARCHITECTURE.md` para detalhes e desvios conhecidos.

## Testes e qualidade

- Toda regra de domínio nova deve nascer acompanhada de teste unitário.
- Toda correção de bug deve receber teste de regressão quando tecnicamente
  possível.
- Schemas com comportamento relevante devem possuir testes.
- Testes unitários não devem depender de rede, Supabase, PostgreSQL ou Vercel.
- Componentes interativos relevantes devem ser testados com Testing Library.
- Não considere uma etapa concluída enquanto os testes relacionados falharem.
- Não reduza ou remova testes para fazer uma alteração passar.

Antes de solicitar avaliação manual, execute quando disponíveis:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

Se algum comando não existir ou não puder ser executado, informe isso claramente.

## Banco de dados e segurança

- O PostgreSQL é a fonte oficial dos dados; não persista regras no filesystem da
  Vercel ou somente no navegador.
- Mudanças de schema exigem migration do Prisma.
- Migrations aplicadas não devem ser editadas; crie uma nova migration.
- Operações de rotação e histórico devem ser atômicas e idempotentes.
- Autenticação não substitui autorização. Sempre valide time, vínculo, status e
  papel no servidor.
- Preserve o status de integrantes pausados durante login e provisionamento.
- Não revele se um e-mail pertence à lista de autorizados.
- Nunca registre, exiba ou versione tokens, chaves, senhas ou connection strings.
- Preserve alterações do usuário que não pertençam ao escopo atual.

## Documentação da entrega

Ao entregar uma etapa para teste manual, informe no mínimo:

- objetivo alcançado;
- arquivos criados e modificados;
- decisões e trade-offs;
- comandos de validação e seus resultados;
- limitações conhecidas;
- roteiro numerado para teste manual;
- confirmação explícita de que ainda não houve commit nem push.
