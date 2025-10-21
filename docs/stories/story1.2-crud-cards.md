# História 1.2 — Criar/Editar/Excluir Cards

## Descrição
Como usuário, quero criar, editar e excluir cards no canvas, para organizar as informações do meu projeto.

## Critérios de Aceitação
- DoR: estrutura mínima de card definida (título, resumo, status).
- DoD: usuário consegue criar card, editar título/resumo, excluir. Autosave salva no DB.

## Testes
- Criar card com título obrigatório.
- Editar card e verificar persistência no DB.
- Excluir card → desaparece do canvas e do DB.
