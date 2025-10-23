# 🗺️ PIStack - Roadmap de Desenvolvimento

**Última atualização:** 2025-10-23
**Versão atual:** v1.0 (MVP Completo - 35/35 cards)

---

## 📊 Estado Atual

### ✅ Conquistas (v1.0)

**Fundação Técnica Sólida:**
- ✅ 35/35 cards com edição inline estruturada (100%)
- ✅ Build TypeScript/ESLint passando sem erros
- ✅ Normalização completa de arrays implementada
- ✅ Testes automatizados (arrays + POST cards)
- ✅ ESLint CLI não-interativo configurado
- ✅ Assistants da OpenAI com instruções atualizadas
- ✅ Sistema de autosave por card
- ✅ IA integrada com function calling

**UX Polida:**
- ✅ Markdown no chat da IA
- ✅ Badges de referência de cards
- ✅ Sugestões contextuais inteligentes
- ✅ Modal de edição amigável
- ✅ Envio automático com contexto
- ✅ **IA Panel Colapsável** (Sprint 1 - Tarefa 1)
- ✅ **Indicador de Autosave** (Sprint 1 - Tarefa 2)

**Stack Estável:**
- Next.js 14.2.25 + React 18.3.1
- TypeScript strict mode
- Clerk auth integrado
- Supabase (PostgreSQL com RLS)

---

## 🎯 Princípios de Priorização

Ao decidir o que implementar, seguimos estes critérios:

1. **Impacto no Usuário** > Complexidade Técnica
2. **Quick Wins** (alto impacto, baixo esforço) > Features complexas
3. **Validação** antes de grandes investimentos
4. **Diferenciação** competitiva > Features "me too"
5. **Retenção** > Aquisição (produto precisa funcionar antes de escalar)

**Fórmula de Priorização:**
```
Prioridade = (Impacto no Usuário × Diferenciação Competitiva) / Esforço de Implementação
```

---

## 📈 Sistema de Classificação

### TIER 1: Quick Wins UX 🔥
*Alto impacto + Baixo esforço + Implementação rápida*

**Quando:** Imediatamente (próximas 1-2 semanas)
**Por quê:** Melhoria perceptível imediata, resolve friction points conhecidos

### TIER 2: Diferenciação do Produto 🎨
*Alto valor estratégico + Médio esforço*

**Quando:** Após Quick Wins (2-4 semanas)
**Por quê:** Features que nenhum concorrente tem, justificam premium pricing

### TIER 3: Escala e Retenção 📈
*Essencial para crescimento + Alto esforço*

**Quando:** Após validação de product-market fit (1-2 meses)
**Por quê:** Necessário para suportar base de usuários crescente

### TIER 4: Polish e Infraestrutura ✨
*Nice to have + Esforço variável*

**Quando:** Baseado em feedback de usuários reais
**Por quê:** Só implementar se houver demanda clara

---

## 🚀 Roadmap por Sprints

### Sprint 1: Quick Wins UX (1-2 semanas)

**Objetivo:** Melhorar UX imediatamente com mudanças de alto impacto

| # | Feature | Prioridade | Esforço | Status |
|---|---------|-----------|---------|--------|
| 1 | IA Panel Colapsável | ⭐⭐⭐⭐⭐ | 2-3h | ✅ **COMPLETO** |
| 2 | Indicador de Autosave | ⭐⭐⭐⭐ | 3-4h | ✅ **COMPLETO** |
| 3 | Batch Creation (Criar Etapa Completa) | ⭐⭐⭐⭐ | 4-6h | 🔴 Pendente |

**Total estimado:** 9-13 horas (5-7h concluídas - 66% concluído)**
**Impacto esperado:** Canvas mais espaçoso, onboarding 70% mais rápido, redução de ansiedade do usuário

**✅ Tarefas Concluídas:**

**Tarefa 1 - IA Panel Colapsável:**
- Sistema de collapse/expand implementado
- Estado persistente no localStorage
- Animações suaves de transição
- Canvas expande responsivamente quando painel colapsa

**Tarefa 2 - Indicador de Autosave:**
- Hook `useAutosave` estendido com estados observáveis (`pending`, `saving`, `saved`, `error`)
- Componente `SaveIndicator` criado com duas variantes (completo e compacto)
- Integrado no `BaseCard` via prop `saveIndicator`
- Exemplo implementado no `PitchCard`
- Build passando sem erros

---

### Sprint 2: Diferenciação (2-3 semanas)

**Objetivo:** Implementar features killer que diferenciam o PIStack

