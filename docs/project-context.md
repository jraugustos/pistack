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
| **4 - Design** | 4/5 (wireframes, design-system, components, accessibility) | 1 (user-flows) | 5 |
| **5 - Tecnologia** | 2/6 (tech-stack, architecture) | 4 (database, api-design, infrastructure, security) | 6 |
| **6 - Planejamento** | 2/8 (sprint-planning, risk-management) | 6 (timeline, resources, budget, milestones, success-criteria, launch-plan) | 8 |
| **TOTAL** | **24/35** | **11/35** | **35** |

**Decisão de Design:** Cards mantidos com `GenericTextCard` são menos críticos para estruturação inline ou têm natureza mais textual/descritiva, onde edição livre é mais adequada.

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
  - Corrigido loop de rótulos no card “Público‑Alvo” salvando campos estruturados (`primaryAudience`, `secondaryAudience`) e limpando rótulos.
- [x] **Revisar configurações dos Assistants da OpenAI:** atualizar instruções no dashboard da OpenAI para incluir novas regras de array (tarefa manual externa).
  - Status: Etapas 1 e 2 revisadas e publicadas (arrays JSON válidos, sem bullets/markdown/JSON stringificado; sem labels repetidos; uso exclusivo de update_card; PT‑BR).
  
- [x] Migrar cards da Etapa 3 para o padrão de edição inline (formularização + autosave)
  - Concluídos: `mvp-definition`, `essential-features`, `user-stories`, `acceptance-criteria`, `roadmap`, `scope-constraints`.
  - Normalização aplicada nos arrays correspondentes (lib/array-normalizers.ts).

- [x] Migrar cards das Etapas 4–6 para o padrão de edição inline (formularização + autosave detalhado).
  - **Etapa 4 (Design)**: Concluídos `wireframes-card` (screens[] com elements[]), `design-system-card` (colors, typography, spacing), `components-card` (components[] com variants[]), `accessibility-card` (guidelines[], wcagLevel, considerations[]).
  - **Etapa 5 (Tecnologia)**: Concluídos `tech-stack-card` (frontend[], backend[], infrastructure[], justification), `architecture-card` (type, description, components[]).
    - Demais cards da Etapa 5 mantidos com GenericTextCard por serem menos críticos para fluxo estruturado.
  - **Etapa 6 (Planejamento)**: Concluídos `sprint-planning-card` (sprints[] com goals[] e stories[]), `risk-management-card` (risks[] com probability, impact, mitigation).
    - Demais cards da Etapa 6 mantidos com GenericTextCard (timeline, resources, budget, milestones, success-criteria, launch-plan).
  - Normalizações adicionadas em `lib/array-normalizers.ts` para todos os tipos de cards migrados.
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
- [ ] Configurar lint não interativo (migrar de `next lint` para ESLint CLI).

## Novas funcionalidades
- [ ] Adicionar visão de templates
- [ ] Adicionar botão para criar todos cards de uma etapa de uma vez
- [ ] Visão de list view dos cards no canvas
- [ ] Criação de projeto no formado conversacional. Referência no arquivo @pistack-wizard.html
- [ ] Implementar Project Overview: conforme o usuário vai avançando no projeto, ativa a opção overview, que vai compilar toda visão do projeto e poder exportar em apresentação em um PRD ou  gerar prompts para um vibe coding para produzir o projeto. Referencia no arquivo project-overview.html
- [ ] Implementar light view no canvas e no project overview
- [ ] Implementar página de demo do projeto

## Melhorias
- [ ] IA panel fechar para deixar o canvas mais expandido, o usuário pode clicar e abrir ou ele será aberto quando um card for referenciado
- [ ] Separar aplicação do site
- [ ] Adicionar ordenação (drag-and-drop) nas listas dos cards (features, stories, critérios, roadmap)
- [ ] Indicador discreto de autosave/erro por card e feedback de última atualização

---

## Próximos Passos Priorizados

### Curto Prazo (Próxima Sessão)
1. **Completar cards restantes com estruturação inline** (opcional, caso necessário):
   - Etapa 4: `user-flows-card` (flows[] com steps[])
   - Etapa 5: `database-card` (tables[] com fields[]), `api-design-card` (endpoints[])
   - Etapa 6: `resources-card` (team[], tools[]), `budget-card` (breakdown[])

2. **Configurar lint não interativo:**
   - Migrar de `next lint` para ESLint CLI
   - Adicionar script `lint:ci` para CI/CD

3. **Revisar e atualizar Assistants da OpenAI:**
   - Etapas 3-6 precisam atualização com schemas dos novos cards estruturados
   - Incluir instruções sobre arrays JSON válidos
   - Publicar versões atualizadas

### Médio Prazo (Funcionalidades Novas)
1. **Sistema de Templates:**
   - Criar templates pré-definidos de projetos
   - Permitir usuário salvar seu projeto como template

2. **Batch Creation:**
   - Botão para criar todos os cards de uma etapa de uma vez
   - Progresso visual da criação em lote

3. **List View:**
   - Visão alternativa dos cards em formato de lista
   - Facilitar navegação e overview rápido

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


*Atualizado em: 2025-01-22.*
