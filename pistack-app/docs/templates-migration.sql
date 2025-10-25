-- ============================================
-- PISTACK TEMPLATES SYSTEM - DATABASE MIGRATION
-- Execute este SQL no Supabase SQL Editor
--
-- Este script adiciona suporte para:
-- - Templates personalizáveis de projetos
-- - Card Definitions dinâmicos
-- - Estrutura flexível de etapas e cards
-- ============================================

-- ============================================
-- 1. NOVAS TABELAS
-- ============================================

-- Card Definitions (repositório GLOBAL de cards - apenas ADMIN cria)
CREATE TABLE IF NOT EXISTS card_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('ideation', 'research', 'planning', 'design', 'development', 'marketing')),
  icon TEXT NOT NULL, -- lucide icon name
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Exemplo de fields:
  -- [
  --   {"name": "title", "type": "text", "placeholder": "Título...", "required": true},
  --   {"name": "description", "type": "textarea", "placeholder": "Descreva...", "required": true},
  --   {"name": "priority", "type": "select", "options": ["Alta", "Média", "Baixa"], "required": false}
  -- ]
  is_system BOOLEAN DEFAULT false, -- cards oficiais PIStack vs customizados
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates (templates de projeto completos - apenas ADMIN cria)
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('app-site', 'discovery', 'feature', 'research', 'campaign', 'event')),
  icon TEXT, -- lucide icon name
  is_active BOOLEAN DEFAULT false, -- template ativo sendo usado (apenas 1 pode estar ativo)
  is_system BOOLEAN DEFAULT true, -- todos são sistema por enquanto (admin-created)
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Constraint: apenas 1 template pode estar ativo por vez
CREATE UNIQUE INDEX idx_templates_unique_active ON templates(is_active) WHERE is_active = true;

-- Template Stages (etapas de um template)
CREATE TABLE IF NOT EXISTS template_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  stage_number INTEGER NOT NULL CHECK (stage_number >= 1),
  stage_name TEXT NOT NULL,
  stage_description TEXT,
  stage_color TEXT NOT NULL DEFAULT '#7AA2FF',
  assistant_instructions TEXT, -- instruções específicas para IA nesta etapa
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, stage_number)
);

-- Template Cards (associação M:N entre template_stages e card_definitions)
CREATE TABLE IF NOT EXISTS template_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_stage_id UUID NOT NULL REFERENCES template_stages(id) ON DELETE CASCADE,
  card_definition_id UUID NOT NULL REFERENCES card_definitions(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_stage_id, card_definition_id) -- evita duplicatas
);

-- ============================================
-- 2. MODIFICAR TABELAS EXISTENTES
-- ============================================

-- Adicionar template_id em projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES templates(id);

-- Adicionar card_definition_id em cards
ALTER TABLE cards ADD COLUMN IF NOT EXISTS card_definition_id UUID REFERENCES card_definitions(id);

-- card_type será mantido por compatibilidade, mas deprecated