| # | Feature | Prioridade | Esforço | Status |
|---|---------|-----------|---------|--------|
| 4 | Project Overview (compilação básica) | ⭐⭐⭐⭐⭐ | 5h | 🔴 Pendente |
| 5 | Export PRD | ⭐⭐⭐⭐⭐ | 3h | 🔴 Pendente |
| 6 | Export Pitch Deck Outline | ⭐⭐⭐⭐⭐ | 3h | 🔴 Pendente |
| 7 | List View dos Cards | ⭐⭐⭐⭐ | 6-8h | 🔴 Pendente |

**Total estimado:** 17-19 horas
**Impacto esperado:** Tangibilização do valor criado, uso profissional, compartilhamento viral

---

### Sprint 3: Escala (3-4 semanas)

**Objetivo:** Preparar produto para crescimento e reduzir fricção inicial

| # | Feature | Prioridade | Esforço | Status |
|---|---------|-----------|---------|--------|
| 8 | Templates Públicos (5 templates) | ⭐⭐⭐⭐⭐ | 8h | 🔴 Pendente |
| 9 | Salvar Projeto como Template | ⭐⭐⭐⭐⭐ | 4h | 🔴 Pendente |
| 10 | Template Gallery UI | ⭐⭐⭐⭐ | 4h | 🔴 Pendente |
| 11 | Demo Page Pública | ⭐⭐⭐⭐ | 6-10h | 🔴 Pendente |

**Total estimado:** 22-26 horas
**Impacto esperado:** Redução de 80% no cold start, inspiração por exemplos reais

---

### Sprint 4+: Longo Prazo (após validação)

**Objetivo:** Features avançadas baseadas em feedback de usuários

| # | Feature | Prioridade | Esforço | Status |
|---|---------|-----------|---------|--------|
| 12 | Wizard Conversacional | ⭐⭐⭐⭐⭐ | 20-30h | ⏸️ Aguardando validação |
| 13 | Drag & Drop nas Listas | ⭐⭐⭐ | 6-8h | ⏸️ Se usuários pedirem |
| 14 | Vibe Coding Prompt Generator | ⭐⭐⭐⭐ | 4h | ⏸️ Extensão do Overview |
| 15 | Separar App do Site Marketing | ⭐⭐⭐ | 4-6h | ⏸️ Quando escalar marketing |
| 16 | Light Mode | ⭐⭐ | 8-12h | ⏸️ Só se houver demanda |

---

## 🔥 TIER 1: Quick Wins UX

### 1. IA Panel Colapsável ⭐⭐⭐⭐⭐

**Esforço:** 2-3 horas
**Impacto:** ALTO
**Status:** ✅ **COMPLETO** (2025-10-23)

#### Problema que Resolve
- Canvas fica espremido com painel de IA sempre aberto
- Usuários querem focar no canvas sem distrações
- Desperdício de espaço horizontal

#### Solução Proposta
- Painel de IA colapsa para uma barra lateral fina (40-60px)
- Abre automaticamente quando:
  - Usuário clica no botão Sparkles (✨) de um card
  - Usuário clica no ícone da IA na barra colapsada
  - Evento `pistack:ai:reference-card` é disparado
- Fecha manualmente com botão "×" ou clique fora

#### Implementação Técnica
```typescript
// Estado no canvas-area.tsx
const [isSidebarOpen, setIsSidebarOpen] = useState(false)

// Event listener para abrir automaticamente
useEffect(() => {
  const handleReference = () => setIsSidebarOpen(true)
  window.addEventListener('pistack:ai:reference-card', handleReference)
  return () => window.removeEventListener('pistack:ai:reference-card', handleReference)
}, [])

// CSS transition suave (300ms ease-out)
<div className={`transition-all duration-300 ${isSidebarOpen ? 'w-96' : 'w-14'}`}>
```

#### Acceptance Criteria
- [x] Painel colapsa para 40-60px de largura
- [x] Abre automaticamente ao clicar em Sparkles
- [x] Fecha com botão × ou tecla ESC
- [x] Transição suave (300ms)
- [x] Estado persiste durante a sessão (localStorage)
- [x] Canvas expande/contrai responsivamente

#### Implementação Realizada

**Funcionalidades:**
- Toggle button no topo do painel de IA
- Abertura automática ao clicar no botão Sparkles (✨) de qualquer card
- Estado persistente usando `localStorage` (chave: `pistack:ai-sidebar-collapsed`)
- Transições CSS suaves (300ms ease-in-out)
- Canvas ajusta largura automaticamente quando painel colapsa/expande

**Comportamento:**
- Painel colapsado: largura mínima, mostra apenas ícone de IA
- Painel expandido: largura completa com chat e histórico
- Clique em Sparkles de qualquer card: expande painel automaticamente
- Clique no botão toggle: alterna estado e persiste no localStorage

