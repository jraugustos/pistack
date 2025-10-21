# Epic 3 — Exportação

## Descrição
Permite transformar o projeto em um documento `.md` legível, preservando cards e conexões.

## Valor de Negócio
Garante utilidade imediata do PiStack → levar resultados para Trello, Notion ou Docs (mesmo sem integrações nativas).

## Dependências
- Canvas e cards funcionando (Epic 1).
- Estrutura de dados consistente.

## Histórias
- História 3.1 — Botão Exportar → gerar `.md`.
- História 3.2 — Estruturar conteúdo por cards e conexões.
- História 3.3 — Notificar sucesso/erro ao usuário.

## Definition of Ready (DoR)
- Template Markdown definido e aprovado.
- Endpoint `/export` implementado no backend.
- Critérios mínimos de conteúdo por card (título + resumo).

## Definition of Done (DoD)
- Arquivo `.md` inclui todos os cards do projeto.
- Conexões listadas (ex.: Ideia → Funcionalidades).
- Download funcional no navegador.
- Toast verde/vermelho confirma status.
