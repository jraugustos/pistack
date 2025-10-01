# Epic 2 — Chat Contextual

## Descrição
Cada card tem seu próprio chat com IA, permitindo refinar conteúdo localmente. Diferente da IA Co-Founder (futuro), aqui o foco é no contexto isolado de um card.

## Valor de Negócio
Mostra o diferencial do PiStack como “IA modular por card”. Sem isso, o app seria apenas um board visual.

## Dependências
- Integração com OpenAI GPT-5 (server-side).
- Cards já implementados (Epic 1).

## Histórias
- História 2.1 — Abrir chat no card e enviar prompt.
- História 2.2 — Receber resposta da IA.
- História 2.3 — Aplicar resposta → atualizar resumo/versão.
- História 2.4 — Histórico limitado a 20 interações.

## Definition of Ready (DoR)
- API OpenAI acessível e chave segura (server-side).
- Estrutura `chat_threads` criada no DB.
- Layout de chat implementado no painel lateral.

## Definition of Done (DoD)
- Usuário envia prompt → resposta aparece no chat.
- “Aplicar ao card” gera nova versão no DB.
- Histórico navegável (últimas 20 mensagens).
- Toast confirma sucesso ou erro.