#### Arquivos Afetados
- ✅ `components/canvas/canvas-area.tsx` - Gerenciamento de estado do painel
- ✅ `components/canvas/ai-sidebar.tsx` - UI de collapse/expand
- ✅ `components/canvas/cards/base-card.tsx` - Botão Sparkles conectado ao evento

---

### 2. Indicador de Autosave ⭐⭐⭐⭐

**Esforço:** 3-4 horas
**Impacto:** MÉDIO-ALTO
**Status:** ✅ **COMPLETO** (2025-10-23)

#### Problema que Resolve
- Usuários não sabem se o card foi salvo
- Ansiedade sobre perda de dados
- Falta de feedback visual profissional

#### Solução Proposta
Badge discreto no canto superior direito de cada card:
- **Estado 1:** "Salvando..." (spinner animado, cor azul)
- **Estado 2:** "Salvo ✓" (checkmark verde, fade after 2s)
- **Estado 3:** "Erro ao salvar" (ícone vermelho, persiste até resolver)
- **Hover:** Mostra timestamp da última atualização

#### Implementação Técnica
```typescript
// Hook customizado no useAutosave
export function useAutosave(data, { onSave, delay }) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Debounce e save logic
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      setSaveStatus('saving')
      try {
        await onSave(data)
        setSaveStatus('saved')
        setLastSaved(new Date())
        setTimeout(() => setSaveStatus('idle'), 2000) // Fade out
      } catch (error) {
        setSaveStatus('error')
      }
    }, delay)
    return () => clearTimeout(timeoutId)
  }, [data])

  return { saveStatus, lastSaved }
}

// Componente visual
<SaveIndicator status={saveStatus} lastSaved={lastSaved} />
```

#### Acceptance Criteria
- [x] Badge aparece durante save (spinner + "Salvando...")
- [x] Badge muda para "Salvo ✓" após sucesso
- [x] Badge desaparece após 2 segundos
- [x] Erro persiste até usuário tentar novamente
- [x] Hover mostra "Última atualização: há X minutos" (usando date-fns)
- [x] Posicionamento não atrapalha conteúdo do card (absolute top-right)

#### Implementação Realizada

**Estados de Save:**
- `idle`: não mostra nada
- `pending`: mostra relógio (aguardando debounce)
- `saving`: mostra spinner azul + "Salvando..."
- `saved`: mostra check verde + "Salvo" (auto-hide após 2s)
- `error`: mostra alerta vermelho + mensagem de erro

**Componentes Criados:**
1. **`SaveIndicator`**: versão completa com ícone + texto
2. **`SaveIndicatorCompact`**: versão apenas com ícone (recomendada para cards)

**Hook Estendido:**
- `useAutosave` agora retorna: `{ saveStatus, lastSaved, error, isSaving, save }`
- Estados reativos via `useState`
- Auto-hide do status "saved" após 2 segundos
- Formatação de timestamp com `date-fns` + locale pt-BR

#### Arquivos Afetados
- ✅ `hooks/use-autosave.ts` - Estendido com estados observáveis
- ✅ `components/canvas/cards/base-card.tsx` - Adicionado prop `saveIndicator`
- ✅ `components/canvas/save-indicator.tsx` - Novo componente criado
- ✅ `components/canvas/cards/etapa-1/pitch-card.tsx` - Exemplo de integração

#### Próximos Passos
Para aplicar o indicador em todos os cards que usam autosave, seguir este padrão:

```typescript
// 1. Importar o componente
import { SaveIndicatorCompact } from '@/components/canvas/save-indicator'

// 2. Capturar estados do useAutosave
const { saveStatus, lastSaved, error } = useAutosave(localData, { ... })

// 3. Passar para o BaseCard
<BaseCard
  saveIndicator={
    <SaveIndicatorCompact
      status={saveStatus}
      lastSaved={lastSaved}
      error={error}
    />
  }
  ...
/>
```

**Cards pendentes de integração:** 34 cards (todos exceto pitch-card)

---

### 3. Batch Creation (Criar Etapa Completa) ⭐⭐⭐⭐

**Esforço:** 4-6 horas
**Impacto:** ALTO
**Status:** 🔴 Pendente

#### Problema que Resolve
- Criar 35 cards manualmente é tedioso
- Usuários abandonam por friction inicial
- Canvas vazio não mostra valor imediato

#### Solução Proposta
Botão no cabeçalho de cada etapa:
```
✨ Criar Todos os Cards da Etapa {N}
```
- Cria todos os cards da etapa em sequência
- Cada card é auto-preenchido pela IA
- Progresso visual mostra criação em tempo real
- Throttle de 500ms entre cards (evitar sobrecarga API)

