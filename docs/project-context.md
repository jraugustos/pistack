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
   - Botão rápido “Sparkles” de cada card também dispara `pistack:ai:reference-card`.

2. **BaseCard (`components/canvas/cards/base-card.tsx`)**
   - Estrutura padrão de cada card (ícone, título, ações).
   - Botão “⋯” abre menu contextual (Editar, Referenciar IA, Excluir).

3. **AI Sidebar (`components/canvas/ai-sidebar.tsx`)**
   - Carrega histórico via `/api/ai/history`.
   - `pistack:ai:reference-card` preenche automaticamente o input com JSON do card.
   - Ao receber function calls de `create_card`/`update_card`, emite `pistack:cards:refresh`.

4. **Autopreenchimento**
   - `POST /api/cards` cria card vazio, depois aciona `generateCardWithAssistant`.
   - `generateCardWithAssistant` (lib/ai/card-autofill.ts):
     - Obriga `update_card`.
     - Se o assistant não preenche, gera conteúdo fallback via modelo `gpt-4o-mini`.
     - Normaliza `Placeholder1`, arrays e strings diversas.

---

## Etapa 2 — Estado Atual

- Todos os cards da etapa 2 agora contam com edição inline estruturada:
  - **Persona Primária:** inputs separados para nome, idade, cargo, renda e listas editáveis (objetivos, frustrações, comportamentos), com autosave.
  - **Hipóteses de Validação:** cada hipótese possui campos individuais (categoria, narrativa, métrica, confiança/risco) e suporte para adicionar/remover itens.
  - **Proposta de Valor:** headline, CTA e diferenciais configuráveis (incluindo ícones pré-selecionados).
  - **Benchmarking:** cada concorrente possui resumo, classificação, pontos fortes/fracos, diferencial e preço, tudo editável diretamente no card.
- O botão rápido de IA (Sparkles) aciona o mesmo fluxo de referência usado pelo menu contextual.

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
- [ ] Migrar modal de edição global para usar os novos formulários em vez de JSON bruto.
- [ ] Estender normalizações (menu + auto preenchimento) para Etapas 2–6.
- [ ] Revisar assistants das demais etapas garantindo formatos completos (arrays, objetos, etc.).
- [ ] Adicionar testes automatizados simples (ex.: smoke de `POST /api/cards`) validando fallback e normalização.
- [ ] Corrigir erros de build/TypeScript herdados (rotas `/api/projects/*`, helpers AI) para liberar `tsc --noEmit`.
- [ ] Configurar lint não interativo (migrar de `next lint` para ESLint CLI).
- [ ] Estender formulários e autosave das Etapas 3–6 replicando o padrão da Etapa 2.
- [ ] Avaliar UX de “Referenciar para IA” (enviar imediatamente em vez de apenas preencher input?).

*Atualizado em: 2025-10-20.*
