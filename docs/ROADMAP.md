# 🗺️ PIStack - Roadmap de Desenvolvimento

**Última atualização:** 2025-10-24
**Versão atual:** v1.0 (MVP Completo - 35/35 cards + Sistema de Progressão)

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
| 3 | Batch Creation (Criar Etapa Completa) | ⭐⭐⭐⭐ | 4-6h | ✅ **COMPLETO** |
| 4 | Sugestões Rápidas Otimizadas (Carousel) | ⭐⭐⭐⭐ | 2-3h | ✅ **COMPLETO** |
| 5 | Botão Limpar Chat | ⭐⭐⭐⭐ | 1h | ✅ **COMPLETO** |

**Total estimado:** 12-17 horas (12-17h concluídas - 100% COMPLETO) 🎉**
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
| 8 | Project Overview (compilação básica) | ⭐⭐⭐⭐⭐ | 5h | ✅ **COMPLETO** |
| 8.1 | Sistema de Progressão (50% Unlock) | ⭐⭐⭐⭐⭐ | 3-4h | ✅ **COMPLETO** |
| 8.2 | Reorganização UX Batch Creation | ⭐⭐⭐⭐ | 2h | ✅ **COMPLETO** |
| 9 | Export PRD | ⭐⭐⭐⭐⭐ | 3h | 🔴 Pendente |
| 10 | Export Pitch Deck Outline | ⭐⭐⭐⭐⭐ | 3h | 🔴 Pendente |
| 11 | List View dos Cards | ⭐⭐⭐⭐⭐ | 6-8h | 📋 **PLANEJADO** |
| 6 | Menções com @ para Referenciar Cards | ⭐⭐⭐⭐⭐ | 4-6h | 📋 **PLANEJADO** |
| 7 | Command Palette com / (Atalhos) | ⭐⭐⭐⭐ | 3-4h | 📋 **PLANEJADO** |

**Total estimado:** 29-38 horas (10-11h concluídas - 29% COMPLETO)
**Impacto esperado:** Tangibilização do valor criado, uso profissional, compartilhamento viral, melhor onboarding

**✅ Tarefas Concluídas:**

**Tarefa 8.1 - Sistema de Progressão (50% Unlock):**
- Barra de progresso visual na sidebar (X/35 cards)
- Cores dinâmicas: amarelo <50%, verde ≥50%
- Project Overview bloqueado até 50% dos cards criados
- Mensagem informativa que desaparece ao atingir threshold
- Botão Overview na sidebar com estados bloqueado/desbloqueado
- Botão Overview no header desabilitado com tooltip dinâmico
- Evento `pistack:cards:refresh` atualiza progresso em tempo real

**Tarefa 8.2 - Reorganização UX Batch Creation:**
- Botão "Criar Todos" movido para dentro do dropdown (última posição)
- Modal com banner informativo sobre tempo de espera (~60s/card)
- Timeout aumentado para 90s
- Logs detalhados para debugging
- Botão "Nova Etapa" removido da sidebar (simplificação)

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

### 4. Sugestões Rápidas Otimizadas (Carousel) ⭐⭐⭐⭐

**Esforço:** 2-3 horas
**Impacto:** MÉDIO-ALTO
**Status:** ✅ **COMPLETO** (2025-10-23)

#### Problema que Resolve
- Sugestões rápidas ocupam muito espaço vertical no painel de IA
- Em cards com muitas sugestões (ex: 4-6 itens), o chat fica espremido
- Usuários precisam rolar para ver o histórico de mensagens
- UX poluída visualmente

#### Solução Proposta

**Opção A: Carousel (RECOMENDADA)**
- Mostra apenas 1 sugestão por vez
- Navegação com setas (← →) ou dots
- Auto-rotate a cada 5 segundos (opcional)
- Animação suave de transição

**Opção B: Collapse/Expand**
- Seção de sugestões começa colapsada
- Mostra apenas "💡 Ver sugestões rápidas (3)"
- Click expande/colapsa todas as sugestões

#### Implementação Técnica

```typescript
// components/canvas/quick-suggestions-carousel.tsx
interface QuickSuggestionsCarouselProps {
  suggestions: QuickSuggestion[]
  onSelect: (text: string) => void
  stageColor: string
}

export function QuickSuggestionsCarousel({ suggestions, onSelect, stageColor }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentSuggestion = suggestions[currentIndex]

  const next = () => setCurrentIndex((i) => (i + 1) % suggestions.length)
  const prev = () => setCurrentIndex((i) => (i - 1 + suggestions.length) % suggestions.length)

  return (
    <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
      {/* Botão anterior */}
      <button onClick={prev} className="p-1 hover:bg-white/10 rounded">
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Sugestão atual */}
      <button
        onClick={() => onSelect(currentSuggestion.text)}
        className="flex-1 text-left px-3 py-2 hover:bg-white/10 rounded transition-colors"
      >
        <span className="mr-2">{currentSuggestion.icon}</span>
        <span className="text-sm">{currentSuggestion.text}</span>
      </button>

      {/* Botão próximo */}
      <button onClick={next} className="p-1 hover:bg-white/10 rounded">
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Dots de navegação */}
      <div className="flex gap-1">
        {suggestions.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${
              i === currentIndex ? 'bg-white' : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
```

#### Acceptance Criteria
- [x] Carousel mostra apenas 1 sugestão por vez
- [x] Dots indicam posição atual (setas removidas)
- [x] Click na sugestão preenche input
- [x] Responsivo (funciona em mobile)
- [x] Desabilitado durante loading (isLoading)
- [x] Esconde navegação quando há apenas 1 sugestão
- [x] **Autoplay ativo:** avança automaticamente a cada 5s
- [x] **Animação de transição:** fade + translateY (300ms)
- [x] **Pausa autoplay:** ao clicar em dot ou sugestão
- [x] **Dots animados:** expandem quando ativos + hover scale

