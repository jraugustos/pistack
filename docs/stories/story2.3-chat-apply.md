# História 2.3 — Aplicar Resposta da IA ao Card

## Descrição
Como usuário, quero aplicar a resposta do chat da IA em um card, para atualizar seu conteúdo e gerar uma nova versão.

## Critérios de Aceitação
- DoR: integração OpenAI configurada; estrutura de versões criada.
- DoD: aplicar resposta atualiza resumo do card e salva nova versão no DB; toast confirma sucesso.

## Testes
- Enviar prompt → receber resposta.
- Clicar em Apply → resumo atualizado.
- Versão adicionada ao histórico do card.
