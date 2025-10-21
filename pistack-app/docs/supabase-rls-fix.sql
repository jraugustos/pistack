-- ============================================
-- FIX RLS POLICIES FOR CLERK AUTHENTICATION
-- Execute este SQL para corrigir as políticas
-- ============================================

-- Como estamos usando Clerk e não o auth nativo do Supabase,
-- vamos desabilitar temporariamente RLS e usar service_role key
-- no backend (já configurado no .env.local)

-- Disable RLS (vamos controlar acesso via service_role no backend)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE stages DISABLE ROW LEVEL SECURITY;
ALTER TABLE cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_threads DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages DISABLE ROW LEVEL SECURITY;

-- Drop todas as políticas antigas
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
DROP POLICY IF EXISTS "Users can view stages of own projects" ON stages;
DROP POLICY IF EXISTS "Users can insert stages in own projects" ON stages;
DROP POLICY IF EXISTS "Users can update stages in own projects" ON stages;
DROP POLICY IF EXISTS "Users can delete stages in own projects" ON stages;
DROP POLICY IF EXISTS "Users can view cards of own projects" ON cards;
DROP POLICY IF EXISTS "Users can insert cards in own projects" ON cards;
DROP POLICY IF EXISTS "Users can update cards in own projects" ON cards;
DROP POLICY IF EXISTS "Users can delete cards in own projects" ON cards;
DROP POLICY IF EXISTS "Users can view AI threads of own projects" ON ai_threads;
DROP POLICY IF EXISTS "Users can insert AI threads in own projects" ON ai_threads;
DROP POLICY IF EXISTS "Users can delete AI threads in own projects" ON ai_threads;
DROP POLICY IF EXISTS "Users can view AI messages of own threads" ON ai_messages;
DROP POLICY IF EXISTS "Users can insert AI messages in own threads" ON ai_messages;

-- Nota: O controle de acesso será feito no backend via API routes
-- usando o Clerk userId para validar propriedade dos recursos