#### Implementação Técnica
```typescript
// Mapeamento de cards por etapa
const STAGE_CARDS_MAP = {
  1: ['project-name', 'pitch', 'problem', 'solution', 'target-audience', 'initial-kpis'],
  2: ['validation-hypotheses', 'primary-persona', 'value-proposition', 'benchmarking'],
  3: ['mvp-definition', 'essential-features', 'user-stories', 'acceptance-criteria', 'roadmap', 'scope-constraints'],
  4: ['wireframes', 'design-system', 'components', 'accessibility', 'user-flows'],
  5: ['tech-stack', 'architecture', 'database', 'api-design', 'infrastructure', 'security'],
  6: ['sprint-planning', 'risk-management', 'timeline', 'resources', 'budget', 'milestones', 'success-criteria', 'launch-plan']
}

// Função de criação em batch
async function createAllCardsForStage(projectId: string, stageId: number) {
  const cardTypes = STAGE_CARDS_MAP[stageId]

  for (const [index, cardType] of cardTypes.entries()) {
    setProgress({ current: index + 1, total: cardTypes.length, currentCard: cardType })

    await fetch('/api/cards', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        stage_id: stageId,
        card_type: cardType,
        position: index
      })
    })

    await delay(500) // Throttle para não sobrecarregar
  }

  // Refresh após completar
  window.dispatchEvent(new Event('pistack:cards:refresh'))
}
```

#### UI/UX
- Modal de progresso com:
  - Barra de progresso (X/Y cards criados)
  - Nome do card sendo criado no momento
  - Animação de sucesso ao completar
  - Opção de cancelar (para etapas)

#### Acceptance Criteria
- [ ] Botão aparece no header de cada StageSection
- [ ] Modal mostra progresso em tempo real
- [ ] Throttle de 500ms entre criações
- [ ] Cards são auto-preenchidos pela IA
- [ ] Evento de refresh dispara ao final
- [ ] Tratamento de erro se algum card falhar
- [ ] Usuário pode cancelar operação

#### Arquivos Afetados
- `components/canvas/stage-section.tsx`
- Novo componente: `components/canvas/batch-creation-modal.tsx`
- `app/api/cards/route.ts` (verificar rate limiting)

---

## 🎨 TIER 2: Diferenciação do Produto

### 4. Project Overview ⭐⭐⭐⭐⭐

**Esforço:** 5 horas (overview básico)
**Impacto:** MUITO ALTO
**Status:** 🔴 Pendente

#### Problema que Resolve
- Usuários não veem o "big picture" do projeto
- Difícil apresentar para stakeholders
- Canvas preenchido não gera artefato tangível

#### Solução Proposta
Página `/projects/[id]/overview` que compila todos os cards em documento estruturado:

**Seções:**
1. **Overview Executivo** (cards da Etapa 1)
2. **Validação de Mercado** (cards da Etapa 2)
3. **Escopo do Produto** (cards da Etapa 3)
4. **Design & UX** (cards da Etapa 4)
5. **Arquitetura Técnica** (cards da Etapa 5)
6. **Plano de Execução** (cards da Etapa 6)

#### Implementação Técnica
```typescript
// Rota: app/projects/[id]/overview/page.tsx
export default async function ProjectOverviewPage({ params }) {
  const cards = await getAllProjectCards(params.id)
  const groupedByStage = groupCardsByStage(cards)

  return (
    <OverviewLayout>
      <OverviewHeader project={project} />

      {Object.entries(groupedByStage).map(([stageId, cards]) => (
        <StageOverview key={stageId} stage={stageId} cards={cards} />
      ))}

      <ExportActions />
    </OverviewLayout>
  )
}
```

#### Acceptance Criteria
- [ ] Compilação de todos os cards em documento único
- [ ] Navegação por seções (etapas)
- [ ] Cards vazios não aparecem
- [ ] Markdown renderizado corretamente
- [ ] Responsivo (desktop + mobile)
- [ ] Print-friendly CSS

#### Referência
- Protótipo: `html/project-overview.html`

---

### 5. Export PRD ⭐⭐⭐⭐⭐

**Esforço:** 3 horas
**Impacto:** MUITO ALTO
**Status:** 🔴 Pendente

#### Solução Proposta
Botão "Export PRD" na página de Overview que gera documento profissional:

**Formato:** Markdown → PDF (ou HTML estilizado)

