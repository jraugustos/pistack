# 🎨 UX Specification — PiStack (MVP)

## 1. Arquitetura de Informação
- **Workspace**
  - Sidebar (Quick Actions): Novo Card, Templates, Exportar, Projetos, Configurações.
  - Canvas central (área viva): cards, conexões, zoom/drag.
  - Painel direito (Chat do Card): Chat | Versions | Notes.
- **Projeto**
  - Cards (Ideia, Persona, Funcionalidades, Backlog, Roadmap… + tipos dos templates).
  - Conexões (Edges) e **GraphJSON** como fonte de verdade.
- **Saídas**
  - Export Markdown.

---

## 2. Fluxos Principais

### 2.1 Onboarding (novo projeto)
1. Botão “+ Projeto” → Modal: Nome (obrig.), Descrição (opcional).
2. Escolha: **Do zero** | **Começar com Template**.
3. Se Template → seleção (App, Produto Físico, Squad, Evento, Marketing, Curso, Carreira) + **pré-visualização** dos cards gerados.
4. Criar → abre canvas com cards posicionados + tooltip “E agora?” (2–3 dicas).

### 2.2 Criar e Editar Card
1. `+ Card` (menu contextual ou Sidebar) → escolher **Tipo**.
2. Modal rápido com campos mínimos: **Título** (obrig.), **Descrição curta** (opcional).
3. Card aparece no canvas (status: `draft`).
4. Edit inline: título/summary; **autosave** + “salvo” discreto.

### 2.3 Conectar Cards
1. Arrastar handle do card A → card B.
2. Linha cinza (default); se houver relação sugerida pela IA, breve hint.
3. Menu da conexão (hover): tipo/nota (opcional), remover.

### 2.4 Chat Contextual (refino do card)
1. Selecionar card → abre painel direito no **Chat**.
2. Microcopys (chips) por tipo de card (ex.: Persona: “Adicionar dores”, “Jobs-to-be-Done”).
3. Enviar → resposta com botões: **Apply → Merge / Replace / Append**.
4. Ao aplicar → **Versions** ganha um snapshot (diff simples).

### 2.5 Templates (gera estrutura)
1. Ação “Templates” (Sidebar ou onboarding).
2. Ao escolher um template, exibir grade dos **cards iniciais** + **mini-mapa** de conexões.
3. Confirmar → gerar cards e posicionar (layout automático simples).
4. Banner de “Passos seguintes” (links rápidos para abrir o chat em 2–3 cards críticos).

### 2.6 Export Markdown
1. Botão “Exportar” (header/Sidebar).
2. Preview (markdown render) + checklist de seções incluídas.
3. Exportar → arquivo `.md` baixado + toast verde.

---

## 3. Componentes (MVP)
- **Card**
  - Props: `type`, `title`, `summary`, `status` (`draft|in_progress|done|error`).
  - Slots: Header (icon+title+status), Body (summary), Footer (progress/versões).
  - Ações: Edit, OpenChat, Delete, Duplicate.
- **Edge**
  - Props: `from`, `to`, `relationType?`.
  - States: `default (gray)`, `active (blue)`, `validated (green)`.
- **Sidebar**
  - Grupos: Actions (Novo Card, Templates, Export), Projetos, Config.
- **ChatPanel**
  - Abas: Chat | Versions | Notes.
  - Controles: prompt input, chips, Apply (Merge/Replace/Append).
- **TemplatePicker**
  - Cards de template com: nome, descrição curta, **lista de cards** que serão criados, **thumbnail** de conexões.
- **Toast/Feedback**
  - Sucesso (verde), Erro (vermelho), Pendência (amarelo), IA em ação (roxo sutil).
- **Minimap** (MVP+ opcional)
  - Vista do grafo; clique para navegar.

---

## 4. Design System (tokens iniciais)
- **Cores base**
  - Background: `#FFFFFF` (light) / `#111111` (dark futuro)
  - Text Primary: `#1C1C1C`; Text Secondary: `#666666`
  - Neutral lines: `#E6E6E6` / `#A0A0A0`