#### Implementação Realizada

**Funcionalidades:**
- Componente carousel criado com estado de índice atual
- Dots indicadores clicáveis para navegação direta (setas removidas)
- Sugestão renderizada com cores dinâmicas da etapa
- Integrado no ai-sidebar substituindo lista vertical
- **Autoplay:** avança automaticamente a cada 5 segundos
- **Animações suaves:** transição com fade + translateY (300ms)

**Comportamento:**
- Mostra apenas 1 sugestão por vez (economiza ~60-80px verticais)
- Navegação circular automática (última → primeira)
- Dots animados: expandem quando ativos (6px → 16px largura)
- Hover nos dots aumenta escala em 125%
- Desabilitado automaticamente quando chat está loading
- **Pausa autoplay:** ao clicar em dot ou sugestão
- Auto-esconde dots se houver apenas 1 sugestão

**Animações CSS:**
- Transição de fade: `opacity: 0` → `opacity: 1`
- Translação vertical: `translateY(-10px)` → `translateY(0)`
- Duração: 300ms com `transition-all`
- Dots com `transition-all duration-300` e `hover:scale-125`

#### Arquivos Afetados
- ✅ **Novo**: `components/canvas/quick-suggestions-carousel.tsx` - Componente carousel
- ✅ `components/canvas/ai-sidebar.tsx` - Integração do carousel (substituiu lista vertical)
- ℹ️ `components/canvas/ai-suggestions.ts` - Mantido sem alterações (fonte de dados)

---

### 5. Botão Limpar Chat ⭐⭐⭐⭐

**Esforço:** 1 hora
**Impacto:** MÉDIO
**Status:** ✅ **COMPLETO** (2025-10-23)

#### Problema que Resolve
- Não há como limpar o histórico de conversas
- Conversas antigas poluem o contexto
- Usuários querem "começar do zero" em nova sessão
- Performance degrada com histórico muito longo

#### Solução Proposta

Botão "Limpar chat" no header do AI sidebar:
- Ícone: 🗑️ ou Trash2
- Confirmação antes de limpar (modal/toast)
- Limpa mensagens do frontend + backend
- Mantém estado colapsado/expandido do painel

#### Implementação Técnica

```typescript
// No ai-sidebar.tsx
const handleClearChat = async () => {
  const confirmed = window.confirm(
    'Tem certeza que deseja limpar todo o histórico de chat? Esta ação não pode ser desfeita.'
  )

  if (!confirmed) return

  try {
    // Limpar backend
    await fetch(`/api/ai/history?projectId=${projectId}`, {
      method: 'DELETE'
    })

    // Limpar frontend
    setMessages([])
    setReferencedCard(null)

    // Feedback visual
    toast.success('Chat limpo com sucesso')
  } catch (error) {
    console.error('Error clearing chat:', error)
    toast.error('Erro ao limpar chat')
  }
}

// No header do sidebar
<div className="flex items-center justify-between p-4 border-b border-white/10">
  <h2>Copiloto do Projeto</h2>
  <div className="flex items-center gap-2">
    <button
      onClick={handleClearChat}
      className="p-2 hover:bg-white/10 rounded transition-colors"
      title="Limpar chat"
    >
      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
    </button>
    <button onClick={onToggle}>
      {/* Toggle button existente */}
    </button>
  </div>
</div>
```

#### API Route