**Template PRD:**
```markdown
# Product Requirements Document
## [Nome do Projeto]

---

### 1. Executive Summary
[Pitch + Problema + Solução]

### 2. Market Validation
#### Target Audience
[Primary + Secondary]

#### Competitive Analysis
[Benchmarking resumido]

### 3. Product Scope
#### MVP Features
[Lista priorizada]

#### Success Criteria
[Métricas de sucesso]

#### Roadmap
[Fases de lançamento]

### 4. Technical Architecture
#### Stack
[Frontend + Backend + Database]

#### Security & Compliance
[Medidas implementadas]

### 5. Execution Plan
#### Timeline
[Marcos principais]

#### Budget
[Breakdown consolidado]

#### Risks & Mitigation
[Top 3-5 riscos]

---
Generated by PIStack • [Data]
```

#### Implementação
```typescript
// app/api/projects/[id]/export/prd/route.ts
export async function GET(req, { params }) {
  const cards = await getAllProjectCards(params.id)
  const markdown = generatePRDMarkdown(cards)

  // Opção 1: Retornar markdown
  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown',
      'Content-Disposition': 'attachment; filename="PRD.md"'
    }
  })

  // Opção 2: Converter para PDF (usar lib como 'md-to-pdf')
}
```

#### Acceptance Criteria
- [ ] Botão de export na página Overview
- [ ] Download como .md ou .pdf
- [ ] Template profissional e limpo
- [ ] Logo do projeto (se houver)
- [ ] Índice clicável
- [ ] Formatação consistente

---

### 6. Export Pitch Deck Outline ⭐⭐⭐⭐⭐

**Esforço:** 3 horas
**Impacto:** MUITO ALTO
**Status:** 🔴 Pendente

#### Solução Proposta
Gerar outline de pitch deck (10 slides) com bullet points:

**Estrutura:**
```
Slide 1: Problema (Etapa 1 - Problem card)
Slide 2: Solução (Etapa 1 - Solution card)
Slide 3: Mercado & Personas (Etapa 2 - Persona + Benchmarking)
Slide 4: Produto MVP (Etapa 3 - MVP Features)
Slide 5: Design & UX (Etapa 4 - Wireframes preview)
Slide 6: Tecnologia (Etapa 5 - Stack + Architecture)
Slide 7: Go-to-Market (Etapa 6 - Launch Plan)
Slide 8: Roadmap (Etapa 3 + 6 - Roadmap + Timeline)
Slide 9: Equipe (Etapa 6 - Resources)
Slide 10: Financeiro - The Ask (Etapa 6 - Budget)
```

#### Implementação
```typescript
// Template de slide em markdown
function generateSlideMarkdown(slideNumber, title, bullets) {
  return `
---
### Slide ${slideNumber}: ${title}

${bullets.map(b => `- ${b}`).join('\n')}

**Sugestão visual:** [Descrição de imagem/gráfico sugerido]
---
`
}
```

#### Acceptance Criteria
- [ ] 10 slides com estrutura clara
- [ ] Bullet points concisos (3-5 por slide)
- [ ] Sugestões de visuais
- [ ] Download como .md ou .pptx outline
- [ ] Preview antes de exportar

---

### 7. List View dos Cards ⭐⭐⭐⭐

**Esforço:** 6-8 horas
**Impacto:** MÉDIO-ALTO
**Status:** 🔴 Pendente

#### Problema que Resolve
- Navegação difícil em projetos grandes
- Overview rápido é importante
- Grid view não é ideal para busca/filtros

#### Solução Proposta
Toggle entre Grid View (atual) e List View:

**List View mostra:**
- Título do card
- Etapa (com cor)
- Status (vazio, preenchido, completo)
- Última edição (timestamp)
- Ações rápidas (editar, IA, excluir)

**Features:**
- Filtros: por etapa, por completude
- Busca textual (busca no título e conteúdo)
- Ordenação: alfabética, cronológica, por etapa

#### Implementação
```typescript
// Toggle view mode
<ViewModeToggle
  mode={viewMode}
  onChange={setViewMode}
  options={['grid', 'list']}
/>

// List view component
<ListView cards={cards}>
  {cards.map(card => (
    <ListViewItem
      key={card.id}
      card={card}
      onEdit={() => handleEdit(card)}
      onAI={() => handleAI(card)}
      onDelete={() => handleDelete(card)}
    />
  ))}
</ListView>
```

#### Acceptance Criteria
- [ ] Toggle grid/list persiste no localStorage
- [ ] List view mostra todos os metadados
- [ ] Filtros funcionam em ambos os modos
- [ ] Busca em tempo real
- [ ] Performance com 50+ cards
- [ ] Responsivo (colapsa em mobile)

---

## 📈 TIER 3: Escala e Retenção

