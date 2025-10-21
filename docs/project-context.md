# PIStack Project Context

Documento de referência rápida para novos ciclos de trabalho. Atualize este arquivo sempre que o estado do projeto mudar.

---

## Visão Geral

- **Stack:** Next.js 15 (App Router) + TypeScript + Tailwind CSS.
- **Autenticação:** Clerk.
- **Banco:** Supabase (PostgreSQL) com RLS ativo; API interage via service role.
- **IA:** Assistants da OpenAI (etapas 1–6 + orchestrator) usando function calling.
- **Pasta principal:** `pistack-app/`.

---

## Layout do Repositório

```
docs/                → Documentação auxiliar (assistants, schema, contexto)
html/                → Prototipagem estática original do canvas
components/          → Código legado fora do app principal (manter apenas para consulta)
pistack-app/
  app/               → Rotas Next.js (marketing, auth, dashboard, api)
  components/        → UI modular; destaque para canvas/*
  hooks/, lib/       → Hooks utilitários, Supabase e AI helpers
  types/             → (atualmente vazio, reservado para tipagens globais)
```

---

## Fluxo do Canvas

1. **StageSection (`components/canvas/stage-section.tsx`)**
   - Carrega cards por etapa e aplica normalização de conteúdo.
   - Controla zoom, filtros, botão “Adicionar card” e menu contextual (⋯).
   - Eventos:
     - `pistack:cards:refresh`: força refetch silencioso após mudanças.
     - `pistack:ai:reference-card`: fornece conteúdo ao painel da IA.
   - Ações rápidas (Editar, IA, Excluir) ficam diretamente no cabeçalho de cada card; o menu contextual foi removido.
   - Botão “Sparkles” dispara `pistack:ai:reference-card`.

2. **BaseCard (`components/canvas/cards/base-card.tsx`)**
   - Estrutura padrão de cada card (ícone, título, ações).
   - Exibe diretamente os ícones de editar (✏️), referência à IA (✨) e excluir (🗑️), conectados ao provider `CardActionsProvider`.

3. **AI Sidebar (`components/canvas/ai-sidebar.tsx`)**
   - Header renomeado para "Copiloto do Projeto".
   - Carrega histórico via `/api/ai/history`.
   - `pistack:ai:reference-card` preenche o input com um resumo visual (card, ID e conteúdo formatado em bullet points).
   - Ao receber function calls de `create_card`/`update_card`, emite `pistack:cards:refresh`.
   - **CARD_SCHEMAS:** mapeamento de todos os 38 cards com estrutura esperada de arrays.
   - **formatCardReference:** formata contexto do card com schema, regras de array e exemplos explícitos.
   - Suporte a markdown em mensagens via `MessageContent` component.

4. **Autopreenchimento**
   - `POST /api/cards` cria card vazio, depois aciona `generateCardWithAssistant`.
   - `generateCardWithAssistant` (lib/ai/card-autofill.ts):
     - Obriga `update_card`.
     - Se o assistant não preenche, gera conteúdo fallback via modelo `gpt-4o-mini`.
     - Normaliza `Placeholder1`, arrays e strings diversas.
     - **CARD_SCHEMA_PROMPTS:** schemas completos de todos os 38 tipos de cards com instruções explícitas sobre arrays.
     - **buildPrompt:** inclui regras críticas sobre formatação de arrays (JSON válido, exemplos corretos/incorretos).

---

## Etapa 2 — Estado Atual

- Todos os cards da etapa 2 agora contam com edição inline estruturada:
  - **Persona Primária:** inputs separados para nome, idade, cargo, renda e listas editáveis (objetivos, frustrações, comportamentos), com autosave.
  - **Hipóteses de Validação:** cada hipótese possui campos individuais (categoria, narrativa, métrica, confiança/risco) e suporte para adicionar/remover itens.
  - **Proposta de Valor:** headline, CTA e diferenciais configuráveis (incluindo ícones pré-selecionados).
  - **Benchmarking:** cada concorrente possui resumo, classificação, pontos fortes/fracos, diferencial e preço, tudo editável diretamente no card.
- O botão rápido de IA (Sparkles) aciona o mesmo fluxo de referência usado pelo menu contextual.

---

## UX de Referência à IA — Melhorias Recentes

- **CardReferenceBadge (`components/canvas/card-reference-badge.tsx`):**
  - Badge visual mostrando o card atualmente referenciado no painel de IA.
  - Exibe título do card, nome da etapa e usa a cor da etapa dinamicamente.
  - Removível com botão "×".