```typescript
// app/api/ai/history/route.ts - adicionar método DELETE
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing projectId' },
        { status: 400 }
      )
    }

    const supabase = getServiceRoleClient()
    const supabaseUserId = await ensureSupabaseUser(userId, supabase)

    // Deletar todas as mensagens do projeto
    const { error } = await supabase
      .from('ai_chat_history')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', supabaseUserId)

    if (error) {
      console.error('Error clearing chat:', error)
      return NextResponse.json(
        { error: 'Failed to clear chat' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Clear chat error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

#### Acceptance Criteria
- [x] Botão visível no header do AI sidebar
- [x] Confirmação antes de limpar (evitar cliques acidentais)
- [x] Limpa mensagens do frontend imediatamente
- [x] Limpa histórico do backend (API DELETE)
- [x] Feedback visual de sucesso/erro
- [x] Não fecha o painel após limpar
- [x] Desabilitado quando não há mensagens ou durante loading
- [ ] Performance: limpar 100+ mensagens em < 1s

#### Implementação Realizada

**Funcionalidades:**
- Botão Trash2 adicionado ao header do sidebar (ao lado do botão X)
- Handler `handleClearChat` com confirmação via window.confirm
- DELETE endpoint criado em `/api/ai/history`
- Limpa estado local (messages, referencedCard, input)
- Validação de autenticação e autorização no backend

**Comportamento:**
- Botão desabilitado quando: sem mensagens OU isLoading = true
- Confirmação antes de executar (previne cliques acidentais)
- Limpa mensagens do Supabase (tabela `ai_messages`)
- Limpa estado do React imediatamente após sucesso
- Feedback de erro via alert() se requisição falhar
- Sidebar permanece aberto após limpar

**Backend (DELETE /api/ai/history):**
- Recebe `projectId` e `stage` via query params
- Autentica usuário com Clerk
- Valida ownership do projeto
- Busca thread correspondente ao projeto + etapa
- Deleta todas as mensagens da thread
- Retorna `{ success: true, deleted: count }`

#### Arquivos Afetados
- ✅ `components/canvas/ai-sidebar.tsx` - Botão Trash2, handler handleClearChat, import do ícone
- ✅ `app/api/ai/history/route.ts` - Método DELETE adicionado (95 linhas)

---

### 3. Batch Creation (Criar Etapa Completa) ⭐⭐⭐⭐

**Esforço:** 4-6 horas (+ 2h de melhorias UX)
**Impacto:** ALTO
**Status:** ✅ **COMPLETO** (2025-10-23) + **MELHORADO** (2025-10-24)

#### Problema que Resolve
- Criar 35 cards manualmente é tedioso
- Usuários abandonam por friction inicial
- Canvas vazio não mostra valor imediato
- Usuários não entendiam que o processo levava tempo (~60s por card)

#### Solução Proposta
Botão no dropdown de cada etapa:
```
✨ Criar Todos (X)
```
- Cria todos os cards da etapa em sequência
- Cada card é auto-preenchido pela IA
- Progresso visual mostra criação em tempo real
- Throttle de 500ms entre cards (evitar sobrecarga API)

#### Melhorias Adicionadas (Sprint 2 - Tarefa 8.2)
- **Botão movido para dropdown:** Última posição após separador (menos intrusivo)
- **Banner informativo:** Explica que cada card leva ~60s para ser preenchido
- **Timeout aumentado:** De 30s para 90s para evitar aborts prematuros
- **Logs detalhados:** Console logs em cada etapa para debugging
- **Melhor UX de espera:** Usuários entendem o processo e não ficam ansiosos

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
- [x] Botão aparece no dropdown de cada StageSection (última posição)
- [x] Modal mostra progresso em tempo real
- [x] Throttle de 500ms entre criações
- [x] Cards são auto-preenchidos pela IA
- [x] Evento de refresh dispara ao final
- [x] Tratamento de erro se algum card falhar
- [x] Banner informativo sobre tempo de espera (~60s/card)
- [x] Timeout de 90s para evitar aborts prematuros
- [x] Logs detalhados para debugging
- [ ] Usuário pode cancelar operação (nice-to-have futuro)

#### Arquivos Afetados
- ✅ `components/canvas/stage-section.tsx` - Dropdown reorganizado, logs adicionados
- ✅ `components/canvas/batch-creation-modal.tsx` - Banner informativo adicionado
- ✅ `lib/card-constants.ts` - Constantes centralizadas
- ✅ `app/api/cards/route.ts` - Timeout handling melhorado

---

## 🎨 TIER 2: Diferenciação do Produto

### 6. Menções com @ para Referenciar Cards ⭐⭐⭐⭐⭐

**Esforço:** 4-6 horas
**Impacto:** MUITO ALTO
**Status:** 📋 **PLANEJADO** (Implementar SEGUNDO - após List View)

#### Problema que Resolve
- Referenciar cards requer clicar no botão Sparkles (✨)
- Não é possível referenciar múltiplos cards na mesma mensagem
- Fluxo interrompido ao procurar card específico
- Falta de descobrimento de funcionalidade

#### Por Que Implementar Depois da List View?

✅ **Reuso de código:**
- Usa `card-filters.ts` da List View
- Usa `use-card-search.ts` para autocomplete
- Componentes de busca já validados

✅ **Experiência melhorada:**
- Usuários já familiarizados com busca de cards
- Padrões UX consistentes

#### Quebra de Implementação

**Fase 1: Detecção e Autocomplete (2-3h)**
- Arquivos a criar:
  - `components/canvas/card-mention-autocomplete.tsx`
  - `hooks/use-mention-detection.ts`
  - `lib/mention-parser.ts`

**Fase 2: Seleção e Inserção (1-2h)**
- Badges visuais para cards mencionados
- Múltiplas menções suportadas
- Componente `CardMentionBadge`

**Fase 3: Envio de Contexto (1h)**
- Integração com API `/api/ai/chat`
- Payload estruturado com múltiplos cards
- Limpeza de menções após envio

**Fase 4: Navegação por Teclado (30min-1h)**
- ↑↓ para navegar
- Enter para selecionar
- Escape para fechar
- Tab para sair

#### Solução Proposta

Sistema de menções tipo Notion/Slack:
- Digite `@` no input do chat → mostra autocomplete com todos os cards
- Filtro em tempo real conforme digita (ex: `@prob` → mostra "Problem")
- Seleciona card → anexa contexto automaticamente
- Visual: badge inline mostrando card mencionado
- Suporta múltiplas menções na mesma mensagem

#### Implementação Técnica

```typescript
// components/canvas/card-mention-autocomplete.tsx
interface CardMentionAutocompleteProps {
  cards: CardRecord[]
  onSelect: (card: CardRecord) => void
  position: { top: number; left: number }
  filter: string
}

export function CardMentionAutocomplete({ cards, onSelect, position, filter }: Props) {
  const filteredCards = useMemo(() => {
    const query = filter.toLowerCase()
    return cards.filter(card => {
      const title = CARD_TITLES[card.card_type].toLowerCase()
      return title.includes(query)
    })
  }, [cards, filter])

  return (
    <div
      className="absolute z-50 bg-[#1A1D29] border border-white/20 rounded-lg shadow-xl max-h-64 overflow-y-auto"
      style={{ top: position.top, left: position.left }}
    >
      {filteredCards.map(card => {
        const stageNumber = CARD_TO_STAGE[card.card_type]
        const stageColor = STAGE_COLORS[stageNumber]

        return (
          <button
            key={card.id}
            onClick={() => onSelect(card)}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors"
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: stageColor }}
            />
            <span className="text-sm">{CARD_TITLES[card.card_type]}</span>
            <span className="text-xs text-gray-400 ml-auto">
              {STAGE_NAMES[stageNumber]}
            </span>
          </button>
        )
      })}

      {filteredCards.length === 0 && (
        <div className="px-3 py-2 text-sm text-gray-400">
          Nenhum card encontrado
        </div>
      )}
    </div>
  )
}

