# Café da Vez — Guia de estilização e usabilidade

Versão 1.0 · 15 de setembro de 2026  
Local sugerido no projeto: `docs/guia-estilizacao.md`

## 1. Objetivo e autoridade

Este guia orienta a criação e a evolução das telas do Café da Vez, com consistência visual, clareza das informações e facilidade de uso. Deve ser aplicado em conjunto com o `AGENTS.md` do projeto.

**`src/template` é a referência visual canônica e obrigatória.** O guia define prioridades de conteúdo e critérios de usabilidade; a implementação visual deve reproduzir os equivalentes existentes no template.

Em caso de conflito, prevalecem as regras do `AGENTS.md` e a implementação visual de `src/template`. Exemplos deste guia não autorizam substituir componentes existentes por versões apenas semelhantes.

Este documento foi elaborado com base nas regras fornecidas do `AGENTS.md` e na captura da tela de filas. O código de `src/template` não foi inspecionado nesta elaboração. Portanto, não estabelece nomes de componentes, caminhos internos, classes, tokens ou variantes como se já tivessem sido verificados.

A prévia visual discutida anteriormente é uma referência de organização da informação, não uma especificação visual executável. Seus ícones, cores, medidas e componentes não devem ser copiados para o produto sem correspondência com o template. As sugestões anteriores de escalas fixas de espaçamento e tipografia ficam subordinadas aos valores reais do template.

## 2. Processo obrigatório antes de qualquer alteração de UI

1. Ler as instruções aplicáveis do `AGENTS.md`.
2. Identificar a tarefa do usuário, os dados necessários, as ações e as permissões envolvidas.
3. Localizar e inspecionar o equivalente em `src/template`: página, layout, componente, ícone e estados pertinentes.
4. Inspecionar também os estilos, dependências e exemplos de uso que determinam seu comportamento visual. Não se limitar ao nome do componente ou a uma captura.
5. Verificar se já existe uma cópia fiel no produto. Preferir seu reúso quando adequada; conferir a fidelidade antes de propagar divergências.
6. Registrar o arquivo de referência, a variante escolhida e o destino no produto.
7. Implementar preservando estrutura, classes, espaçamentos, ícones, estados e comportamento visual. Adaptar somente conteúdo, dependências e regras do produto.
8. Comparar a implementação com a referência e verificar os fluxos reais.

**É proibido importar diretamente de `src/template` no código do produto**, inclusive por aliases, reexportações ou imports dinâmicos.

Quando necessário, copiar o elemento para `src/components` ou para a feature correspondente. Extrair ícones existentes para um local compartilhado do produto, preservando sua implementação. Não redesenhar ícones, trocar bibliotecas ou substituir um ícone por outro visualmente parecido.

### Ausência de equivalente

Só criar um componente ou visual novo quando não houver equivalente no template. Antes de editar, informar explicitamente:

> Não encontrei equivalente para [necessidade] em `src/template`. Inspecionei [arquivos e exemplos reais]. Proponho [elemento mínimo necessário], utilizando os padrões existentes de [referências verificadas].

Registrar a ausência e a solução na entrega. Se existir equivalente, desconforto com sua aparência ou conveniência de implementação não justifica recriá-lo. A comunicação da ausência não acrescenta, por si só, uma exigência de aprovação além das instruções aplicáveis ao projeto.

## 3. Princípios de organização das telas

### 3.1. Tornar a tarefa principal evidente

Cada tela deve deixar claro seu propósito, o estado atual e a próxima ação útil. A ordem de leitura deve ser: contexto da página, informação principal, ação e informações complementares.

Em Filas, o responsável atual e o registro da tarefa têm prioridade sobre configurações e registros retroativos.

### 3.2. Hierarquia de ações

Usar uma ação de maior destaque por bloco de tarefa. Duas filas independentes podem ter uma ação principal em cada bloco. Ações secundárias devem usar variantes secundárias existentes no template.

Ações administrativas ou pouco frequentes devem ficar no contexto apropriado. Não esconder ações essenciais em menus apenas para reduzir a quantidade de botões.

### 3.3. Mostrar detalhes quando necessários

Formulários auxiliares podem ser abertos sob demanda com o padrão equivalente do template: modal, painel ou expansão, conforme os exemplos inspecionados. A escolha deve considerar quantidade de campos, comportamento mobile e acessibilidade.

