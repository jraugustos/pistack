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

## Sistema de Progressão e Gamificação (Sprint 2 - UX Improvements)

### Barra de Progresso e Unlock do Overview

**Implementado em:** Sprint 2 (2025-10-24)

- **Progress Bar na Sidebar (`canvas-sidebar.tsx`):**
  - Exibição visual de X/35 cards criados
  - Percentual com cores dinâmicas:
    - Amarelo (#FFC24B) quando <50%
    - Verde (#5AD19A) quando ≥50%
  - Barra de progresso animada com transições suaves

- **Sistema de Unlock (50% threshold):**
  - Project Overview bloqueado até que 50% dos cards sejam criados (18/35)
  - Mensagem informativa na sidebar (desaparece automaticamente ao atingir 50%)
  - Botões de Overview desabilitados quando <50% com tooltips explicativos
  - Cálculo de progresso em tempo real via evento `pistack:cards:refresh`

- **Navegação Melhorada:**
  - Botão "Nova Etapa" removido da sidebar (simplificação)
  - Botão "Project Overview" adicionado na sidebar (com estados bloqueado/desbloqueado)
  - Botão "Overview" no header também respeita a lógica de unlock

### Batch Creation UX

**Implementado em:** Sprint 2 (2025-10-24)

- **"Criar Todos" no Dropdown (`stage-section.tsx`):**
  - Botão movido para dentro do dropdown de cada etapa (última posição após separador)
  - Mostra contador de cards disponíveis: "Criar Todos (X)"
  - Só aparece quando há 2+ cards disponíveis na etapa

- **Modal de Progresso (`batch-creation-modal.tsx`):**
  - Banner informativo: "⏱️ Cada card leva ~60s para ser preenchido pela IA"
  - Progress bar visual mostrando X/Y cards criados
  - Lista de cards com status (pendente/criando/completo)
  - Animação de conclusão ao finalizar

- **Melhorias Técnicas:**
  - Timeout aumentado de 30s para 90s para evitar abort prematuro
  - Logs detalhados em cada etapa do processo batch
  - Tratamento robusto de erros com mensagens específicas
  - Throttling automático entre criação de cards

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

## Estado Técnico Atual

### Build e Dependências
- **Status do Build:** ✅ **Passando** (sem erros TypeScript/ESLint)
- **Next.js:** 14.2.25 (estável, downgrade de 15.5.5 para compatibilidade com Clerk)
- **React:** 18.3.1 (estável, downgrade de 19 para compatibilidade)
- **TypeScript:** Configurado com strict mode
- **Clerk Auth:** Integrado e funcional

### Cards por Etapa (Status de Implementação)

| Etapa | Cards Estruturados | Cards GenericText | Total |
|-------|-------------------|-------------------|-------|
| **1 - Conceituação** | 6/6 (problem, solution, pitch, etc) | 0 | 6 |
| **2 - Validação** | 4/4 (persona, hipóteses, proposta, benchmarking) | 0 | 4 |
| **3 - Escopo** | 6/6 (MVP, features, stories, criteria, roadmap, constraints) | 0 | 6 |
| **4 - Design** | 5/5 (wireframes, design-system, components, accessibility, user-flows) | 0 | 5 |
| **5 - Tecnologia** | 6/6 (tech-stack, architecture, database, api-design, infrastructure, security) | 0 | 6 |
| **6 - Planejamento** | 8/8 (sprint-planning, risk-management, timeline, resources, budget, milestones, success-criteria, launch-plan) | 0 | 8 |
| **TOTAL** | **35/35** (100%) | **0/35** (0%) | **35** |

✅ **TODOS OS CARDS IMPLEMENTADOS COM EDIÇÃO INLINE ESTRUTURADA**

### Normalizações Implementadas
- Todas as etapas (1-6) possuem normalização de arrays em `lib/array-normalizers.ts`
- Cobertura: 35 tipos de cards com sanitização e validação
- Testes: Smoke tests para arrays e POST /api/cards

---

## Tarefas Pendentes (atualize conforme avançar)

- [x] Criar formulários inline para os cards da Etapa 2 (persona, hipóteses, proposta de valor, benchmarking).
- [x] Disponibilizar ações rápidas (Editar, IA, Excluir) diretamente no cabeçalho dos cards.
- [x] Avaliar UX de "Referenciar para IA" → implementado envio automático com badge visual.
- [x] Criar schemas completos para todos os 38 tipos de cards.
- [x] Adicionar instruções explícitas sobre formatação de arrays nos prompts da IA.
- [x] Implementar modal de edição amigável (formulário inteligente em vez de JSON bruto).
- [x] Adicionar suporte a markdown no chat da IA.
- [x] **Testar preenchimento de arrays:** validar que cards com arrays (painPoints, kpis, hypotheses, etc.) são corretamente preenchidos pela IA.
  - Implementado smoke test local: `npm --prefix pistack-app run test:arrays`.
  - Cobertura atual: `painPoints`, `differentiators`, `kpis`, `hypotheses`, `persona(goals/frustrations/motivations)`, `benchmarking(competitors)`.
  - Fixtures: `pistack-app/scripts/fixtures/arrays.json`.
  - Validadores utilitários: `pistack-app/lib/array-validators.ts`.
- [x] **Normalizações centralizadas de arrays (Etapas 2–6):**
  - Criado `pistack-app/lib/array-normalizers.ts` com `toArrayOfStrings`, `normalizeKpis`, `normalizeCardArrays`.
  - Integrado no autopreenchimento da IA (`lib/ai/card-autofill.ts`) e na renderização (`components/canvas/stage-section.tsx`).
- [x] **Sistema de Progressão e Unlock do Project Overview (50%):**
  - Barra de progresso visual na sidebar mostrando X/35 cards criados
  - Project Overview desbloqueado quando ≥50% dos cards estão criados
  - Mensagem informativa na sidebar (desaparece ao atingir 50%)
  - Botão Overview adicionado na sidebar (com estado bloqueado/desbloqueado)
  - Botão Overview no header desabilitado quando <50% com tooltip dinâmico
  - Cálculo de progresso integrado via evento `pistack:cards:refresh`
- [x] **Batch Creation UX (Criar Todos os Cards):**
  - Botão "Criar Todos" movido para dentro do dropdown de cada etapa (última posição)
  - Modal de progresso com banner informativo (~60s por card)
  - Timeout aumentado para 90s para evitar abort prematuro
  - Logs detalhados para debugging do processo de criação em lote
  - Corrigido loop de rótulos no card “Público‑Alvo” salvando campos estruturados (`primaryAudience`, `secondaryAudience`) e limpando rótulos.
- [x] **Revisar configurações dos Assistants da OpenAI:** atualizar instruções no dashboard da OpenAI para incluir novas regras de array (tarefa manual externa).
  - Status: Etapas 1 e 2 revisadas e publicadas (arrays JSON válidos, sem bullets/markdown/JSON stringificado; sem labels repetidos; uso exclusivo de update_card; PT‑BR).
  
- [x] Migrar cards da Etapa 3 para o padrão de edição inline (formularização + autosave)
  - Concluídos: `mvp-definition`, `essential-features`, `user-stories`, `acceptance-criteria`, `roadmap`, `scope-constraints`.
  - Normalização aplicada nos arrays correspondentes (lib/array-normalizers.ts).

- [x] Migrar cards das Etapas 4–6 para o padrão de edição inline (formularização + autosave detalhado).
  - **Etapa 4 (Design)**: ✅ **100% COMPLETO** - Todos os 5 cards migrados:
    - `wireframes-card` (screens[] com elements[])
    - `design-system-card` (colors, typography, spacing)
    - `components-card` (components[] com variants[])
    - `accessibility-card` (guidelines[], wcagLevel, considerations[])
    - `user-flows-card` (flows[] com description e steps[])
  - **Etapa 5 (Tecnologia)**: ✅ **100% COMPLETO** - Todos os 6 cards migrados:
    - `tech-stack-card` (frontend[], backend[], infrastructure[], justification)
    - `architecture-card` (type, description, components[])
    - `database-card` (type, description, tables[] com fields[], relationships[])
    - `api-design-card` (architecture, authentication, endpoints[] com method/path/request/response)
    - `infrastructure-card` (hosting, cicd, monitoring[], logging[], deployment)
    - `security-card` (authentication, authorization, encryption, measures[], compliance[])
  - **Etapa 6 (Planejamento)**: ✅ **100% COMPLETO** - Todos os 8 cards migrados:
    - `sprint-planning-card` (sprints[] com goals[] e stories[])
    - `risk-management-card` (risks[] com probability, impact, mitigation)
    - `timeline-card` (startDate, endDate, milestones[] com deliverables[])
    - `resources-card` (team[] com skills[], tools[], budget)
    - `budget-card` (totalBudget, currency, breakdown[] com category/value)
    - `milestones-card` (milestones[] com title/date/status/deliverable)
    - `success-criteria-card` (criteria[] com metric/target/measurement)
    - `launch-plan-card` (launchDate, strategy, phases[] com activities[])
  - Normalizações adicionadas em `lib/array-normalizers.ts` para todos os tipos de cards migrados.
  - **Status Global: ✅ 35/35 cards (100%) com edição inline estruturada.**
- [x] Adicionar testes automatizados simples (ex.: smoke de `POST /api/cards`) validando fallback e normalização.
  - Scripts:
    - `npm --prefix pistack-app run test:arrays` (arrays gerais Etapas 2–6)
    - `npm --prefix pistack-app run test:cards-smoke` (POST /api/cards — offline smoke de sanitização + normalização)
  - Fixtures: `pistack-app/scripts/fixtures/arrays.json`, `pistack-app/scripts/fixtures/cards-post.json`.
  - Observação: smoke “offline” simula a etapa de sanitização e normalização aplicada no autopopulate sem depender de ambiente externo.
- [x] Corrigir erros de build/TypeScript herdados.
  - Exportado `sanitizeAIResponse` em `lib/ai/card-autofill.ts` para uso em `function-handlers.ts`.
  - Corrigidas tipagens implícitas em callbacks `.map()` nos seguintes cards:
    - `etapa-3/scope-constraints-card.tsx`
    - `etapa-4/accessibility-card.tsx`
    - `etapa-5/architecture-card.tsx`
    - `etapa-5/tech-stack-card.tsx`
    - `etapa-6/risk-management-card.tsx`
    - `etapa-6/sprint-planning-card.tsx`
  - **Status do Build:** ✅ Passando sem erros TypeScript.
- [x] Configurar lint não interativo (migrar de `next lint` para ESLint CLI).
  - ✅ Criado `.eslintrc.json` com configuração Next.js + TypeScript
  - ✅ Adicionado ESLint 8.57 como devDependency
  - ✅ Script `lint` atualizado para `eslint . --ext .ts,.tsx --max-warnings 0`
  - ✅ Script `lint:fix` adicionado para auto-fix

- [x] IA panel fechar para deixar o canvas mais expandido, o usuário pode clicar e abrir ou ele será aberto quando um card for referenciado ✅ **Sprint 1 - Tarefa 1**
- [ ] Separar aplicação do site
- [ ] Adicionar ordenação (drag-and-drop) nas listas dos cards (features, stories, critérios, roadmap)
- [x] Indicador discreto de autosave/erro por card e feedback de última atualização ✅ **Sprint 1 - Tarefa 2**
- [ ] Templates personalizados

---

## Otimizações de Performance da IA (Sprint 1 - Tarefa 2)

### Sistema de Cache e Deduplicação

**Implementado em:** [lib/ai/request-cache.ts](../pistack-app/lib/ai/request-cache.ts)

- **AIRequestCache:** classe genérica para cache de requisições com TTL configurável
- **Deduplicação automática:** múltiplas requisições simultâneas com os mesmos parâmetros retornam a mesma Promise
- **Limpeza automática:** remove entradas expiradas a cada 10 minutos
- **Métodos principais:**
  - `get(params)`: recupera do cache se válido
  - `set(params, data, ttl)`: armazena no cache
  - `deduplicate(params, requestFn)`: previne requisições duplicadas em paralelo
  - `invalidate(params)`: invalida cache para parâmetros específicos

**Integração:** `generateCardWithAssistant` ([lib/ai/card-autofill.ts](../pistack-app/lib/ai/card-autofill.ts:723)) envolve toda a lógica de geração em `aiCache.deduplicate()`.

### Debounce e Rate Limiting

**Implementado em:** [hooks/use-debounced-ai.ts](../pistack-app/hooks/use-debounced-ai.ts)

- **useDebouncedAI:** hook genérico para debounce de funções async
  - Delay configurável (padrão: 1000ms)
  - Suporte a leading/trailing execution
  - Previne execução se requisição já está em progresso

- **useAIButtonGuard:** hook específico para botões de IA
  - Intervalo mínimo de 2 segundos entre cliques
  - Reset manual ou automático por botão
  - Logs de bloqueio para debugging

**Integração:** `StageSection` ([components/canvas/stage-section.tsx](../pistack-app/components/canvas/stage-section.tsx:873)) usa `useAIButtonGuard` no `handleAddCard`.

### Impacto Esperado

- **Redução de custos:** elimina requisições duplicadas à API da OpenAI
- **Melhor UX:** previne múltiplos cards criados por cliques acidentais
- **Performance:** cache reduz latência em requisições repetidas
- **Confiabilidade:** deduplicação evita race conditions

---

## Próximos Passos Priorizados

### Roadmap para 100% de Estruturação Inline (Opcional)

**Cards restantes que poderiam ser migrados:**

**Etapa 5 (4 cards):**
1. `database-card` → tables[] com fields[]
2. `api-design-card` → endpoints[] (method, path, description)
3. `infrastructure-card` → hosting, services[], cicd, monitoring[]
4. `security-card` → measures[], authentication, dataProtection, compliance[]

**Etapa 6 (6 cards):**
1. `timeline-card` → milestones[] (name, date, deliverables[])
2. `resources-card` → team[] (role, quantity, skills[]), tools[]
3. `budget-card` → totalEstimate, breakdown[] (category, amount, items[])
4. `milestones-card` → milestones[] (name, description, deadline, deliverables[])
5. `success-criteria-card` → criteria[] (metric, target, measurement)
6. `launch-plan-card` → phases[] (name, activities[], timeline)

**Nota:** Estes cards são menos críticos para o MVP do sistema e funcionam bem com GenericTextCard para edição livre. A decisão de migrar depende de:
- Necessidade de estrutura rígida para integrações futuras
- Feedback de usuários sobre UX de edição
- Priorização de features vs. refinamento

### Curto Prazo (Próxima Sessão)
1. **Configurar lint não interativo:**
   - Migrar de `next lint` para ESLint CLI
   - Adicionar script `lint:ci` para CI/CD

3. **Revisar e atualizar Assistants da OpenAI:**
   - Etapas 3-6 precisam atualização com schemas dos novos cards estruturados
   - Incluir instruções sobre arrays JSON válidos
   - Publicar versões atualizadas

### Médio Prazo (Sprint 2 - Parte 2 - PLANEJADO)

**🎯 Power User Features (13-18h total):**

1. **List View dos Cards (6-8h)** - 📋 PLANEJADO
   - Visão alternativa em formato de lista
   - Filtros por etapa e status de completude
   - Busca textual em tempo real (debounced 300ms)
   - Ordenação: etapa, data, alfabético, completude
   - Virtualização automática com 50+ cards
   - Toggle grid/list persistente (localStorage)

2. **Menções com @ (4-6h)** - 📋 PLANEJADO
   - Autocomplete de cards ao digitar @
   - Múltiplas menções na mesma mensagem
   - Badges visuais para cards mencionados
   - Envio de contexto estruturado para IA
   - Navegação por teclado (↑↓ Enter Escape)

3. **Command Palette com / (3-4h)** - 📋 PLANEJADO
   - Atalhos rápidos para ações comuns
   - Comandos: clear-chat, batch-create, export-prd, goto-overview, help
   - Agrupamento por categoria
   - Atalhos de teclado opcionais (Cmd+K)

**Ordem de implementação:**
1. List View (base para as outras)
2. Menções @ (reutiliza busca da List View)
3. Command Palette (consolida tudo)

**Dependências:**
```bash
npm install react-window  # Virtualização de listas
npm install react-hotkeys-hook fuse.js  # Opcionais
```

**Arquivos novos:** ~15-20 arquivos
**Arquivos modificados:** 3-5 arquivos principais

4. **Sistema de Templates:**
   - Criar templates pré-definidos de projetos
   - Permitir usuário salvar seu projeto como template

### Longo Prazo (Grandes Features)
1. **Modo Conversacional (Wizard):**
   - Criar projeto via chat guiado (referência: `pistack-wizard.html`)
   - Assistente virtual que questiona e preenche cards

2. **Project Overview:**
   - Compilação automática da visão do projeto
   - Exportação em PRD, apresentação ou prompt para vibe coding
   - Referência: `project-overview.html`

3. **Light Mode:**
   - Tema claro para canvas e project overview
   - Toggle dinâmico de tema

4. **Demo Page:**
   - Página pública para demonstração do produto


*Atualizado em: 2025-10-24.*
