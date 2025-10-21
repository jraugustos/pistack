# História 3.1 — Exportar Projeto em Markdown

## Descrição
Como usuário, quero exportar meu projeto em Markdown, para usá-lo em outras ferramentas.

## Critérios de Aceitação
- DoR: template de export definido.
- DoD: botão gera `.md` com todos os cards; download funcional; toast confirma.

## Testes
- Criar projeto com cards → exportar.
- Verificar arquivo `.md` com seções correspondentes.
- Simular erro (ex.: sem cards) → toast vermelho.