- **Cores de status**
  - Draft: cinza `#A0A0A0`
  - In Progress: azul `#4A90E2`
  - Done: verde `#57C785`
  - Error: vermelho `#E74C3C`
  - IA ativa: roxo `#7A5FFF`
- **Raios e elevação**
  - Radius: `16px` (2xl)
  - Sombra: mínima; contraste de tons preferido
- **Tipografia**
  - Inter / Satoshi / Nunito Sans; pesos: 300/400/600/700
  - Tamanhos: H1 20–24, H2 16–18, Body 14–16, Caption 12–13
- **Espaçamento**
  - 8pt grid: 8 / 12 / 16 / 24 / 32

---

## 5. Microcopy (exemplos)
- **Onboarding vazio**: “Comece criando um card de **Ideia** ou use um **Template** para acelerar.”
- **Chips (Persona)**: “Adicionar dores”, “Mapear objetivos”, “Gerar JTBD”
- **Chips (Funcionalidades)**: “Quebrar em épicos”, “Gerar critérios de aceite”
- **Apply**: “Aplicar ao card” (tooltip: “Cria uma nova versão. Você pode desfazer em ‘Versions’.”)
- **Export**: “Seu projeto foi exportado com sucesso.”

---

## 6. Templates (conteúdo inicial por tipo)
- **App**: Ideia, Personas, Funcionalidades, Backlog (MVP), Stack Técnica, Roadmap, Plano de Testes, Plano de Divulgação
- **Produto Físico**: Público, Personas, Necessidades, Diferenciais, Prototipagem, Produção, Custos, Logística, Marketing, Canais
- **Squad/Projeto**: Objetivos, OKRs, Backlog, Papéis/Responsabilidades, Alocação, Roadmap, Processos, Rituais, Métricas
- **Evento**: Tema/Objetivo, Público, Agenda, Logística, Fornecedores, Custos, Divulgação, Engajamento, Pós-Evento
- **Marketing**: Objetivo→KPIs, Persona, Canais, Criativos, Plano de Conteúdo, Cronograma, Monitoramento, Relatório
- **Curso**: Objetivo Educacional, Público/Persona, Estrutura, Aulas/Atividades, Avaliações, Plataforma, Recursos, Divulgação, Comunidade
- **Carreira**: Objetivos, Metas Longo Prazo, Roadmap, Habilidades, Gaps, Plano de Aprendizado, Networking, Portfólio, Estratégia, Checkpoints

---

## 7. Critérios de Aceitação (UX)
- **Onboarding**
  - Projeto pode ser criado do zero ou por template.
  - Usuário recebe 1–2 dicas iniciais in-product.
- **Canvas & Cards**
  - Criar, editar, mover e excluir card sem ambiguidade.
  - Conectar cards por drag, com feedback visual.
  - Status visível por cor/ícone; autosave com feedback.
- **Chat do Card**
  - Chips contextuais por tipo de card.
  - Apply gera versão e mostra confirmação.
- **Templates**
  - Preview antes de criar; posicionamento inicial legível.
  - Banner de próximos passos após aplicar.
- **Export**
  - Preview + download `.md` funcionam.
- **Acessibilidade mínima**
  - Foco visível e navegação por teclado nos pontos críticos.

---

## 8. Roteiro de Testes de Usabilidade
- **Tarefas**
  1. Criar projeto com Template “App”.
  2. Editar card Ideia e aplicar sugestão via Chat.
  3. Criar nova Persona e conectá-la a Funcionalidades.
  4. Gerar Backlog a partir de Funcionalidades (via sugestão).
  5. Exportar Markdown.
- **Métricas observadas**
  - Passos para concluir cada tarefa.
  - Tempo para conclusão.
  - Hesitação/erros.
  - Satisfação (NPS rápido 0–10).

---

## 9. Roadmap UX Imediato
- **Semana 1–2**: wireframes low-fi (onboarding, canvas vazio, canvas template, chat aberto, export preview) + protótipo clicável.
- **Semana 3**: teste de usabilidade (5–8 usuários), ajustes de copy/hierarquia.
- **Semana 4**: especificação final de componentes (tokens, estados, variantes) → handoff dev.
