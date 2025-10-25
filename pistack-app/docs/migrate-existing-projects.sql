/**
 * PHASE 8: Migration Script - Existing Projects to Template System
 *
 * This script migrates existing PIStack projects from hardcoded cards
 * to the new template-based system.
 *
 * IMPORTANT: Run this AFTER templates-migration.sql
 *
 * What this does:
 * 1. Associates all existing projects with "PIStack Completo" template
 * 2. Maps existing card_type strings to card_definition_id
 * 3. Enables dynamic card rendering
 *
 * Before running:
 * 1. Backup your database
 * 2. Run templates-migration.sql first
 * 3. Verify 35 card definitions exist
 * 4. Replace <TEMPLATE_ID> below with actual template ID
 */

-- ============================================
-- STEP 1: Get Template ID (RUN THIS FIRST)
-- ============================================

-- Find the PIStack Completo template ID
SELECT id, name, is_active
FROM templates
WHERE name = 'PIStack Completo';

-- Copy the ID and replace <TEMPLATE_ID> below

-- ============================================
-- STEP 2: Run Migration
-- ============================================

DO $$
DECLARE
  template_id_var UUID := '<TEMPLATE_ID>'; -- REPLACE WITH ACTUAL TEMPLATE ID
  card_mapping JSONB;
  updated_projects INTEGER;
  updated_cards INTEGER;
  unmapped_cards INTEGER;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Starting migration to template system...';
  RAISE NOTICE '========================================';

  -- Define mapping from card_type to card definition names
  card_mapping := '{
    "project-name": "Ideia",
    "pitch": "Pitch",
    "problem": "Problema",
    "solution": "Solução",
    "target-audience": "Público-alvo",
    "initial-kpis": "KPIs Iniciais",
    "validation-hypotheses": "Hipóteses de Validação",
    "primary-persona": "Persona Principal",
    "value-proposition": "Proposta de Valor",
    "benchmarking": "Benchmarking",
    "mvp-definition": "Definição do MVP",
    "essential-features": "Features Essenciais",
    "user-stories": "User Stories",
    "acceptance-criteria": "Critérios de Aceitação",
    "roadmap": "Roadmap",
    "scope-constraints": "Restrições de Escopo",
    "user-flows": "Fluxos de Usuário",
    "wireframes": "Wireframes",
    "design-system": "Design System",
    "components": "Componentes",
    "accessibility": "Acessibilidade",
    "tech-stack": "Stack Tecnológica",
    "architecture": "Arquitetura",
    "database": "Banco de Dados",
    "api-design": "Design de APIs",
    "infrastructure": "Infraestrutura",
    "security": "Segurança",
    "sprint-planning": "Planejamento de Sprints",
    "timeline": "Cronograma",
    "resources": "Recursos",
    "budget": "Orçamento",
    "milestones": "Marcos",
    "success-criteria": "Critérios de Sucesso",
    "risk-management": "Gestão de Riscos",
    "launch-plan": "Plano de Lançamento"
  }'::jsonb;

  RAISE NOTICE '';
  RAISE NOTICE 'Template ID: %', template_id_var;
  RAISE NOTICE '';

  -- ============================================
  -- STEP 1: Associate projects with template
  -- ============================================
  RAISE NOTICE 'Step 1: Associating projects with template...';

  UPDATE projects
  SET template_id = template_id_var
  WHERE template_id IS NULL;

  GET DIAGNOSTICS updated_projects = ROW_COUNT;
  RAISE NOTICE '✓ Associated % projects with template', updated_projects;

  -- ============================================
  -- STEP 2: Update cards with card_definition_id
  -- ============================================
  RAISE NOTICE '';
  RAISE NOTICE 'Step 2: Mapping cards to card definitions...';

  UPDATE cards c
  SET card_definition_id = (
    SELECT cd.id
    FROM card_definitions cd
    WHERE cd.name = (card_mapping->>c.card_type)
    AND cd.is_system = true
    LIMIT 1
  )
  WHERE c.card_definition_id IS NULL
  AND card_mapping ? c.card_type;

  GET DIAGNOSTICS updated_cards = ROW_COUNT;
  RAISE NOTICE '✓ Updated % cards with card_definition_id', updated_cards;

  -- ============================================
  -- STEP 3: Report unmapped cards
  -- ============================================
  RAISE NOTICE '';
  RAISE NOTICE 'Step 3: Checking for unmapped cards...';

  SELECT COUNT(*) INTO unmapped_cards
  FROM cards
  WHERE card_definition_id IS NULL;

  IF unmapped_cards > 0 THEN
    RAISE WARNING '⚠ Found % unmapped cards', unmapped_cards;
    RAISE WARNING 'Unmapped card types: %', (
      SELECT string_agg(DISTINCT card_type, ', ')
      FROM cards
      WHERE card_definition_id IS NULL
    );
  ELSE
    RAISE NOTICE '✓ All cards mapped successfully!';
  END IF;

  -- ============================================
  -- MIGRATION SUMMARY
  -- ============================================
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration Summary:';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Projects migrated: %', updated_projects;
  RAISE NOTICE 'Cards updated: %', updated_cards;
  RAISE NOTICE 'Unmapped cards: %', unmapped_cards;
  RAISE NOTICE '';

  IF unmapped_cards = 0 AND updated_cards > 0 THEN
    RAISE NOTICE '✓ Migration completed successfully!';
  ELSIF unmapped_cards > 0 THEN
    RAISE WARNING '⚠ Migration completed with warnings (see unmapped cards above)';
  ELSE
    RAISE NOTICE 'ℹ No cards to migrate (already migrated or no cards exist)';
  END IF;

  RAISE NOTICE '========================================';
END $$;

-- ============================================
-- STEP 3: Verification Queries
-- ============================================

-- Check migration results
SELECT
  'Total projects' as metric,
  COUNT(*) as count
FROM projects
UNION ALL
SELECT
  'Projects with template',
  COUNT(*)
FROM projects
WHERE template_id IS NOT NULL
UNION ALL
SELECT
  'Total cards',
  COUNT(*)
FROM cards
UNION ALL
SELECT
  'Cards with definition',
  COUNT(*)
FROM cards
WHERE card_definition_id IS NOT NULL;

-- Check card distribution
SELECT
  cd.category,
  cd.name as card_definition,
  COUNT(c.id) as card_count
FROM card_definitions cd
LEFT JOIN cards c ON c.card_definition_id = cd.id
WHERE cd.is_system = true
GROUP BY cd.category, cd.name
ORDER BY cd.category, cd.name;

-- Find any remaining unmapped cards
SELECT
  card_type,
  COUNT(*) as count
FROM cards
WHERE card_definition_id IS NULL
GROUP BY card_type;