// No ai-sidebar.tsx
const [mentionFilter, setMentionFilter] = useState('')
const [showMentionAutocomplete, setShowMentionAutocomplete] = useState(false)
const [autocompletePosition, setAutocompletePosition] = useState({ top: 0, left: 0 })

const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  const value = e.target.value
  setInput(value)

  // Detectar @ e extrair filtro
  const cursorPosition = e.target.selectionStart
  const textBeforeCursor = value.slice(0, cursorPosition)
  const atMatch = textBeforeCursor.match(/@(\w*)$/)

  if (atMatch) {
    setMentionFilter(atMatch[1])
    setShowMentionAutocomplete(true)

    // Calcular posição do autocomplete
    const rect = e.target.getBoundingClientRect()
    setAutocompletePosition({
      top: rect.top - 200, // Acima do input
      left: rect.left
    })
  } else {
    setShowMentionAutocomplete(false)
  }
}

const handleCardMention = (card: CardRecord) => {
  // Substituir @filtro pelo placeholder do card
  const newInput = input.replace(/@\w*$/, `@${card.card_type} `)
  setInput(newInput)
  setShowMentionAutocomplete(false)

  // Adicionar card às referências
  setMentionedCards(prev => [...prev, card])
}
```

#### UI/UX Flow

1. Usuário digita `@` no input
2. Popup de autocomplete aparece acima do input
3. Lista mostra todos os cards com cores das etapas
4. Filtro em tempo real conforme digita (ex: `@prob`)
5. Setas ↑↓ para navegar, Enter para selecionar
6. Card selecionado → badge inline aparece
7. Ao enviar mensagem → contexto de todos os cards mencionados é incluído

#### Acceptance Criteria
- [ ] Digitar @ abre autocomplete
- [ ] Filtro funciona em tempo real
- [ ] Navegação por teclado (↑↓ Enter)
- [ ] Click seleciona card
- [ ] Badge visual inline para cada card mencionado
- [ ] Suporte a múltiplos cards na mesma mensagem
- [ ] Contexto de todos os cards mencionados é enviado
- [ ] Escape fecha autocomplete
- [ ] Click fora fecha autocomplete

#### Arquivos Afetados
- Novo componente: `components/canvas/card-mention-autocomplete.tsx`
- `components/canvas/ai-sidebar.tsx` (lógica de detecção @)
- `components/canvas/ai-suggestions.ts` (helper para buscar cards)

---

### 7. Command Palette com / (Atalhos) ⭐⭐⭐⭐

**Esforço:** 3-4 horas
**Impacto:** MÉDIO-ALTO
**Status:** 📋 **PLANEJADO** (Implementar TERCEIRO - após Menções @)

#### Problema que Resolve
- Funcionalidades avançadas não são descobríveis
- Usuários power users querem atalhos de teclado
- Ações comuns requerem muitos cliques
- Falta de CLI-like experience para devs

#### Por Que Implementar Por Último?

✅ **Máximo reuso:**
- Usa autocomplete de Menções @
- Usa filtros de List View
- Integra ações de todas as features anteriores

✅ **Feature para power users:**
- Usuários já familiarizados com o sistema
- Comandos consolidam funcionalidades existentes

#### Quebra de Implementação

**Fase 1: Estrutura de Comandos (1h)**
- Arquivos a criar:
  - `lib/commands/registry.ts`
  - `lib/commands/definitions.ts`
  - `components/canvas/command-palette.tsx`
- 5+ comandos iniciais: clear-chat, batch-create, export-prd, goto-overview, help

**Fase 2: Detecção e UI (1-2h)**
- Hook `useCommandPalette`
- Detecção de / no início da linha
- Agrupamento por categoria (chat, cards, export, navigation)

**Fase 3: Execução e Feedback (1h)**
- Loading states durante execução
- Toast de sucesso/erro
- Animações de fechamento

**Fase 4: Atalhos de Teclado (30min-1h) OPCIONAL**
- Cmd/Ctrl+K abre palette
- Atalhos principais (Cmd+Shift+C = clear chat)
- Compatível Mac e Windows

#### Solução Proposta

Command palette ativado com `/` no input do chat:
- Digite `/` → mostra lista de comandos disponíveis
- Filtro em tempo real
- Comandos executam ações do sistema
- Visual similar a Slack/Discord

#### Comandos Disponíveis

**Chat & IA:**
- `/clear` → Limpar histórico de chat
- `/help` → Mostrar ajuda sobre comandos

**Cards:**
- `/create [tipo]` → Criar card específico
- `/batch [etapa]` → Criar todos os cards da etapa

**Export:**
- `/export-prd` → Exportar PRD
- `/export-deck` → Exportar Pitch Deck outline
- `/overview` → Abrir Project Overview

**Templates:**
- `/templates` → Ver galeria de templates
- `/save-template` → Salvar projeto como template

#### Implementação Técnica

```typescript
// components/canvas/command-palette.tsx
interface Command {
  name: string
  description: string
  icon: string
  execute: () => void | Promise<void>
  aliases?: string[]
}