-- ============================================
-- 3. INDEXES (performance)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_card_definitions_category ON card_definitions(category);
CREATE INDEX IF NOT EXISTS idx_card_definitions_system ON card_definitions(is_system);
CREATE INDEX IF NOT EXISTS idx_templates_active ON templates(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_template_stages_template ON template_stages(template_id);
CREATE INDEX IF NOT EXISTS idx_template_stages_number ON template_stages(template_id, stage_number);
CREATE INDEX IF NOT EXISTS idx_template_cards_stage ON template_cards(template_stage_id);
CREATE INDEX IF NOT EXISTS idx_template_cards_definition ON template_cards(card_definition_id);
CREATE INDEX IF NOT EXISTS idx_projects_template ON projects(template_id);
CREATE INDEX IF NOT EXISTS idx_cards_definition ON cards(card_definition_id);

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE card_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_cards ENABLE ROW LEVEL SECURITY;

-- Função auxiliar: verificar se usuário é admin
-- ⚠️ IMPORTANTE: Substituir emails de admin na variável abaixo
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
DECLARE
  admin_emails TEXT[];
  user_email TEXT;
BEGIN
  -- ⚠️ SUBSTITUIR PELOS EMAILS DOS ADMINS
  admin_emails := ARRAY['seu_email@admin.com', 'outro_admin@email.com'];

  -- Buscar email do usuário atual
  SELECT email INTO user_email
  FROM users
  WHERE clerk_id = auth.jwt() ->> 'sub'
  LIMIT 1;

  -- Verificar se email está na lista de admins
  RETURN user_email = ANY(admin_emails);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas: READ público, WRITE apenas admin

-- Card Definitions
CREATE POLICY "Anyone can view card definitions" ON card_definitions
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify card definitions" ON card_definitions
  FOR ALL USING (is_admin());

-- Templates
CREATE POLICY "Anyone can view templates" ON templates
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify templates" ON templates
  FOR ALL USING (is_admin());

-- Template Stages
CREATE POLICY "Anyone can view template stages" ON template_stages
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify template stages" ON template_stages
  FOR ALL USING (is_admin());

-- Template Cards
CREATE POLICY "Anyone can view template cards" ON template_cards
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify template cards" ON template_cards
  FOR ALL USING (is_admin());

-- ============================================
-- 5. TRIGGERS
-- ============================================

-- Trigger para updated_at nas novas tabelas
CREATE TRIGGER update_card_definitions_updated_at BEFORE UPDATE ON card_definitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. SEED DATA - Card Definitions (36 cards originais)
-- ============================================

-- Etapa 1: Ideia Base (6 cards)
INSERT INTO card_definitions (name, description, category, icon, fields, is_system) VALUES
('Ideia', 'Nome e visão geral do projeto', 'ideation', 'lightbulb',
'[{"name": "projectName", "type": "text", "placeholder": "Nome do seu projeto", "required": true}, {"name": "vision", "type": "textarea", "placeholder": "Visão geral do projeto", "required": false}]'::jsonb, true),

('Pitch', 'Apresentação concisa do projeto', 'ideation', 'presentation',
'[{"name": "pitch", "type": "textarea", "placeholder": "Descreva seu projeto em 2-3 frases impactantes", "required": true}]'::jsonb, true),

('Problema', 'Problema que o projeto resolve', 'research', 'alert-circle',
'[{"name": "problem", "type": "textarea", "placeholder": "Qual problema você está resolvendo?", "required": true}]'::jsonb, true),

('Solução', 'Solução proposta', 'ideation', 'check-circle',
'[{"name": "solution", "type": "textarea", "placeholder": "Como seu projeto resolve o problema?", "required": true}]'::jsonb, true),

('Público-alvo', 'Definição do público-alvo', 'research', 'users',
'[{"name": "targetAudience", "type": "textarea", "placeholder": "Quem são seus usuários?", "required": true}]'::jsonb, true),

('KPIs Iniciais', 'Métricas de sucesso iniciais', 'planning', 'bar-chart',
'[{"name": "kpis", "type": "textarea", "placeholder": "Liste suas métricas de sucesso (ex: 1000 usuários em 3 meses)", "required": true}]'::jsonb, true);

-- Etapa 2: Entendimento (4 cards)
INSERT INTO card_definitions (name, description, category, icon, fields, is_system) VALUES
('Hipóteses de Validação', 'Hipóteses a serem testadas', 'research', 'flask',
'[{"name": "hypotheses", "type": "textarea", "placeholder": "Liste as hipóteses que precisam ser validadas", "required": true}]'::jsonb, true),

('Persona Principal', 'Definição detalhada da persona', 'research', 'user',
'[{"name": "name", "type": "text", "placeholder": "Nome da persona", "required": true}, {"name": "demographics", "type": "textarea", "placeholder": "Dados demográficos", "required": false}, {"name": "painPoints", "type": "textarea", "placeholder": "Dores e frustrações", "required": true}, {"name": "goals", "type": "textarea", "placeholder": "Objetivos", "required": true}]'::jsonb, true),

('Proposta de Valor', 'Proposta única de valor', 'planning', 'star',
'[{"name": "valueProposition", "type": "textarea", "placeholder": "O que torna seu produto único?", "required": true}]'::jsonb, true),

('Benchmarking', 'Análise de concorrentes', 'research', 'trending-up',
'[{"name": "competitors", "type": "textarea", "placeholder": "Liste e analise os principais concorrentes", "required": true}]'::jsonb, true);

-- Etapa 3: Escopo (6 cards)
INSERT INTO card_definitions (name, description, category, icon, fields, is_system) VALUES
('Definição do MVP', 'Produto Mínimo Viável', 'planning', 'target',
'[{"name": "mvpDefinition", "type": "textarea", "placeholder": "Defina seu MVP - o que é essencial?", "required": true}]'::jsonb, true),

('Features Essenciais', 'Funcionalidades essenciais', 'planning', 'list',
'[{"name": "features", "type": "textarea", "placeholder": "Liste as features essenciais (formato: - Feature 1\\n- Feature 2)", "required": true}]'::jsonb, true),

('User Stories', 'Histórias de usuário', 'planning', 'file-text',
'[{"name": "userStories", "type": "textarea", "placeholder": "Escreva as user stories (formato: Como [persona], quero [ação], para [benefício])", "required": true}]'::jsonb, true),

('Critérios de Aceitação', 'Critérios de aceitação das features', 'planning', 'check-square',
'[{"name": "acceptanceCriteria", "type": "textarea", "placeholder": "Defina os critérios de aceitação", "required": true}]'::jsonb, true),

('Roadmap', 'Roadmap de desenvolvimento', 'planning', 'map',
'[{"name": "roadmap", "type": "textarea", "placeholder": "Descreva o roadmap por fases", "required": true}]'::jsonb, true),

('Restrições de Escopo', 'O que NÃO será feito no MVP', 'planning', 'x-circle',
'[{"name": "constraints", "type": "textarea", "placeholder": "O que fica fora do MVP?", "required": true}]'::jsonb, true);

-- Etapa 4: Design & UX (5 cards)
INSERT INTO card_definitions (name, description, category, icon, fields, is_system) VALUES
('Fluxos de Usuário', 'Mapeamento de fluxos', 'design', 'git-branch',
'[{"name": "userFlows", "type": "textarea", "placeholder": "Descreva os principais fluxos de usuário", "required": true}]'::jsonb, true),

('Wireframes', 'Wireframes das telas principais', 'design', 'layout',
'[{"name": "wireframes", "type": "textarea", "placeholder": "Descreva ou anexe wireframes", "required": false}, {"name": "wireframeUrls", "type": "url", "placeholder": "Link para Figma/Sketch", "required": false}]'::jsonb, true),

('Design System', 'Sistema de design', 'design', 'palette',
'[{"name": "colors", "type": "textarea", "placeholder": "Paleta de cores", "required": false}, {"name": "typography", "type": "textarea", "placeholder": "Tipografia", "required": false}, {"name": "spacing", "type": "textarea", "placeholder": "Espaçamentos", "required": false}]'::jsonb, true),

('Componentes', 'Biblioteca de componentes UI', 'design', 'box',
'[{"name": "components", "type": "textarea", "placeholder": "Liste os componentes principais (ex: Button, Card, Modal)", "required": true}]'::jsonb, true),

('Acessibilidade', 'Requisitos de acessibilidade', 'design', 'accessibility',
'[{"name": "accessibilityRequirements", "type": "textarea", "placeholder": "Requisitos de acessibilidade (WCAG, ARIA, etc)", "required": false}]'::jsonb, true);

-- Etapa 5: Arquitetura (6 cards)
INSERT INTO card_definitions (name, description, category, icon, fields, is_system) VALUES
('Stack Tecnológica', 'Tecnologias escolhidas', 'development', 'layers',
'[{"name": "frontend", "type": "textarea", "placeholder": "Frontend stack", "required": true}, {"name": "backend", "type": "textarea", "placeholder": "Backend stack", "required": true}, {"name": "database", "type": "text", "placeholder": "Database", "required": true}]'::jsonb, true),

('Arquitetura', 'Arquitetura do sistema', 'development', 'network',
'[{"name": "architecture", "type": "textarea", "placeholder": "Descreva a arquitetura (monolito, microserviços, etc)", "required": true}]'::jsonb, true),

('Banco de Dados', 'Modelagem de dados', 'development', 'database',
'[{"name": "schema", "type": "textarea", "placeholder": "Descreva o schema do banco de dados", "required": true}, {"name": "relations", "type": "textarea", "placeholder": "Relacionamentos entre tabelas", "required": false}]'::jsonb, true),

('Design de APIs', 'Especificação de APIs', 'development', 'git-merge',
'[{"name": "endpoints", "type": "textarea", "placeholder": "Liste os principais endpoints da API", "required": true}, {"name": "authentication", "type": "text", "placeholder": "Método de autenticação", "required": false}]'::jsonb, true),

('Infraestrutura', 'Infraestrutura e deploy', 'development', 'server',
'[{"name": "hosting", "type": "text", "placeholder": "Onde será hospedado?", "required": true}, {"name": "ci_cd", "type": "textarea", "placeholder": "Pipeline de CI/CD", "required": false}]'::jsonb, true),

('Segurança', 'Considerações de segurança', 'development', 'shield',
'[{"name": "securityMeasures", "type": "textarea", "placeholder": "Medidas de segurança (autenticação, autorização, criptografia)", "required": true}]'::jsonb, true);

-- Etapa 6: Planejamento (8 cards)
INSERT INTO card_definitions (name, description, category, icon, fields, is_system) VALUES
('Planejamento de Sprints', 'Organização em sprints', 'planning', 'calendar-check',
'[{"name": "sprintDuration", "type": "text", "placeholder": "Duração de cada sprint", "required": true}, {"name": "sprints", "type": "textarea", "placeholder": "Liste os sprints e objetivos", "required": true}]'::jsonb, true),

('Cronograma', 'Timeline do projeto', 'planning', 'calendar',
'[{"name": "timeline", "type": "textarea", "placeholder": "Cronograma detalhado", "required": true}, {"name": "milestones", "type": "textarea", "placeholder": "Marcos importantes", "required": true}]'::jsonb, true),

('Recursos', 'Recursos necessários', 'planning', 'users-2',
'[{"name": "team", "type": "textarea", "placeholder": "Equipe necessária", "required": true}, {"name": "tools", "type": "textarea", "placeholder": "Ferramentas e serviços", "required": false}]'::jsonb, true),

('Orçamento', 'Orçamento estimado', 'planning', 'dollar-sign',
'[{"name": "budget", "type": "textarea", "placeholder": "Estimativa de custos", "required": true}, {"name": "breakdown", "type": "textarea", "placeholder": "Breakdown por categoria", "required": false}]'::jsonb, true),

('Marcos', 'Marcos do projeto', 'planning', 'flag',
'[{"name": "milestones", "type": "textarea", "placeholder": "Liste os principais marcos", "required": true}]'::jsonb, true),

('Critérios de Sucesso', 'Como medir o sucesso', 'planning', 'trophy',
'[{"name": "successCriteria", "type": "textarea", "placeholder": "Critérios objetivos de sucesso", "required": true}]'::jsonb, true),

('Gestão de Riscos', 'Identificação e mitigação de riscos', 'planning', 'alert-triangle',
'[{"name": "risks", "type": "textarea", "placeholder": "Liste os principais riscos", "required": true}, {"name": "mitigation", "type": "textarea", "placeholder": "Planos de mitigação", "required": true}]'::jsonb, true),

('Plano de Lançamento', 'Estratégia de lançamento', 'marketing', 'rocket',
'[{"name": "launchStrategy", "type": "textarea", "placeholder": "Como será o lançamento?", "required": true}, {"name": "marketing", "type": "textarea", "placeholder": "Canais de marketing", "required": false}]'::jsonb, true);

-- ============================================
-- 7. SEED DATA - Template "PIStack Completo"
-- ============================================

-- Criar template padrão
INSERT INTO templates (name, description, category, icon, is_active, is_system)
VALUES (
  'PIStack Completo',
  'Template completo com 6 etapas para desenvolvimento de aplicativos e sites, da ideia ao lançamento',
  'app-site',
  'smartphone',
  true, -- Template ativo
  true
);

-- Variável para armazenar template_id
DO $$
DECLARE
  template_id_var UUID;
  stage1_id UUID;
  stage2_id UUID;
  stage3_id UUID;
  stage4_id UUID;
  stage5_id UUID;
  stage6_id UUID;
BEGIN
  -- Buscar o template recém-criado
  SELECT id INTO template_id_var FROM templates WHERE name = 'PIStack Completo';

  -- Criar Stage 1: Ideia Base
  INSERT INTO template_stages (template_id, stage_number, stage_name, stage_description, stage_color, assistant_instructions, position)
  VALUES (
    template_id_var,
    1,
    'Ideia Base',
    'Conceito inicial, problema, solução e KPIs do projeto',
    '#7AA2FF',
    'Ajude o usuário a refinar sua ideia de projeto, identificar o problema core e definir uma solução clara. Foque em tornar o pitch conciso e impactante.',
    0
  ) RETURNING id INTO stage1_id;

  -- Criar Stage 2: Entendimento
  INSERT INTO template_stages (template_id, stage_number, stage_name, stage_description, stage_color, assistant_instructions, position)
  VALUES (
    template_id_var,
    2,
    'Entendimento',
    'Hipóteses, personas e proposta de valor',
    '#5AD19A',
    'Auxilie na definição de personas detalhadas e na formulação de hipóteses de validação. Ajude a clarificar a proposta única de valor.',
    1
  ) RETURNING id INTO stage2_id;

  -- Criar Stage 3: Escopo
  INSERT INTO template_stages (template_id, stage_number, stage_name, stage_description, stage_color, assistant_instructions, position)
  VALUES (
    template_id_var,
    3,
    'Escopo',
    'Definição do MVP, features essenciais, user stories e roadmap',
    '#FFC24B',
    'Ajude a definir um MVP realista e priorizar features. Auxilie na escrita de user stories claras e na criação de um roadmap viável.',
    2
  ) RETURNING id INTO stage3_id;

  -- Criar Stage 4: Design & UX
  INSERT INTO template_stages (template_id, stage_number, stage_name, stage_description, stage_color, assistant_instructions, position)
  VALUES (
    template_id_var,
    4,
    'Design & UX',
    'Fluxos de usuário, wireframes e design system',
    '#FF6B6B',
    'Oriente na criação de fluxos de usuário intuitivos e ajude a pensar em componentes reutilizáveis. Sugira boas práticas de UX e acessibilidade.',
    3
  ) RETURNING id INTO stage4_id;

  -- Criar Stage 5: Arquitetura
  INSERT INTO template_stages (template_id, stage_number, stage_name, stage_description, stage_color, assistant_instructions, position)
  VALUES (
    template_id_var,
    5,
    'Arquitetura',
    'Stack técnica, arquitetura e infraestrutura',
    '#9B8AFB',
    'Auxilie na escolha de tecnologias adequadas ao escopo do projeto. Sugira arquiteturas escaláveis e seguras. Oriente sobre infraestrutura e deploy.',
    4
  ) RETURNING id INTO stage5_id;

  -- Criar Stage 6: Planejamento
  INSERT INTO template_stages (template_id, stage_number, stage_name, stage_description, stage_color, assistant_instructions, position)
  VALUES (
    template_id_var,
    6,
    'Planejamento',
    'Planejamento, recursos e critérios de sucesso',
    '#E879F9',
    'Ajude a criar um plano de execução realista, estimar recursos e orçamento. Auxilie na identificação de riscos e definição de critérios de sucesso mensuráveis.',
    5
  ) RETURNING id INTO stage6_id;

  -- Associar cards à Stage 1 (6 cards)
  INSERT INTO template_cards (template_stage_id, card_definition_id, position)
  SELECT stage1_id, id, ROW_NUMBER() OVER ()
  FROM card_definitions
  WHERE name IN ('Ideia', 'Pitch', 'Problema', 'Solução', 'Público-alvo', 'KPIs Iniciais');

  -- Associar cards à Stage 2 (4 cards)
  INSERT INTO template_cards (template_stage_id, card_definition_id, position)
  SELECT stage2_id, id, ROW_NUMBER() OVER ()
  FROM card_definitions
  WHERE name IN ('Hipóteses de Validação', 'Persona Principal', 'Proposta de Valor', 'Benchmarking');

  -- Associar cards à Stage 3 (6 cards)
  INSERT INTO template_cards (template_stage_id, card_definition_id, position)
  SELECT stage3_id, id, ROW_NUMBER() OVER ()
  FROM card_definitions
  WHERE name IN ('Definição do MVP', 'Features Essenciais', 'User Stories', 'Critérios de Aceitação', 'Roadmap', 'Restrições de Escopo');

  -- Associar cards à Stage 4 (5 cards)
  INSERT INTO template_cards (template_stage_id, card_definition_id, position)
  SELECT stage4_id, id, ROW_NUMBER() OVER ()
  FROM card_definitions
  WHERE name IN ('Fluxos de Usuário', 'Wireframes', 'Design System', 'Componentes', 'Acessibilidade');

  -- Associar cards à Stage 5 (6 cards)
  INSERT INTO template_cards (template_stage_id, card_definition_id, position)
  SELECT stage5_id, id, ROW_NUMBER() OVER ()
  FROM card_definitions
  WHERE name IN ('Stack Tecnológica', 'Arquitetura', 'Banco de Dados', 'Design de APIs', 'Infraestrutura', 'Segurança');

  -- Associar cards à Stage 6 (8 cards)
  INSERT INTO template_cards (template_stage_id, card_definition_id, position)
  SELECT stage6_id, id, ROW_NUMBER() OVER ()
  FROM card_definitions
  WHERE name IN ('Planejamento de Sprints', 'Cronograma', 'Recursos', 'Orçamento', 'Marcos', 'Critérios de Sucesso', 'Gestão de Riscos', 'Plano de Lançamento');

END $$;

-- ============================================
-- 8. VERIFICAÇÃO
-- ============================================

-- Verificar card definitions criados
SELECT COUNT(*) as total_card_definitions FROM card_definitions;
-- Deve retornar: 35 cards

-- Verificar template criado
SELECT * FROM templates WHERE name = 'PIStack Completo';

-- Verificar stages do template
SELECT ts.stage_number, ts.stage_name, COUNT(tc.id) as cards_count
FROM template_stages ts
LEFT JOIN template_cards tc ON tc.template_stage_id = ts.id
WHERE ts.template_id = (SELECT id FROM templates WHERE name = 'PIStack Completo')
GROUP BY ts.stage_number, ts.stage_name
ORDER BY ts.stage_number;
-- Deve retornar:
-- 1 | Ideia Base     | 6
-- 2 | Entendimento   | 4
-- 3 | Escopo         | 6
-- 4 | Design & UX    | 5
-- 5 | Arquitetura    | 6
-- 6 | Planejamento   | 8

-- ============================================
-- ⚠️ IMPORTANT NEXT STEPS
-- ============================================
--
-- 1. Substituir emails de admin na função is_admin() (linha ~165)
-- 2. Verificar as contagens acima (35 cards, 6 stages)
-- 3. Atualizar projetos existentes para referenciar o template ativo
-- 4. Atualizar cards existentes para referenciar card_definitions
--
-- Próximo arquivo: pistack-app/lib/auth/admin.ts
-- ============================================