### 8. Templates Públicos ⭐⭐⭐⭐⭐

**Esforço:** 8 horas (5 templates completos)
**Impacto:** MUITO ALTO
**Status:** 🔴 Pendente

#### Problema que Resolve
- Cold start problem (canvas vazio intimida)
- Falta de inspiração
- Tempo para primeiro valor

#### Solução Proposta
5 templates pré-preenchidos de alta qualidade:

1. **SaaS B2B** (ex: CRM para PMEs)
2. **App Mobile** (ex: Fitness tracker)
3. **Marketplace** (ex: Freelancers)
4. **E-commerce** (ex: Fashion)
5. **IA/ML Product** (ex: Chatbot)

#### Implementação
```sql
-- Tabela de templates
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'saas', 'mobile', 'marketplace', etc
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cards dos templates
CREATE TABLE template_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  card_type TEXT NOT NULL,
  stage_id INTEGER NOT NULL,
  position INTEGER NOT NULL,
  content JSONB NOT NULL
);
```

#### Fluxo de Uso
1. Usuário cria novo projeto
2. Modal: "Começar do zero" ou "Usar template"
3. Template gallery mostra 5 opções
4. Usuário escolhe → todos os cards são copiados
5. Usuário pode editar livremente

#### Acceptance Criteria
- [ ] 5 templates completos e de alta qualidade
- [ ] Cada template tem thumbnail
- [ ] Modal de seleção no "novo projeto"
- [ ] Cópia de template em < 3 segundos
- [ ] Cards copiados são editáveis
- [ ] Template original não é modificado

---

### 9. Salvar Projeto como Template ⭐⭐⭐⭐⭐

**Esforço:** 4 horas
**Impacto:** MUITO ALTO
**Status:** 🔴 Pendente

#### Solução Proposta
Botão "Salvar como Template" no menu do projeto:

**Campos do formulário:**
- Nome do template
- Descrição curta
- Categoria (dropdown)
- Público ou privado
- Thumbnail (upload opcional)

#### Implementação
```typescript
// API route
export async function POST('/api/templates', req) {
  const { projectId, name, description, category, isPublic } = await req.json()

  // 1. Criar template
  const template = await createTemplate({ name, description, category, isPublic })

  // 2. Copiar todos os cards do projeto
  const cards = await getProjectCards(projectId)
  for (const card of cards) {
    await createTemplateCard({
      template_id: template.id,
      card_type: card.card_type,
      stage_id: card.stage_id,
      position: card.position,
      content: card.content
    })
  }

  return template
}
```

#### Acceptance Criteria
- [ ] Botão visível no menu do projeto
- [ ] Modal de criação de template
- [ ] Validação de campos obrigatórios
- [ ] Templates privados só visíveis para criador
- [ ] Templates públicos aparecem na gallery
- [ ] Thumbnail gerado automaticamente se não fornecido

---

### 10. Template Gallery UI ⭐⭐⭐⭐

**Esforço:** 4 horas
**Impacto:** ALTO
**Status:** 🔴 Pendente

#### Solução Proposta
Página `/templates` com gallery de templates:

**Features:**
- Grid de cards com thumbnail + nome + descrição
- Filtros: categoria, público/privado, meus templates
- Preview do template (modal com overview dos cards)
- Botão "Usar Template" cria novo projeto

#### UI/UX
```
┌─────────────────────────────────────┐
│  Templates                          │
│  ┌───────┐ ┌───────┐ ┌───────┐     │
│  │ SaaS  │ │ Mobile│ │Market │     │
│  │ B2B   │ │ App   │ │place  │     │
│  └───────┘ └───────┘ └───────┘     │
│                                     │
│  Filtros: [Categoria ▼] [Meus]     │
└─────────────────────────────────────┘
```

#### Acceptance Criteria
- [ ] Gallery responsiva (grid → list em mobile)
- [ ] Preview funcional antes de usar
- [ ] Filtros funcionam
- [ ] Paginação se > 20 templates
- [ ] Busca por nome/descrição

---

### 11. Demo Page Pública ⭐⭐⭐⭐

**Esforço:** 6-10 horas
**Impacto:** ALTO (Marketing)
**Status:** 🔴 Pendente

#### Solução Proposta
Página `/demo` pública (sem login) mostrando:

1. **Canvas de exemplo** (template SaaS B2B)
2. **Interações permitidas:**
   - Visualizar cards
   - Abrir modal de edição (read-only)
   - Ver painel de IA (histórico fake)
3. **CTA:** "Criar meu projeto" → Sign up