const COMMANDS: Command[] = [
  {
    name: 'clear',
    description: 'Limpar histórico de chat',
    icon: '🗑️',
    execute: async () => {
      await handleClearChat()
    }
  },
  {
    name: 'batch',
    description: 'Criar todos os cards de uma etapa',
    icon: '✨',
    execute: async () => {
      // Prompt para escolher etapa
      const stage = await promptStageSelection()
      await batchCreateStage(stage)
    }
  },
  {
    name: 'export-prd',
    description: 'Exportar documento PRD',
    icon: '📄',
    execute: async () => {
      window.open(`/projects/${projectId}/export/prd`, '_blank')
    }
  },
  {
    name: 'overview',
    description: 'Abrir visão geral do projeto',
    icon: '📊',
    execute: () => {
      router.push(`/projects/${projectId}/overview`)
    }
  },
  {
    name: 'help',
    description: 'Mostrar ajuda sobre comandos',
    icon: '❓',
    execute: () => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: generateHelpMessage()
      }])
    }
  }
]

export function CommandPalette({ onSelect, filter, position }: Props) {
  const filteredCommands = useMemo(() => {
    const query = filter.toLowerCase()
    return COMMANDS.filter(cmd =>
      cmd.name.includes(query) ||
      cmd.description.toLowerCase().includes(query) ||
      cmd.aliases?.some(alias => alias.includes(query))
    )
  }, [filter])

  return (
    <div
      className="absolute z-50 bg-[#1A1D29] border border-white/20 rounded-lg shadow-xl max-h-64 overflow-y-auto"
      style={{ top: position.top, left: position.left }}
    >
      {filteredCommands.map(cmd => (
        <button
          key={cmd.name}
          onClick={() => onSelect(cmd)}
          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 transition-colors"
        >
          <span className="text-lg">{cmd.icon}</span>
          <div className="flex-1 text-left">
            <div className="text-sm font-medium">/{cmd.name}</div>
            <div className="text-xs text-gray-400">{cmd.description}</div>
          </div>
        </button>
      ))}

      {filteredCommands.length === 0 && (
        <div className="px-3 py-2 text-sm text-gray-400">
          Comando não encontrado. Digite /help para ver todos.
        </div>
      )}
    </div>
  )
}

// No ai-sidebar.tsx
const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  const value = e.target.value
  setInput(value)

  // Detectar / no início da linha
  if (value.startsWith('/')) {
    const commandFilter = value.slice(1) // Remove o /
    setCommandFilter(commandFilter)
    setShowCommandPalette(true)
  } else {
    setShowCommandPalette(false)
  }

  // Lógica de @ existente...
}

const handleCommandSelect = async (command: Command) => {
  setShowCommandPalette(false)
  setInput('') // Limpa input

  try {
    await command.execute()
  } catch (error) {
    console.error(`Error executing command /${command.name}:`, error)
    toast.error(`Erro ao executar comando /${command.name}`)
  }
}
```

#### Acceptance Criteria
- [ ] Digitar / abre command palette
- [ ] Lista mostra todos os comandos disponíveis
- [ ] Filtro funciona em tempo real
- [ ] Navegação por teclado (↑↓ Enter)
- [ ] Comandos executam ações corretamente
- [ ] Feedback visual de execução (loading, sucesso, erro)
- [ ] `/help` mostra lista completa de comandos
- [ ] Aliases funcionam (ex: `/cls` = `/clear`)
- [ ] Escape fecha palette

#### Arquivos Afetados
- Novo componente: `components/canvas/command-palette.tsx`
- Novo arquivo: `lib/commands/index.ts` (definição de comandos)
- `components/canvas/ai-sidebar.tsx` (lógica de detecção /)

---

---

## 🎯 Sprint 2 - Parte 2: Power User Features (Planejamento 2025-10-24)

### Visão Geral

Este planejamento detalha a implementação de 3 features altamente requisitadas que transformarão o PIStack em uma ferramenta profissional para power users:

1. **List View dos Cards** (6-8h) - Base para navegação avançada
2. **Menções com @** (4-6h) - Contexto rico para IA
3. **Command Palette com /** (3-4h) - Produtividade máxima

**Total estimado:** 13-18 horas (~3 semanas em part-time)

### Ordem de Implementação Estratégica

**Por que nesta ordem?**

```
List View → Menções @ → Command Palette
   ↓            ↓             ↓
