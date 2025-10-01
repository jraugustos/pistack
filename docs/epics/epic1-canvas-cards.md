# Epic 1 — Canvas & Cards

## Descrição
O canvas é o coração do PiStack. Ele permite visualizar e manipular cards de forma livre, conectando ideias e etapas de um projeto em uma visão relacional.

## Valor de Negócio
Sem um canvas funcional, o produto não entrega seu diferencial visual. Este épico garante a experiência central do PiStack.

## Dependências
- Modelo de dados definido (cards, edges, versões).
- UX Spec com tokens e interações básicas.

## Histórias
- História 1.1 — Criar projeto (do zero ou via template).
- História 1.2 — Criar/editar/excluir cards.
- História 1.3 — Conectar cards no canvas.
- História 1.4 — Autosave ao editar cards.

## Definition of Ready (DoR)
- Tipos de card definidos.
- Modelo GraphJSON documentado.
- Critérios visuais claros (status, cores, bordas).

## Definition of Done (DoD)
- Usuário cria, edita e deleta cards sem erro.
- Autosave persiste dados no DB em <1s percebido.
- Conexões podem ser criadas, removidas e persistidas.
- Feedback visual de ações concluídas (toast, ícones).
