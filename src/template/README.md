# Template TailAdmin

Esta pasta contém o template visual legado usado somente como catálogo de
referência. Ele é uma aplicação React Router preservada dentro do App Router e
fica disponível em `/template`.

## Regras de uso

- Não desenvolver funcionalidades do Café da Vez nesta pasta.
- Não importar módulos desta pasta no código do produto real.
- Ao aproveitar um componente, copiá-lo para `src/components` ou para a feature
  correspondente e adaptá-lo para as APIs do Next.js.
- Usar `next/link` e `next/navigation` no produto real, não `react-router`.
- Manter os assets exclusivos do catálogo em `public/template/images`.
- Tratar avisos de otimização específicos do legado dentro desta área, sem
  enfraquecer as regras aplicadas ao produto real.

O `BrowserRouter` existe somente para manter as rotas originais navegáveis. O
produto real deve usar exclusivamente as rotas do diretório `src/app`.