Fundação   Reutiliza    Consolida tudo
```

**Justificativa técnica:**
- List View cria componentes de busca/filtro reutilizáveis
- Menções @ aproveita o sistema de busca já construído
- Command Palette integra todas as funcionalidades anteriores

**Justificativa de valor:**
- Cada feature entrega valor incremental imediato
- Menor risco de retrabalho
- Validação progressiva com usuários

### Cronograma Sugerido

**Semana 1: List View (6-8h)**
- Dia 1-2: Estrutura base + filtros (4-5h)
- Dia 3-4: Ordenação + performance (2h)
- Dia 5: Responsividade + polish (1h)

**Semana 2: Menções @ (4-6h)**
- Dia 1-2: Detecção + autocomplete (2-3h)
- Dia 3: Seleção + badges (1-2h)
- Dia 4: Envio de contexto + teclado (1.5h)

**Semana 3: Command Palette (3-4h)**
- Dia 1: Estrutura de comandos (1h)
- Dia 2: UI + filtragem (1-2h)
- Dia 3: Execução + feedback + atalhos (1-2h)

### Benefícios Combinados

**Para o Usuário:**
1. 🚀 **Navegação 10x mais rápida** (List View + busca instantânea)
2. 🧠 **Contexto rico para IA** (Menções @ múltiplas em uma mensagem)
3. ⚡ **Produtividade máxima** (Command Palette para ações rápidas)

**Para o Produto:**
1. 🎨 **Diferenciação competitiva** (nenhum competitor tem essas 3 juntas)
2. 📈 **Retenção aumentada** (power users ficam engajados)
3. 🗣️ **Viral potential** (features "wow" que usuários compartilham)

### Métricas de Sucesso

**Sprint 2 - Parte 2:**
- 60%+ dos usuários usam List View regularmente
- 40%+ usam Menções @ em conversas com IA
- 20%+ de power users descobrem Command Palette
- Tempo médio por sessão aumenta 50%
- NPS aumenta +15 pontos (vs baseline Sprint 2 - Parte 1)

### Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Performance com 100+ cards | Média | Alto | Virtualização com `react-window` |
| Complexidade de estado | Média | Médio | Hooks customizados + Context API |
| UX confusa (muitas features) | Baixa | Médio | Onboarding tooltips + comando /help |
| Conflito de atalhos de teclado | Baixa | Baixo | Atalhos opcionais, / é único |
| Retrabalho por dependências | Baixa | Alto | Ordem de implementação já otimizada |

### Dependências Externas

**Bibliotecas necessárias:**
```json
{
  "react-window": "^1.8.10",          // Virtualização de listas
  "react-hotkeys-hook": "^4.5.0",     // Atalhos de teclado (opcional)
  "fuse.js": "^7.0.0"                  // Fuzzy search (opcional, se nativo não bastar)
}
```

**Instalação:**
```bash
npm install react-window
npm install -D @types/react-window

# Opcionais
npm install react-hotkeys-hook fuse.js
```

### Arquivos Novos vs Modificados

**Novos arquivos (estimativa: 15-20 arquivos):**
- List View: 8 arquivos
- Menções @: 4 arquivos
- Command Palette: 3 arquivos
- Utils compartilhados: 2-3 arquivos

**Modificados (estimativa: 3-5 arquivos):**
- `canvas-workspace.tsx` (view mode toggle)
- `ai-sidebar.tsx` (integração @ e /)
- `canvas-header.tsx` (toggle grid/list opcional)

### Checklist de Implementação

**Antes de começar:**
- [ ] Instalar dependências (`react-window`)
- [ ] Criar branch `feature/power-user-features`
- [ ] Revisar constantes em `lib/card-constants.ts`

**Durante implementação:**
- [ ] Commitar ao final de cada fase
- [ ] Testar com 50+ cards mockados
- [ ] Validar performance (Lighthouse)
- [ ] Adicionar tooltips de onboarding

**Antes de mergear:**
- [ ] Build TypeScript passando
- [ ] ESLint passando
- [ ] Testes manuais em Chrome + Safari + Firefox
- [ ] Teste mobile (responsividade)
- [ ] Review de código
- [ ] Atualizar documentação

---

## Sprint 2: Melhorias UX Adicionais (2025-10-24)

### 8.1 Sistema de Progressão e Unlock (50%) ⭐⭐⭐⭐⭐

**Esforço:** 3-4 horas
**Impacto:** MUITO ALTO
**Status:** ✅ **COMPLETO** (2025-10-24)

#### Problema que Resolve
- Usuários não sabem quanto falta para completar o projeto
- Falta de gamificação/incentivo para preencher mais cards
- Project Overview disponível antes do projeto estar minimamente estruturado
- Falta de senso de progressão

#### Solução Implementada

**Barra de Progresso na Sidebar:**
- Exibição visual: "X/35 cards criados"
- Percentual com cores dinâmicas:
  - Amarelo (#FFC24B) quando <50%
  - Verde (#5AD19A) quando ≥50%
- Barra de progresso animada (transição suave de 500ms)

**Sistema de Unlock (50% threshold):**
- Project Overview bloqueado até 18/35 cards criados (50%)
- Mensagem informativa na sidebar:
  - "💡 Complete 50% dos cards (18/35) para desbloquear o Project Overview"
  - Desaparece automaticamente ao atingir threshold
- Botões desabilitados quando <50%:
  - Botão Overview na sidebar: mostra "Bloqueado (X%)"
  - Botão Overview no header: desabilitado com tooltip dinâmico
- Cálculo em tempo real via evento `pistack:cards:refresh`

**Navegação Simplificada:**
- Botão "Nova Etapa" removido da sidebar (feature não utilizada)
- Botão "Project Overview" adicionado na sidebar
- Estados visuais claros (bloqueado vs desbloqueado)

#### Implementação Técnica

**Arquivos Criados/Modificados:**
- ✅ `canvas-workspace.tsx` - Cálculo de progresso e propagação via props
- ✅ `canvas-sidebar.tsx` - Progress bar, mensagem informativa, botão Overview
- ✅ `canvas-header.tsx` - Botão Overview com lógica de disable
- ✅ `lib/card-constants.ts` - Função `getTotalExpectedCards()`

**Fluxo de Dados:**
```typescript
// canvas-workspace.tsx
const totalExpectedCards = useMemo(() => getTotalExpectedCards(), []) // 35
const progressPercentage = Math.round((totalCardsCreated / totalExpectedCards) * 100)

// Propaga para filhos
<CanvasHeader progressPercentage={progressPercentage} />
<CanvasSidebar totalCards={totalExpectedCards} completedCards={totalCardsCreated} />

