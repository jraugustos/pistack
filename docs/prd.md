# 📌 Product Requirements Document (PRD) — PiStack

## 1. Visão Geral
O **PiStack** é uma plataforma de co-criação com IA que transforma ideias em **projetos estruturados**.  
Funciona como um **canvas modular**, onde cada etapa (ideia, personas, funcionalidades, backlog, roadmap etc.) é representada por **cards conectados**.  
Cada card possui um **chat contextual com IA** para refino local, e o sistema gera um **plano de trabalho exportável em Markdown**.

---

## 2. Problema & Oportunidade
Atualmente, brainstorms e planejamentos de produto acontecem de forma **linear e dispersa** (threads, docs soltos, post-its).  
O PiStack organiza essa jornada em uma **estrutura visual, modular e persistente**, tornando mais fácil ir da **ideia → execução**.

---

## 3. Objetivos
- Guiar a criação e evolução de projetos com IA de forma clara e intuitiva.  
- Permitir refinamento infinito via **chat contextual** por card.  
- Reduzir a distância entre ideias e execução com outputs prontos.  
- Oferecer **templates de projetos** para acelerar a criação.  

---

## 4. Público-Alvo
- Founders/empreendedores (validar ideias).  
- PMs e squads (estruturar backlog/roadmap).  
- Designers/devs autônomos (planejar entregas).  
- Estudantes/makers (aprender a estruturar projetos).  

---

## 5. Fluxo do Usuário (MVP)
1. Criar novo projeto (do zero ou via template).  
2. Adicionar cards (Ideia, Persona, Funcionalidade etc.).  
3. Refinar cada card com IA (chat contextual).  
4. Conectar cards no canvas (ex.: Funcionalidades → Backlog → Roadmap).  
5. Exportar em Markdown.  

---

## 6. Funcionalidades do MVP
- **Canvas Modular** → criar, mover, conectar cards (autosave).  
- **Cards** → tipos: Ideia, Persona, Funcionalidades, Backlog, Roadmap (+ tipos extras via templates).  
- **Chat Contextual** → IA por card com histórico e versões.  
- **Templates de Projeto** → App, Produto Físico, Squad, Evento, Marketing, Curso, Carreira.  
- **Conectores Visuais** → sugestões da IA para expansão (Funcionalidades → Backlog, Persona → Jornada etc.).  
- **Exportação Markdown** → saída simples de cards + conexões.  
- **UI Clean** → cores só para status (draft, in_progress, done, error).  

---

## 7. Funcionalidades Futuras
- Exportações avançadas (Trello, Notion, Jira, Pitch Deck).  
- IA Co-Founder (visão global do projeto, consistência e próximos passos).  
- Colaboração multiusuário em tempo real.  
- Importação de arquivos (PDF, CSV, Docs).  
- Comunidade (matchmaking entre projetos).  

---

## 8. Critérios de Aceitação (MVP)

### 8.1 Canvas
- DoR: tipos de card definidos, schema pronto.  
- DoD: criar, mover, conectar cards, autosave funcional.  

### 8.2 Cards
- DoR: estrutura mínima (título, resumo, status).  
- DoD: editar, status colorido, versões salvas.  

### 8.3 Chat Contextual
- DoR: conexão com modelo de IA.  
- DoD: prompt → resposta, aplicar no card, histórico, toasts de feedback.  

### 8.4 Conexões
- DoR: handles visíveis.  
- DoD: arrastar cria conexão, cores de status, persistência no DB.  

### 8.5 Exportação
- DoR: template Markdown definido.  
- DoD: exportar todos os cards, baixar .md, toasts de feedback.  

### 8.6 Sistema de Versões
- DoD: cada atualização gera snapshot, usuário pode restaurar.  

### 8.7 UI & UX
- DoD: layout implementado (sidebar, canvas, chat lateral), modo foco, notificações consistentes.  

---

## 9. Templates & Workflows
- **App** → Funcionalidades → Backlog → MVP | Personas → Jornada → Testes | Stack → Protótipo → Roadmap.  
- **Produto Físico** → Público → Personas → Necessidades | Funcionalidades → Prototipagem | Produção → Custos → Logística.  
- **Squad/Projeto** → Objetivos → OKRs → Backlog | Papéis → Alocação → Roadmap | Processos → Rituais → Métricas.  
- **Evento** → Tema → Público → Agenda | Logística → Custos → Fornecedores | Divulgação → Engajamento → Pós-Evento.  
- **Marketing** → Objetivo → KPIs | Público → Persona → Canais | Criativos → Conteúdo → Cronograma.  
- **Curso** → Objetivo → Público → Persona | Estrutura → Aulas → Avaliações | Plataforma → Recursos → Divulgação.  
- **Carreira** → Objetivos pessoais → Metas → Roadmap | Habilidades → Gaps → Plano de Aprendizado | Networking → Portfólio → Estratégia.  

---

## 10. Stack Técnica
- **Frontend:** Next.js + React, Tailwind, React Flow (canvas A), tldraw (canvas B teste).  
- **Backend:** Supabase (Postgres + pgvector, Auth, Storage), Prisma.  
- **IA:** OpenAI GPT-5 API (SDK direto).  
- **Infra:** Vercel (deploy).  

---

## 11. Requisitos Não Funcionais
- **Performance:** a definir.  
- **Escalabilidade:** a definir.  
- **Segurança:** Supabase Auth, dados privados por padrão.  
- **Disponibilidade:** uptime alvo 99% (Vercel + Supabase).  
- **Acessibilidade:** fora do escopo do MVP.  

---

## 12. Restrições & Assunções
- Sem integrações externas no MVP.  
- Export apenas Markdown.  
- Sem multiusuário no MVP.  
- Limite: 10 projetos por usuário.  
- Histórico: até 20 interações de chat por card.  

---

## 13. KPIs (MVP - Olhar de Teste)
- Nº de projetos criados.  
- Nº médio de cards por projeto.  
- Uso do export (Markdown).  
- Interações com IA por card.  

---

## 14. Dependências Externas
- OpenAI GPT-5 API.  
- Supabase (DB, Auth, Storage).  
- Vercel (deploy).  
- React Flow (canvas).  
- tldraw (canvas teste).  

---

## 15. Riscos & Mitigação
- **Latência/custo IA** → limitar tokens, mensagens curtas.  
- **Canvas pouco intuitivo** → onboarding inline + templates.  
- **Falta de integrações** → reforçar export Markdown, planejar integrações futuras.  
- **Escopo inchado** → manter foco MVP.  
- **Lock-in Supabase** → usar Prisma + GraphJSON para portabilidade.  

---

## 16. Glossário
- **Card:** bloco no canvas (Ideia, Persona, Funcionalidade etc.).  
- **Edge/Conexão:** relação entre cards.  
- **GraphJSON:** formato canônico de nodes + edges.  
- **Status:** estado de card (draft, in_progress, done, error).  
- **Chat Contextual:** IA vinculada a um card.  
- **Versão:** snapshot salvo de um card.  
- **Exportação:** saída em Markdown.  
