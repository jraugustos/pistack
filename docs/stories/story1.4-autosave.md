# História 1.4 — Autosave

## Descrição
Como usuário, quero que minhas alterações em cards sejam salvas automaticamente, para não perder progresso.

## Critérios de Aceitação
- DoR: debounce definido (800ms).
- DoD: edição inline é salva em <1s percebido; feedback visual confirma.

## Testes
- Editar título/resumo e aguardar autosave.
- Atualizar página → alterações persistem.
- Testar fluxo rápido (digitação contínua) sem perda de dados.