// canvas-sidebar.tsx e canvas-header.tsx
const canAccessOverview = progressPercentage >= 50
```

#### Acceptance Criteria
- [x] Barra de progresso exibe X/35 cards com percentual
- [x] Cores mudam dinamicamente (amarelo → verde em 50%)
- [x] Mensagem informativa aparece quando <50%
- [x] Mensagem desaparece automaticamente ao atingir 50%
- [x] Botão Overview na sidebar com estados visuais claros
- [x] Botão Overview no header desabilitado quando <50%
- [x] Tooltips informativos mostram progresso atual
- [x] Cálculo atualiza em tempo real ao criar/deletar cards
- [x] Navegação funcional entre Canvas ↔ Overview quando desbloqueado

#### Impacto Esperado
- **Engajamento:** Usuários preenchem mais cards para desbloquear Overview
- **Onboarding:** Senso de progressão reduz abandono
- **Qualidade:** Overview só é acessível com projeto minimamente estruturado
- **UX:** Feedbacks visuais claros sobre estado do projeto

---

### 8.2 Reorganização UX Batch Creation ⭐⭐⭐⭐

**Esforço:** 2 horas
**Impacto:** MÉDIO-ALTO
**Status:** ✅ **COMPLETO** (2025-10-24)

#### Problema que Resolve
- Botão "Criar Todos" muito visível causava uso excessivo
- Usuários achavam que estava "travado" (não entendiam o tempo de espera)
- Falta de feedback sobre quanto tempo levaria
- Timeouts prematuros abortavam criação de cards

#### Solução Implementada

**Reorganização do Dropdown:**
- Botão "Criar Todos" movido para última posição no dropdown
- Separador visual antes do botão
- Mostra contador: "Criar Todos (X)"
- Só aparece quando há 2+ cards disponíveis

**Melhor Comunicação de Espera:**
- Banner informativo no modal: "⏱️ Cada card leva ~60s para ser preenchido pela IA. Aguarde..."
- Exibido apenas durante criação (não após conclusão)
- Cor azul suave para indicar informação (não alerta)

**Melhorias Técnicas:**
- Timeout aumentado de 30s para 90s
- Logs detalhados em cada etapa:
  - `[BatchCreate] Starting batch creation for stage: X`
  - `[BatchCreate] Creating card X/Y: cardType`
  - `[BatchCreate] Response status for cardType: 200`
  - `[BatchCreate] Card created successfully: cardId`
- AbortController com timeout configurável
- Tratamento de erro mais específico

#### Arquivos Modificados
- ✅ `stage-section.tsx` - Dropdown reorganizado (linhas 1649-1697)
- ✅ `batch-creation-modal.tsx` - Banner informativo adicionado
- ✅ `stage-section.tsx` - Timeout e logs adicionados (linhas 1136-1146)

#### Acceptance Criteria
- [x] Botão "Criar Todos" é última opção no dropdown
- [x] Separador visual antes do botão
- [x] Banner informativo visível durante criação
- [x] Timeout de 90s funciona sem aborts prematuros
- [x] Logs detalhados em console para debugging
- [x] Modal mostra progresso em tempo real
- [x] Tratamento de erro específico por card

#### Impacto Esperado
- **UX:** Usuários entendem o tempo de espera
- **Redução de Ansiedade:** Banner explica que é normal levar tempo
- **Debug:** Logs facilitam identificação de problemas
- **Confiabilidade:** Menos timeouts = menos frustrações

---

### 8. Project Overview ⭐⭐⭐⭐⭐

**Esforço:** 5 horas (overview básico)
**Impacto:** MUITO ALTO
**Status:** ✅ **COMPLETO** (2025-10-24)

#### Problema que Resolve
- Usuários não veem o "big picture" do projeto
- Difícil apresentar para stakeholders
- Canvas preenchido não gera artefato tangível

#### Solução Proposta
Página `/canvas/[id]/overview` que compila todos os cards em documento estruturado:

**Seções:**
1. **Overview Executivo** (cards da Etapa 1)
2. **Validação de Mercado** (cards da Etapa 2)
3. **Escopo do Produto** (cards da Etapa 3)
4. **Design & UX** (cards da Etapa 4)
5. **Arquitetura Técnica** (cards da Etapa 5)
6. **Plano de Execução** (cards da Etapa 6)

#### Implementação Realizada

**Funcionalidades:**
- Página de overview completa com hero header e progresso visual
- Seções por etapa mostrando todos os cards preenchidos
- Progress bar com cálculo de completude (X/35 cards)
- Estados visuais diferentes (Completo, Em Andamento, Pendente)
- Cards vazios mostram estado "empty" com call-to-action
- Navegação bidirecional Canvas ↔ Overview
- Animações de fade-in suaves

**Componentes Criados:**
1. **`app/(dashboard)/canvas/[id]/overview/page.tsx`**: Página principal com SSR
2. **`components/overview/project-overview.tsx`**: Container principal
3. **`components/overview/overview-header.tsx`**: Hero section
4. **`components/overview/progress-section.tsx`**: Barra de progresso com detalhes por etapa
5. **`components/overview/stage-overview.tsx`**: Renderização de cada etapa
6. **`components/overview/card-display.tsx`**: Display individual de cards
7. **`components/overview/export-actions.tsx`**: Botões de export (placeholders para Tasks 9 e 10)
8. **`lib/card-constants.ts`**: Constantes centralizadas (tipos, títulos, cores)

**Navegação:**
- Botão "Overview" adicionado no header do canvas
- Botão "Canvas" adicionado no header do overview
- Links de breadcrumb funcionais

#### Acceptance Criteria
- [x] Compilação de todos os cards em documento único
- [x] Navegação por seções (etapas)
- [x] Cards vazios mostram estado apropriado (não renderizam vazio)
- [x] Conteúdo renderizado corretamente (texto, listas, objetos)
- [x] Responsivo (desktop + mobile com grid adaptativo)
- [ ] Print-friendly CSS (TODO: implementar em Sprint futura)

#### Arquivos Criados/Modificados
**Criados:**
- ✅ `app/(dashboard)/canvas/[id]/overview/page.tsx`
- ✅ `components/overview/project-overview.tsx`
- ✅ `components/overview/overview-header.tsx`
- ✅ `components/overview/progress-section.tsx`
- ✅ `components/overview/stage-overview.tsx`
- ✅ `components/overview/card-display.tsx`
- ✅ `components/overview/export-actions.tsx`
- ✅ `lib/card-constants.ts`

**Modificados:**
- ✅ `components/canvas/canvas-header.tsx` - Adicionado botão "Overview"
- ✅ `app/globals.css` - Adicionadas animações fade-in-up e line-clamp

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

### 11. List View dos Cards ⭐⭐⭐⭐⭐

**Esforço:** 6-8 horas
**Impacto:** MUITO ALTO
**Status:** 📋 **PLANEJADO** (Implementar PRIMEIRO - base para Tasks 6 e 7)

#### Problema que Resolve
- Navegação difícil em projetos grandes
- Overview rápido é importante
- Grid view não é ideal para busca/filtros
- Falta de visão consolidada de todos os cards

#### Por Que Implementar Primeiro?
✅ **Fundação para outras features:**
- Sistema de busca/filtro será reutilizado em Menções @ e Command Palette
- Componentes de listagem servem como base
- Menor risco de retrabalho

✅ **Valor imediato para usuário:**
- Navegação 10x mais rápida em projetos grandes
- Overview completo em uma tela
- Alternativa ao grid para diferentes contextos

#### Quebra de Implementação

**Fase 1: Estrutura Base (2h)**
- Arquivos a criar:
  - `components/canvas/list-view/list-view-container.tsx`
  - `components/canvas/list-view/list-view-item.tsx`
  - `components/canvas/list-view/view-mode-toggle.tsx`
  - `lib/canvas-view-state.ts`

**Fase 2: Filtros e Busca (2-3h)**
- Arquivos a criar:
  - `components/canvas/list-view/filters-bar.tsx`
  - `components/canvas/list-view/search-input.tsx`
  - `lib/card-filters.ts`
  - `hooks/use-card-search.ts`

**Fase 3: Ordenação e Performance (2h)**
- Virtualização com `react-window` (50+ cards)
- Memoização de cards filtrados
- Debounce na busca (300ms)
- Opções de ordenação: stage-asc, stage-desc, updated-desc, alphabetical, completion

**Fase 4: Responsividade e Polish (1h)**
- Layout responsivo mobile
- Skeleton loading
- Empty states
- Transições suaves

#### Solução Proposta
Toggle entre Grid View (atual) e List View:

**List View mostra:**
- Título do card
- Etapa (com cor)
- Status (vazio, partial, completo)
- Última edição (timestamp relativo)
- Ações rápidas (editar, IA, excluir)

**Features:**
- **Filtros:** por etapa (múltiplos), por status de completude
- **Busca:** textual em tempo real (título + conteúdo)
- **Ordenação:** 5 opções (etapa, data, alfabético, completude)
- **Performance:** virtualização automática com 50+ cards

#### Implementação Técnica
```typescript
// Estado da view (localStorage)
type ViewMode = 'grid' | 'list'