- **Sugestões Rápidas Contextuais (`components/canvas/ai-suggestions.ts`):**
  - Centralizadas em arquivo único com metadados de todos os cards.
  - Sugestões específicas por tipo de card (ex.: para "problem" sugere gerar hipóteses, criar personas, etc.).
  - Cores dinâmicas baseadas na etapa do card.

- **Markdown no Chat (`components/canvas/message-content.tsx`):**
  - Suporte completo a markdown nas mensagens da IA: emojis, títulos (h1-h6), listas, negrito, itálico, tabelas, código.
  - Renderizado via `react-markdown` com `remark-gfm` e `rehype-raw`.
  - Estilização customizada para tema escuro do painel.

- **Modal de Edição Amigável (`components/canvas/card-edit-modal.tsx`):**
  - Substitui edição de JSON bruto por formulário inteligente.
  - Detecta automaticamente tipos de campo (string, array de strings, array de objetos).
  - Suporte para arrays editáveis com botões adicionar/remover.
  - Toggle entre modo simples (formulário) e modo avançado (JSON).

- **Envio Automático com Contexto:**
  - Ao clicar no botão Sparkles (✨), o card é referenciado E a mensagem é enviada automaticamente.
  - Fluxo otimizado: um clique → contexto + envio.

---

## Formatos Esperados (Etapa 1)

| Card              | Campos obrigatórios (exemplo)                                                                                           |
|-------------------|-------------------------------------------------------------------------------------------------------------------------|
| `project-name`    | `{ "projectName": "…", "description": "…", "createdAt": "ISO-8601 opcional" }`                                          |
| `pitch`           | `{ "pitch": "Frase de 1-2 sentenças com o valor do produto" }`                                                         |
| `problem`         | `{ "problem": "Parágrafos descrevendo a dor", "painPoints": ["Pain 1", "Pain 2", "Pain 3"] }`                          |
| `solution`        | `{ "solution": "Descrição clara", "differentiators": ["Dif 1", "Dif 2", "Dif 3"] }`                                    |
| `target-audience` | `{ "primaryAudience": "Perfil principal", "secondaryAudience": "Perfil secundário ou string vazia" }`                  |
| `initial-kpis`    | `{ "kpis": [{ "name": "Usuários ativos mensais", "target": "1.000" }, …] }` (3 a 6 itens)                              |

> **Importante:** instruções do assistant já reforçam uso único de `update_card` e proíbem placeholders. Mesmo assim, o front filtra entradas genéricas antes de renderizar.

---

## Recursos Úteis

- **Assistants:** `docs/openai-assistants-instructions.md`.
- **Schema Supabase:** `docs/supabase-schema.sql`.
- **Setup do README:** `pistack-app/README.md`.
- **Evento AI → IA:** `pistack:ai:reference-card` (detalhes no AI Sidebar).

---

## Tarefas Pendentes (atualize conforme avançar)

- [x] Criar formulários inline para os cards da Etapa 2 (persona, hipóteses, proposta de valor, benchmarking).
- [x] Disponibilizar ações rápidas (Editar, IA, Excluir) diretamente no cabeçalho dos cards.
- [x] Avaliar UX de "Referenciar para IA" → implementado envio automático com badge visual.
- [x] Criar schemas completos para todos os 38 tipos de cards.
- [x] Adicionar instruções explícitas sobre formatação de arrays nos prompts da IA.
- [x] Implementar modal de edição amigável (formulário inteligente em vez de JSON bruto).
- [x] Adicionar suporte a markdown no chat da IA.
- [ ] **Testar preenchimento de arrays:** validar que cards com arrays (painPoints, kpis, hypotheses, etc.) são corretamente preenchidos pela IA.
- [ ] **Revisar configurações dos Assistants da OpenAI:** atualizar instruções no dashboard da OpenAI para incluir novas regras de array (tarefa manual externa).
- [ ] Migrar cards genéricos das Etapas 3–6 para o padrão de edição inline (formularização + autosave detalhado).
- [ ] Estender normalizações (menu + auto preenchimento) para Etapas 2–6.
- [ ] Adicionar testes automatizados simples (ex.: smoke de `POST /api/cards`) validando fallback e normalização.
- [ ] Corrigir erros de build/TypeScript herdados (rotas `/api/projects/*`, helpers AI) para liberar `tsc --noEmit`.
- [ ] Configurar lint não interativo (migrar de `next lint` para ESLint CLI).
- [ ] Estender formulários e autosave das Etapas 3–6 replicando o padrão da Etapa 2.

*Atualizado em: 2025-10-20.*