Não introduzir um drawer ou modal próprio se o template já oferecer um equivalente adequado. Não remover etapas ou campos exigidos pelas regras do produto para simplificar a aparência.

### 3.4. Preservar a verdade dos dados

A interface não deve alterar regras de ordenação, participação, histórico ou permissões para se ajustar ao layout. Não deduplicar participantes visualmente sem confirmar o significado das entradas. Não inventar estatísticas, saldos, status ou datas para preencher espaços.

## 4. Definições visuais a seguir

Os valores concretos abaixo devem ser extraídos do template durante a implementação. Não criar uma segunda camada de estilos concorrente.

| Aspecto                  | Definição obrigatória                                                                                                                                                       |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout da aplicação      | Reutilizar ou copiar fielmente o equivalente de navegação lateral, cabeçalho, área de conteúdo e comportamento de recolhimento.                                             |
| Cabeçalho de página      | Utilizar o padrão equivalente de título, descrição, breadcrumb e ações; adaptar os textos à tarefa.                                                                         |
| Largura e grid           | Preservar containers, colunas, gutters e breakpoints da referência escolhida. Evitar margens e larguras arbitrárias.                                                        |
| Tipografia               | Usar a família, os pesos, tamanhos e alturas de linha da referência para cada função: título, nome, corpo, label e ajuda.                                                   |
| Espaçamento              | Reproduzir classes e tokens de padding, margin e gap do equivalente. Não impor uma escala nova neste guia.                                                                  |
| Cores                    | Usar os tokens e classes existentes para superfícies, texto, destaque, bordas e estados semânticos. Não introduzir valores hexadecimais locais para “aproximar” o template. |
| Cards                    | Preservar estrutura, cabeçalho, corpo, rodapé, bordas, raios e sombras do equivalente. Evitar cards aninhados sem referência existente.                                     |
| Botões                   | Usar as variantes existentes, com seu tamanho, alinhamento de ícone, foco, hover, loading e disabled.                                                                       |
| Ícones                   | Usar exatamente os ícones do template, preservando desenho, dimensões, traço e alinhamento. Não substituir por emoji.                                                       |
| Formulários              | Preservar labels, ajuda, mensagens, espaçamento, campos obrigatórios e apresentação de erro do equivalente.                                                                 |
| Listas e tabelas         | Escolher o equivalente pela natureza dos dados; manter densidade, divisores, alinhamento e comportamento responsivo.                                                        |
| Feedback e sobreposições | Reutilizar os equivalentes de alerta, confirmação, notificação, modal e estados vazios.                                                                                     |
| Temas                    | Preservar tokens, classes e mecanismo de alternância de tema existentes; verificar os temas suportados pelo projeto.                                                        |

A fidelidade deve abranger o conjunto visual. Copiar apenas o botão e recriar livremente seu card, espaçamento e estados não atende à referência obrigatória.

## 5. Conteúdo e linguagem

Usar português brasileiro, frases curtas, labels consistentes e verbos que descrevam o resultado da ação. Preferir nomes de exibição quando disponíveis; manter um fallback válido e acesso à identificação completa quando necessário.

| Contexto               | Texto recomendado                     | Observação                                                      |
| ---------------------- | ------------------------------------- | --------------------------------------------------------------- |
| Responsável atual      | É a vez de                            | Acompanhado do nome real.                                       |
| Registro de preparo    | Registrar preparo                     | Mais específico que “Concluir vez”.                             |
| Registro de compra     | Registrar compra                      | Abre ou conclui o fluxo conforme o contexto.                    |
| Confirmação da compra  | Confirmar compra                      | Usado após selecionar os itens.                                 |
| Registro retroativo    | Registrar compra passada              | Diferencia o fluxo da compra da vez.                            |
| Próximos participantes | Na sequência                          | Deve excluir o atual se ele já estiver destacado separadamente. |
| Usuário na fila        | Você / Você é o próximo               | Derivado da identidade e da posição reais.                      |
| Ação indisponível      | Selecione pelo menos um item comprado | Exemplo condicionado à validação real da compra.                |

“Pular vez” deve indicar a consequência real antes da execução quando houver impacto na ordem. Não afirmar que a pessoa irá ao final da fila sem confirmar essa regra no domínio.

Mensagens de sucesso devem confirmar o resultado efetivamente persistido. Exemplo: “Preparo registrado. Agora é a vez de [nome].” Não apresentar sucesso antecipado sem reconciliação e tratamento de falhas.

## 6. Padrão funcional da tela de filas

