-- ============================================
-- PISTACK DATABASE SCHEMA
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Users (sincronizado com Clerk via webhook)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT,
  name TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects (canvas do usuário)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stages (6 etapas fixas por projeto)
CREATE TABLE IF NOT EXISTS stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  stage_number INTEGER NOT NULL CHECK (stage_number BETWEEN 1 AND 6),
  stage_name TEXT NOT NULL,
  stage_color TEXT NOT NULL,
  cards_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, stage_number)
);

-- Cards (conteúdo flexível em JSON por card type)
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stage_id UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
  card_type TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Threads (conversas com OpenAI assistants por etapa)
CREATE TABLE IF NOT EXISTS ai_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  stage_number INTEGER NOT NULL CHECK (stage_number BETWEEN 1 AND 6),
  openai_thread_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Messages (histórico de mensagens)
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES ai_threads(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES (para performance)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_stages_project_id ON stages(project_id);
CREATE INDEX IF NOT EXISTS idx_stages_stage_number ON stages(stage_number);
CREATE INDEX IF NOT EXISTS idx_cards_stage_id ON cards(stage_id);
CREATE INDEX IF NOT EXISTS idx_cards_position ON cards(position);
CREATE INDEX IF NOT EXISTS idx_ai_threads_project_id ON ai_threads(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_thread_id ON ai_messages(thread_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

-- Users: Usuário só vê seus próprios dados
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (clerk_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (clerk_id = auth.jwt() ->> 'sub');

-- Projects: Usuário só vê seus próprios projetos
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (user_id IN (
    SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (user_id IN (
    SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (user_id IN (
    SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (user_id IN (
    SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

-- Stages: Via projeto do usuário
CREATE POLICY "Users can view stages of own projects" ON stages
  FOR SELECT USING (project_id IN (
    SELECT p.id FROM projects p
    INNER JOIN users u ON u.id = p.user_id
    WHERE u.clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can insert stages in own projects" ON stages
  FOR INSERT WITH CHECK (project_id IN (
    SELECT p.id FROM projects p
    INNER JOIN users u ON u.id = p.user_id
    WHERE u.clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can update stages in own projects" ON stages
  FOR UPDATE USING (project_id IN (
    SELECT p.id FROM projects p
    INNER JOIN users u ON u.id = p.user_id
    WHERE u.clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can delete stages in own projects" ON stages
  FOR DELETE USING (project_id IN (
    SELECT p.id FROM projects p
    INNER JOIN users u ON u.id = p.user_id
    WHERE u.clerk_id = auth.jwt() ->> 'sub'
  ));

-- Cards: Via stage → projeto → usuário
CREATE POLICY "Users can view cards of own projects" ON cards
  FOR SELECT USING (stage_id IN (
    SELECT s.id FROM stages s
    INNER JOIN projects p ON p.id = s.project_id
    INNER JOIN users u ON u.id = p.user_id
    WHERE u.clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can insert cards in own projects" ON cards
  FOR INSERT WITH CHECK (stage_id IN (
    SELECT s.id FROM stages s
    INNER JOIN projects p ON p.id = s.project_id
    INNER JOIN users u ON u.id = p.user_id
    WHERE u.clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can update cards in own projects" ON cards
  FOR UPDATE USING (stage_id IN (
    SELECT s.id FROM stages s
    INNER JOIN projects p ON p.id = s.project_id
    INNER JOIN users u ON u.id = p.user_id
    WHERE u.clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can delete cards in own projects" ON cards
  FOR DELETE USING (stage_id IN (
    SELECT s.id FROM stages s
    INNER JOIN projects p ON p.id = s.project_id
    INNER JOIN users u ON u.id = p.user_id
    WHERE u.clerk_id = auth.jwt() ->> 'sub'
  ));

-- AI Threads: Via projeto → usuário
CREATE POLICY "Users can view AI threads of own projects" ON ai_threads
  FOR SELECT USING (project_id IN (
    SELECT p.id FROM projects p
    INNER JOIN users u ON u.id = p.user_id
    WHERE u.clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can insert AI threads in own projects" ON ai_threads
  FOR INSERT WITH CHECK (project_id IN (
    SELECT p.id FROM projects p
    INNER JOIN users u ON u.id = p.user_id
    WHERE u.clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can delete AI threads in own projects" ON ai_threads
  FOR DELETE USING (project_id IN (
    SELECT p.id FROM projects p
    INNER JOIN users u ON u.id = p.user_id
    WHERE u.clerk_id = auth.jwt() ->> 'sub'
  ));

-- AI Messages: Via thread → projeto → usuário
CREATE POLICY "Users can view AI messages of own threads" ON ai_messages
  FOR SELECT USING (thread_id IN (
    SELECT t.id FROM ai_threads t
    INNER JOIN projects p ON p.id = t.project_id
    INNER JOIN users u ON u.id = p.user_id
    WHERE u.clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can insert AI messages in own threads" ON ai_messages
  FOR INSERT WITH CHECK (thread_id IN (
    SELECT t.id FROM ai_threads t
    INNER JOIN projects p ON p.id = t.project_id
    INNER JOIN users u ON u.id = p.user_id
    WHERE u.clerk_id = auth.jwt() ->> 'sub'
  ));

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stages_updated_at BEFORE UPDATE ON stages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function para criar stages automaticamente ao criar projeto
CREATE OR REPLACE FUNCTION create_default_stages()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO stages (project_id, stage_number, stage_name, stage_color, cards_count)
  VALUES
    (NEW.id, 1, 'Ideia Base', '#7AA2FF', 0),
    (NEW.id, 2, 'Entendimento', '#5AD19A', 0),
    (NEW.id, 3, 'Escopo', '#FFC24B', 0),
    (NEW.id, 4, 'Design', '#FF6B6B', 0),
    (NEW.id, 5, 'Tech', '#E879F9', 0),
    (NEW.id, 6, 'Planejamento', '#9B8AFB', 0);
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para criar stages ao criar projeto
CREATE TRIGGER create_stages_on_project_insert
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION create_default_stages();

-- Function para atualizar cards_count ao adicionar/remover card
CREATE OR REPLACE FUNCTION update_stage_cards_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE stages SET cards_count = cards_count + 1 WHERE id = NEW.stage_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE stages SET cards_count = cards_count - 1 WHERE id = OLD.stage_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger para atualizar cards_count
CREATE TRIGGER update_cards_count_on_insert
  AFTER INSERT ON cards
  FOR EACH ROW
  EXECUTE FUNCTION update_stage_cards_count();

CREATE TRIGGER update_cards_count_on_delete
  AFTER DELETE ON cards
  FOR EACH ROW
  EXECUTE FUNCTION update_stage_cards_count();

-- ============================================
-- SEED DATA (opcional - para testes)
-- ============================================

-- Descomente para inserir dados de exemplo:
-- INSERT INTO users (clerk_id, email, name) VALUES
--   ('user_test123', 'test@example.com', 'Test User');

-- INSERT INTO projects (user_id, name, description) VALUES
--   ((SELECT id FROM users WHERE clerk_id = 'user_test123'), 'App de Finanças', 'Controle financeiro pessoal com IA');
