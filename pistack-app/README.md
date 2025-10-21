# PIStack - Estruture suas ideias com IA

Canvas modular alimentado por IA que organiza seu processo criativo. Da ideação à execução, com documentação estruturada e outputs automáticos.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm ou yarn
- Conta no [Clerk](https://clerk.com) (autenticação)
- Conta no [Supabase](https://supabase.com) (banco de dados)
- Chave API do [OpenAI](https://platform.openai.com) (IA)

### Installation

1. **Clone o repositório e instale as dependências:**

```bash
cd pistack-app
npm install
```

2. **Configure as variáveis de ambiente:**

Copie o arquivo `.env.local.example` para `.env.local` e preencha com suas chaves:

```bash
cp .env.local.example .env.local
```

Edite `.env.local` e adicione suas chaves:

```env
# Clerk (Authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase (Database & Storage)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# OpenAI (AI Assistants)
OPENAI_API_KEY=sk-...
```

3. **Execute o projeto:**

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 📁 Estrutura do Projeto

```
pistack-app/
├── app/
│   ├── (marketing)/          # Landing page
│   ├── (auth)/                # Login/Signup (Clerk)
│   ├── (dashboard)/           # Projects & Canvas
│   ├── api/                   # API Routes
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── canvas/                # Canvas components
│   ├── projects/              # Project components
│   ├── providers/             # Theme & Auth providers
│   └── theme-toggle.tsx
├── lib/
│   ├── supabase/              # Supabase client & queries
│   ├── openai/                # OpenAI assistants
│   └── utils.ts
├── hooks/                     # Custom React hooks
├── types/                     # TypeScript types
└── public/                    # Static assets
```

## 🎨 Features

- ✅ **Dark/Light Mode** - Theme switcher com next-themes
- ✅ **Landing Page** - Home page estática convertida
- 🔄 **Autenticação** - Clerk (Google, GitHub, Email)
- 🔄 **Dashboard de Projetos** - Lista e gestão de projetos
- 🔄 **Canvas Modular** - 5 etapas com cards customizados
- 🔄 **AI Assistant** - Chat contextual com OpenAI
- 🔄 **Banco de Dados** - Supabase PostgreSQL
- 🔄 **Real-time** - Supabase Realtime para colaboração

## 🛠️ Stack Técnica

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (a ser instalado)
- **Icons:** Lucide React
- **Auth:** Clerk
- **Database:** Supabase (PostgreSQL)
- **AI:** OpenAI GPT-4 Assistants
- **State:** Zustand (a ser instalado)
- **Forms:** React Hook Form + Zod (a ser instalados)

## 📝 Próximos Passos

### Fase 1: Autenticação ✅
- [x] Setup inicial do projeto
- [x] Configurar Tailwind + Dark Mode
- [x] Criar landing page
- [ ] Integrar Clerk
- [ ] Página de login/signup
- [ ] Webhook para sync com Supabase

### Fase 2: Dashboard de Projetos
- [ ] Setup Supabase (schema + RLS)
- [ ] Página de listagem de projetos
- [ ] Criar novo projeto
- [ ] Filtros e busca
- [ ] Menu de contexto (editar, arquivar)

### Fase 3: Canvas Core
- [ ] Página do canvas
- [ ] Sidebar de etapas (navegação)
- [ ] Grid de cards (renderização)
- [ ] Modal de adicionar card
- [ ] CRUD de cards

### Fase 4: AI Integration
- [ ] Criar 5 OpenAI Assistants
- [ ] Implementar Orchestrator
- [ ] Sidebar AI Assistant (chat)
- [ ] Botões Generate/Expand/Refine
- [ ] Function calling para criar cards

### Fase 5: Features Avançadas
- [ ] Sistema de versões (snapshots)
- [ ] Exportação (PDF/JSON)
- [ ] Real-time collaboration
- [ ] Drag & drop para reordenar cards

## 🔑 Configuração das APIs

### Clerk (Autenticação)

1. Crie uma conta em [clerk.com](https://clerk.com)
2. Crie uma nova aplicação
3. Habilite os provedores: Google, GitHub, Email/Password
4. Copie as chaves para `.env.local`
5. Configure o webhook para `/api/webhooks/clerk`

### Supabase (Banco de Dados)

1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Execute o SQL para criar as tabelas (em breve disponível)
4. Configure Row Level Security (RLS)
5. Copie as chaves para `.env.local`

### OpenAI (IA)

1. Crie uma conta em [platform.openai.com](https://platform.openai.com)
2. Gere uma API key
3. Crie 6 assistants:
   - 5 para cada etapa do canvas
   - 1 orchestrator
4. Copie os IDs dos assistants para `.env.local`

## 📚 Documentação

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI Assistants API](https://platform.openai.com/docs/assistants)

## 🤝 Contributing

Este é um projeto privado em desenvolvimento inicial.

## 📄 License

Private & Proprietary

---

**Status:** 🚧 Em desenvolvimento ativo

**Versão Atual:** 0.1.0 (Setup Inicial + Landing Page)

**Próximo Milestone:** Autenticação com Clerk + Dashboard de Projetos