#### Implementação
```typescript
// Dados mockados (sem DB)
const DEMO_PROJECT = {
  id: 'demo',
  name: 'SaaS CRM para PMEs',
  cards: [...] // Template pré-carregado
}

// Componente reutiliza CanvasArea mas em modo read-only
<CanvasArea
  project={DEMO_PROJECT}
  readonly={true}
  onCTA={() => router.push('/sign-up')}
/>
```

#### Acceptance Criteria
- [ ] Funciona sem autenticação
- [ ] Canvas totalmente funcional (visualização)
- [ ] Edição desabilitada (mostra modal de upgrade)
- [ ] CTA visível e conversão trackada
- [ ] Performance (carregamento < 2s)

#### Referência
- Protótipo: `html/demo.html`

---

## 🔮 TIER 4: Longo Prazo

### 12. Wizard Conversacional ⭐⭐⭐⭐⭐

**Esforço:** 20-30 horas
**Impacto:** MUITO ALTO (Game Changer)
**Status:** ⏸️ Aguardando validação

#### Problema que Resolve
- Canvas intimidante para alguns usuários
- Preferência por interação conversacional
- Experiência mágica ("conversa → canvas preenchido")

#### Solução Proposta
Chat guiado que preenche o canvas através de conversa:

**Fluxo:**
```
Bot: Olá! Vou te ajudar a estruturar seu produto. Qual é a ideia principal?
Usuário: Um app de finanças pessoais para freelancers
Bot: Ótimo! Qual é o principal problema que freelancers enfrentam com finanças?
Usuário: Dificuldade de separar PJ de PF, e controlar impostos
Bot: [Cria card de Problema com essa info]
Bot: Quem exatamente são os freelancers que vão usar isso?
...
```

**Após 15-20 perguntas → Canvas 70% preenchido**

#### Implementação Técnica
Complexa, requer:
1. Sistema de perguntas guiadas (decision tree)
2. Extração de informações das respostas (NLP)
3. Mapeamento resposta → card content
4. UI de chat fluído
5. Preview do canvas sendo preenchido em tempo real

#### Por quê Adiar?
- ❌ Alto esforço (20-30h)
- ❌ Requer templates funcionando (comparação)
- ❌ Necessita validação se usuários preferem wizard vs canvas direto
- ✅ **Fazer depois de:** Templates, Project Overview, feedback de usuários

#### Referência
- Protótipo: `html/pistack-wizard.html`

---

### 13. Drag & Drop nas Listas ⭐⭐⭐

**Esforço:** 6-8 horas
**Impacto:** MÉDIO
**Status:** ⏸️ Se usuários pedirem

#### Solução Proposta
Reordenação de items em arrays por drag & drop:

**Casos de uso:**
- Priorizar features do MVP
- Reordenar user stories
- Sequenciar marcos do roadmap

#### Libs Recomendadas
- `@dnd-kit/core` (moderna, TypeScript-first)
- ou `react-beautiful-dnd` (mais madura, mas não mantida)

#### Por quê Adiar?
- ⏸️ UX "nice to have", não essencial
- ⏸️ Aguardar feedback se usuários pedem isso
- ⏸️ Ordem atual (cronológica de criação) pode ser suficiente

---

### 14. Vibe Coding Prompt Generator ⭐⭐⭐⭐

**Esforço:** 4 horas
**Impacto:** ALTO
**Status:** ⏸️ Extensão do Project Overview

#### Solução Proposta
Exportar projeto como prompt estruturado para vibe coding (Claude/Cursor):

**Template de Prompt:**
```
You are an expert full-stack developer. Build this product based on the following PRD:

# Project: [Nome]

## Problem & Solution
[Cards da Etapa 1]

## Technical Stack
[Cards da Etapa 5 - detalhados]

## Core Features (MVP)
[Cards da Etapa 3 - priorizado]

## Architecture Requirements
[Database schema + API design da Etapa 5]

## Success Criteria
[Critérios de aceite da Etapa 3]

---

Start by creating the project structure, then implement features in this order: [roadmap]
```

#### Por quê Adiar?
- ⏸️ Depende de Project Overview estar pronto
- ⏸️ Validar se usuários querem isso
- ✅ Fácil de implementar depois (4h)

---

### 15. Separar App do Site Marketing ⭐⭐⭐

**Esforço:** 4-6 horas
**Impacto:** MÉDIO
**Status:** ⏸️ Quando escalar marketing

#### Problema que Resolve
- Site marketing carrega lógica do app (desnecessário)
- Performance ruim para visitantes anônimos
- SEO prejudicado

