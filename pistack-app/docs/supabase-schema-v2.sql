-- ============================================
-- PISTACK DATABASE SCHEMA V2 (Simplified)
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DROP EXISTING TABLES (se necessário)
-- ============================================
-- Descomente as linhas abaixo para recriar do zero:
-- DROP TABLE IF EXISTS ai_messages CASCADE;
-- DROP TABLE IF EXISTS ai_threads CASCADE;
-- DROP TABLE IF EXISTS cards CASCADE;
-- DROP TABLE IF EXISTS stages CASCADE;
-- DROP TABLE IF EXISTS projects CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- TABLES
-- ============================================

-- Users (ID = Clerk User ID)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Clerk user ID (ex: user_2abc...)
  email TEXT,
  name TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
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

-- Cards
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stage_id UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
  card_type TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Threads
CREATE TABLE IF NOT EXISTS ai_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  stage_number INTEGER NOT NULL CHECK (stage_number BETWEEN 1 AND 6),
  openai_thread_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Messages
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES ai_threads(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_stages_project_id ON stages(project_id);
CREATE INDEX IF NOT EXISTS idx_stages_stage_number ON stages(stage_number);
CREATE INDEX IF NOT EXISTS idx_cards_stage_id ON cards(stage_id);
CREATE INDEX IF NOT EXISTS idx_cards_position ON cards(position);
CREATE INDEX IF NOT EXISTS idx_ai_threads_project_id ON ai_threads(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_thread_id ON ai_messages(thread_id);

-- ============================================
-- ROW LEVEL SECURITY (DISABLED)
-- ============================================
-- Desabilitado porque usamos Clerk + service_role key
-- Segurança é garantida nas API routes

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE stages DISABLE ROW LEVEL SECURITY;
ALTER TABLE cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_threads DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages DISABLE ROW LEVEL SECURITY;

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stages_updated_at ON stages;
CREATE TRIGGER update_stages_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cards_updated_at ON cards;
CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function para criar stages automaticamente
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

-- Trigger para criar stages
DROP TRIGGER IF EXISTS create_stages_on_project_insert ON projects;
CREATE TRIGGER create_stages_on_project_insert
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION create_default_stages();

-- Function para atualizar cards_count
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

-- Triggers para cards_count
DROP TRIGGER IF EXISTS update_cards_count_on_insert ON cards;
CREATE TRIGGER update_cards_count_on_insert
  AFTER INSERT ON cards
  FOR EACH ROW
  EXECUTE FUNCTION update_stage_cards_count();

DROP TRIGGER IF EXISTS update_cards_count_on_delete ON cards;
CREATE TRIGGER update_cards_count_on_delete
  AFTER DELETE ON cards
  FOR EACH ROW
  EXECUTE FUNCTION update_stage_cards_count();
