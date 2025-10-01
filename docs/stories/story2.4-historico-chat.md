# História 2.4 — Histórico do Chat (20 mensagens)

## Descrição
Como usuário, quero ver o histórico das últimas interações no chat do card, para entender o contexto antes de aplicar.

## Critérios de Aceitação
- DoR: tabela `chat_threads` com array de mensagens.
- DoD: histórico mostra até 20 últimas mensagens, rolável; mensagens antigas são descartadas.

## Testes
- Enviar mais de 20 prompts → verificar truncamento.
- Conferir consistência entre FE e DB.