### Estrutura proposta

- Cabeçalho com título claro e descrição curta sobre a independência das duas filas.
- Bloco de preparo e bloco de compra, lado a lado quando o equivalente responsivo comportar essa disposição.
- Em cada bloco: identificação da tarefa, responsável atual, ação principal, ação secundária e sequência.
- Registro de compra passada acessível por ação própria, com formulário sob demanda.
- Reorganização e embaralhamento no contexto administrativo adequado às permissões existentes.

A composição deve usar layouts e componentes equivalentes do template. Caso não exista equivalente para uma composição visual necessária, aplicar o processo de ausência antes de editar.

### Preparar café

Exibir o responsável atual e a ação “Registrar preparo”. Mostrar os próximos sem repetir desnecessariamente o atual. Após persistir o registro, atualizar a fila a partir do estado confirmado pelo servidor.

### Comprar café

Exibir o responsável atual e a ação “Registrar compra”. No fluxo de registro, permitir selecionar os itens já previstos pelo produto, como pó e filtro. Validar a seleção conforme a regra existente. Não habilitar compras, participantes ou efeitos na fila que o domínio não permita.

### Compra passada

Exibir data, comprador e itens exigidos pelo produto. O efeito de um registro retroativo sobre a fila deve ser definido pela regra existente e explicado quando relevante. Não presumir que registrar uma compra antiga avança a fila atual.

### Permissões e casos especiais

A disponibilidade das ações depende das permissões reais. Ocultar ou desabilitar controles conforme o padrão aplicável não substitui autorização no servidor. Tratar explicitamente fila vazia, participante único, usuário fora da fila e lista extensa. Não assumir que todo integrante pode registrar por outra pessoa.

## 7. Diretrizes para as próximas telas

As propostas abaixo orientam organização; não adicionam funcionalidades automaticamente ao escopo.

| Tela          | Informação prioritária                                 | Organização e interação                                                             |
| ------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Início        | Situação do usuário nas filas e próxima ação relevante | Resumo enxuto, sem repetir integralmente Filas nem incluir indicadores decorativos. |
| Filas         | Responsável atual, registro da tarefa e sequência      | Dois blocos independentes, com hierarquia consistente.                              |
| Integrantes   | Identificação, status e participação nas filas         | Lista ou tabela equivalente; edição contextual conforme permissão.                  |
| Histórico     | Data, pessoa, tipo de registro e itens pertinentes     | Tabela ou lista equivalente, com filtros apenas quando necessários e suportados.    |
| Administração | Configurações e operações de gestão existentes         | Agrupar por finalidade; explicar os efeitos de mudanças de ordem e participação.    |

## 8. Estados, responsividade e acessibilidade

| Estado               | Comportamento esperado                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Carregamento inicial | Usar o equivalente do template; distinguir carregamento de ausência de dados.                                       |
| Sem dados            | Explicar a situação e oferecer ação pertinente, se permitida.                                                       |
| Salvando             | Impedir submissões duplicadas e usar o estado de progresso existente.                                               |
| Validação            | Associar erro ao campo ou grupo correspondente e preservar os dados preenchidos.                                    |
| Falha de serviço     | Informar que a operação falhou; permitir nova tentativa sem perda desnecessária de dados.                           |
| Sucesso              | Confirmar o resultado persistido e atualizar os dados afetados.                                                     |
| Estado desatualizado | Tratar conflito de fila sem registrar uma ação sobre responsável incorreto; orientar atualização quando necessário. |
| Sem permissão        | Apresentar o estado previsto e manter validação da autorização no servidor.                                         |

Preservar os breakpoints do template. Verificar uma largura mobile estreita, tablet e desktop; incluir nomes longos, filas maiores e mensagens de erro. Evitar rolagem horizontal da página. Em tabelas, utilizar o mecanismo responsivo existente sem ocultar informações essenciais.

Manter navegação por teclado, foco visível, labels associados e nomes acessíveis para botões de ícone. Não depender apenas de cor, ícone ou hover para comunicar significado. Preservar o gerenciamento de foco e fechamento das sobreposições do template.

Se a referência apresentar um problema de acessibilidade ou responsividade, registrar a divergência e tratá-la conforme as instruções do projeto. Não trocar silenciosamente o componente por um redesenho local.

## 9. Arquitetura e direção das dependências

A organização visual não altera os limites arquiteturais do projeto.