interface ListViewItemProps {
  card: CardRecord
  stageName: string
  stageColor: string
  completionStatus: 'empty' | 'partial' | 'complete'
  lastUpdated: Date
  onEdit: () => void
  onAI: () => void
  onDelete: () => void
}

// Toggle view mode
<ViewModeToggle
  mode={viewMode}
  onChange={setViewMode}
  options={['grid', 'list']}
/>

// List view com virtualização
<ListView cards={filteredCards} virtualize={cards.length > 50}>
  {cards.map(card => (
    <ListViewItem
      key={card.id}
      card={card}
      stageName={STAGE_NAMES[getStageNumber(card.card_type)]}
      stageColor={STAGE_COLORS[getStageNumber(card.card_type)]}
      completionStatus={calculateCompletionStatus(card)}
      lastUpdated={new Date(card.updated_at)}
      onEdit={() => handleEdit(card)}
      onAI={() => handleAI(card)}
      onDelete={() => handleDelete(card)}
    />
  ))}
</ListView>
```

#### Acceptance Criteria
- [ ] Toggle grid/list persiste no localStorage
- [ ] List view mostra todos os metadados relevantes
- [ ] Filtros funcionam (etapa múltipla + status)
- [ ] Busca em tempo real (debounced 300ms)
- [ ] Ordenação com 5 opções funcionais
- [ ] Performance com 100+ cards < 100ms
- [ ] Virtualização ativa automaticamente (50+ cards)
- [ ] Responsivo mobile (stack vertical)
- [ ] Skeleton loading durante fetch
- [ ] Empty states informativos

#### Arquivos Afetados
**Novos:**
- `components/canvas/list-view/list-view-container.tsx`
- `components/canvas/list-view/list-view-item.tsx`
- `components/canvas/list-view/filters-bar.tsx`
- `components/canvas/list-view/search-input.tsx`
- `components/canvas/list-view/view-mode-toggle.tsx`
- `lib/canvas-view-state.ts`
- `lib/card-filters.ts`
- `lib/card-sorting.ts`
- `hooks/use-card-search.ts`

**Modificados:**
- `components/canvas/canvas-workspace.tsx` - Adicionar toggle e lógica de view mode

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

**Última revisão:** 2025-10-24
**Próxima revisão:** 2025-11-24 (ou após Sprint 2 completo)