#### Solução Proposta
```
Estrutura atual:
app/
  page.tsx              → Landing page
  dashboard/            → App
  projects/             → App

Estrutura proposta:
marketing-site/ (Next.js separado)
  pages/
    index.tsx           → Landing
    pricing.tsx
    blog/

pistack-app/ (Next.js atual)
  app/
    dashboard/
    projects/
```

**Deploy:**
- marketing-site → Vercel (marketing.pistack.com ou www)
- pistack-app → Vercel (app.pistack.com)

#### Por quê Adiar?
- ⏸️ Marketing atual é mínimo
- ⏸️ Fazer quando houver tráfego significativo
- ⏸️ Priorizar features de produto primeiro

---

### 16. Light Mode ⭐⭐

**Esforço:** 8-12 horas
**Impacto:** BAIXO-MÉDIO
**Status:** ⏸️ Só se houver demanda

#### Solução Proposta
Tema claro para canvas e overview:

**Implementação:**
- Usar `next-themes` (já instalado)
- Criar paleta de cores para light mode
- Testar contraste (WCAG AA)
- Toggle no header

#### Por quê Adiar?
- ❌ Dark mode é tendência em ferramentas dev
- ❌ Esforço alto (revisar TODOS os componentes)
- ❌ Baixa demanda (maioria prefere dark)
- ✅ **Só fazer** se 20%+ dos usuários pedirem

---

## 📊 Métricas de Sucesso

### Sprint 1: Quick Wins UX
**KPIs:**
- ✅ Canvas width aumenta em 30%+ quando IA colapsa
- ✅ 80%+ dos usuários usam batch creation
- ✅ Redução de 50% em tickets de "não salvou"

**Critérios de Validação:**
- [ ] Heatmap mostra mais interação com canvas
- [ ] Time-to-first-card reduz de 3min → 30s
- [ ] NPS aumenta em +10 pontos

---

### Sprint 2: Diferenciação
**KPIs:**
- ✅ 60%+ dos projetos completos geram export PRD
- ✅ 30%+ compartilham pitch deck gerado
- ✅ List view é usada por 40%+ dos usuários

**Critérios de Validação:**
- [ ] Downloads de PRD > 100/mês
- [ ] Viral coefficient aumenta (shares)
- [ ] Tempo médio na plataforma aumenta 50%

---

### Sprint 3: Escala
**KPIs:**
- ✅ 70%+ dos novos usuários começam com template
- ✅ 50%+ completam Etapa 1 em < 10 minutos
- ✅ Taxa de conversão demo → signup > 15%

**Critérios de Validação:**
- [ ] Redução de 80% no cold start time
- [ ] Aumento de 3x em projetos criados/dia
- [ ] Retenção D7 > 50%

---

## 🎯 Decisões Arquiteturais

### O que Fazer AGORA

**✅ Implementar:**
1. IA Panel Colapsável (UX crítico)
2. Batch Creation (reduz friction)
3. Project Overview + Export (diferenciador)
4. Templates (escala)

**Justificativa:**
- Alto impacto no usuário
- Esforço controlado (< 40h total)
- Diferenciação competitiva clara

---

### O que Fazer DEPOIS (validação necessária)

**⏸️ Aguardar feedback:**
1. Wizard Conversacional (alto esforço, validar demanda)
2. Drag & Drop (nice to have, pode não ser necessário)
3. Light Mode (baixa demanda)

**Justificativa:**
- Features complexas sem validação de mercado
- Risco de over-engineering
- Priorizar produto funcionando > features avançadas

---

### O que EVITAR (por enquanto)

**❌ Não fazer:**
1. Integrações com outras ferramentas (Jira, Notion, etc)
2. Versioning de projetos (Git-like)
3. Colaboração em tempo real (multiplayer)
4. Mobile app nativo

**Justificativa:**
- Complexidade muito alta
- Produto ainda não validou PMF
- Foco: fazer UMA coisa muito bem
- Essas features são para depois de ter 1000+ usuários ativos

---

## 🔄 Processo de Atualização

### Quando Atualizar este Roadmap

**Triggers:**
- ✅ Feature completa (mover para "Concluído")
- 🔄 Prioridade mudou (feedback de usuários)
- 📊 Métricas validaram/invalidaram hipótese
- 🚀 Nova feature crítica identificada

### Responsável
- Product Owner / Tech Lead
- Revisão mensal ou após cada sprint

---

## 📚 Referências

- **Project Context:** `docs/project-context.md`
- **Card Update Checklist:** `docs/CARD_UPDATE_CHECKLIST.md`
- **Assistant Instructions:** `docs/assistant-instructions/`
- **Protótipos HTML:** `html/`

---

**Última revisão:** 2025-10-23
**Próxima revisão:** 2025-11-23 (ou após Sprint 1)