| Camada                              | Responsabilidade e limites                                                                                                 |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `app`                               | Compor `features`, `components` e `lib`; conectar páginas e rotas.                                                         |
| `features`                          | Concentrar comportamento específico da funcionalidade. Não importar arquivos de `app`.                                     |
| `features/*/domain`                 | Manter regras puras, sem React, Next.js, Prisma, Supabase ou APIs do navegador.                                            |
| Camada de acesso a dados e serviços | Manter banco e integrações fora do domínio puro, seguindo a estrutura existente do projeto.                                |
| `components` compartilhados         | Oferecer elementos reutilizáveis sem conhecer rotas ou regras de uma feature. Receber dados e callbacks quando apropriado. |
| `lib`                               | Utilitários e integrações conforme a arquitetura existente; não usar como atalho para violar limites.                      |
| `src/template`                      | Referência para inspeção e cópia fiel; nunca uma dependência do código do produto.                                         |

Um botão compartilhado não deve saber como avançar a fila. A feature conecta o evento à operação autorizada; o domínio calcula suas regras sem depender da interface; a camada externa executa persistência e integrações.

Código exclusivo do servidor deve usar `server-only` quando aplicável. Credenciais e segredos nunca podem chegar a Client Components, incluindo props, módulos importados ou respostas serializadas. Client Components devem receber apenas os dados necessários e seguros para a interação.

Copiar um componente não autoriza copiar dependências inadequadas. Adaptar integrações, dados demonstrativos e acoplamentos ao produto, preservando a implementação visual.

## 10. Registro de referência por implementação

Preencher na descrição da alteração ou no local de documentação já adotado pelo projeto:

| Campo                  | Conteúdo a registrar                                         |
| ---------------------- | ------------------------------------------------------------ |
| Tela ou fluxo          | Nome e objetivo da alteração.                                |
| Referência canônica    | Caminhos reais inspecionados em `src/template`.              |
| Elementos reutilizados | Layout, componentes, variantes, ícones e estados utilizados. |
| Destino                | Caminhos reais no produto; indicar reúso ou cópia.           |
| Adaptações             | Conteúdo, dependências e regras de produto alteradas.        |
| Ausências              | O que não tinha equivalente e quando isso foi informado.     |
| Verificação            | Temas, larguras, estados e fluxos efetivamente verificados.  |

Não preencher referências por suposição. Se o template não estiver disponível, declarar essa limitação; não afirmar fidelidade visual com base somente em documentação pública do TailAdmin.

## 11. Critérios de conclusão

- [ ] Equivalentes localizados e inspecionados antes da edição.
- [ ] Referências reais e destinos registrados.
- [ ] Estrutura, classes, espaçamentos, ícones, estados e comportamento visual preservados.
- [ ] Ausências informadas antes de criar qualquer visual novo.
- [ ] Nenhum import do produto aponta para `src/template`, direta ou indiretamente.
- [ ] Nenhum ícone existente foi redesenhado ou substituído.
- [ ] Ação principal e informações prioritárias estão claras.
- [ ] Dados, ordem das filas e permissões respeitam as regras existentes.
- [ ] Estados pertinentes, nomes longos e responsividade foram verificados.
- [ ] Teclado, foco, labels e mensagens permanecem utilizáveis.
- [ ] Limites entre `app`, features, domínio e componentes foram respeitados.
- [ ] Persistência e serviços externos estão fora do domínio puro.
- [ ] Código de servidor e segredos permanecem fora do cliente.
- [ ] Comparação visual realizada com o equivalente canônico.

Testes automatizados devem cobrir riscos reais de comportamento, como autorização, ordenação, validação e submissão duplicada, quando afetados. A fidelidade visual exige comparação renderizada; aprovação de build ou lint não comprova aparência correta.

## 12. Orientação reutilizável para novas tarefas

> Antes de criar ou alterar esta tela, leia o `AGENTS.md` e este guia. Localize e inspecione o equivalente em `src/template`, incluindo layout, componentes, ícones e estados. Reutilize uma cópia fiel existente no produto ou copie o necessário para `src/components` ou para a feature, sem importar de `src/template`. Preserve estrutura, classes, espaçamentos, ícones e comportamento visual; adapte somente conteúdo, dependências e regras do produto. Se não houver equivalente, informe explicitamente a ausência antes de editar. Respeite a direção das dependências, o domínio puro e a separação servidor/cliente. Ao concluir, informe as referências utilizadas, as adaptações e as verificações realizadas.
