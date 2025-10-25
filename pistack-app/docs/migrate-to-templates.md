# Migration Guide: Hardcoded Cards → Template System

This guide helps you migrate existing projects from hardcoded cards to the new template-based system.

## Overview

**PHASE 8**: This migration updates all existing projects to use the template system by:
1. Associating projects with the default "PIStack Completo" template
2. Mapping existing cards to card_definitions
3. Updating card_definition_id for all existing cards

## Prerequisites

- You must have already run `templates-migration.sql` in Supabase
- All 35 card definitions should exist in the database
- The "PIStack Completo" template should be active

## Migration Steps

### Step 1: Verify Card Definitions Exist

Run this query to confirm all 35 card definitions are created:

```sql
SELECT COUNT(*) FROM card_definitions WHERE is_system = true;
-- Should return 35
```

### Step 2: Get Template ID

Find the ID of the "PIStack Completo" template:

```sql
SELECT id, name, is_active FROM templates WHERE name = 'PIStack Completo';
-- Copy the id for use in next steps
```

### Step 3: Run Migration Script

Replace `<TEMPLATE_ID>` with the ID from Step 2:

```sql
DO $$
DECLARE
  template_id_var UUID := '<TEMPLATE_ID>'; -- REPLACE THIS
  card_mapping JSONB;
BEGIN
  -- Map card_type strings to card definition names
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

  RAISE NOTICE 'Starting migration to template system...';

  -- Step 1: Associate all existing projects with template
  UPDATE projects
  SET template_id = template_id_var
  WHERE template_id IS NULL;

  RAISE NOTICE 'Associated % projects with template', (
    SELECT COUNT(*) FROM projects WHERE template_id = template_id_var
  );

  -- Step 2: Update cards with card_definition_id
  UPDATE cards c
  SET card_definition_id = (
    SELECT cd.id
    FROM card_definitions cd
    WHERE cd.name = (card_mapping->>c.card_type)
    LIMIT 1
  )
  WHERE c.card_definition_id IS NULL
  AND card_mapping ? c.card_type;

  RAISE NOTICE 'Updated % cards with card_definition_id', (
    SELECT COUNT(*) FROM cards WHERE card_definition_id IS NOT NULL
  );

  -- Step 3: Report unmapped cards (if any)
  RAISE NOTICE 'Cards without mapping: %', (
    SELECT COUNT(*) FROM cards WHERE card_definition_id IS NULL
  );

  -- Show unmapped card types
  RAISE NOTICE 'Unmapped card types: %', (
    SELECT string_agg(DISTINCT card_type, ', ')
    FROM cards
    WHERE card_definition_id IS NULL
  );

  RAISE NOTICE 'Migration complete!';
END $$;
```

### Step 4: Verify Migration

Check that all cards now have card_definition_id:

```sql
-- Count cards with definitions
SELECT
  COUNT(*) as total_cards,
  COUNT(card_definition_id) as cards_with_definition
FROM cards;

-- Should be equal

-- Check distribution by card type
SELECT
  c.card_type,
  cd.name as definition_name,
  COUNT(*) as count
FROM cards c
LEFT JOIN card_definitions cd ON c.card_definition_id = cd.id
GROUP BY c.card_type, cd.name
ORDER BY c.card_type;
```

### Step 5: Test Dynamic Rendering

1. Reload your PIStack application
2. Open an existing project
3. Verify cards render correctly with DynamicCard component
4. Test editing and saving card data
5. Verify AI assistant still works

## Rollback

If you need to rollback the migration:

```sql
-- Remove template associations
UPDATE projects SET template_id = NULL;

-- Remove card_definition_id from cards
UPDATE cards SET card_definition_id = NULL;
```

## Post-Migration

After successful migration:

1. **Deprecate Hardcoded Cards**: Hardcoded card components in `/components/canvas/cards/etapa-*` can be removed
2. **Update Add Card Menu**: Modify stage-section.tsx to show cards from template instead of hardcoded list
3. **Test AI Generation**: Verify AI card generation works with new system
4. **Create New Templates**: Admins can now create custom templates via `/admin/templates`

## Troubleshooting

### Cards Not Rendering

**Symptom**: Cards appear blank or don't show

**Solution**:
1. Check browser console for errors
2. Verify card_definition_id exists in database
3. Ensure card_definitions table has the definition
4. Check that fields array is properly formatted JSON

### Migration Failed

**Symptom**: SQL script returns errors

**Solution**:
1. Verify you replaced `<TEMPLATE_ID>` with actual UUID
2. Check that templates-migration.sql was run first
3. Ensure no foreign key conflicts
4. Check Supabase logs for detailed error messages

### Cards Missing After Migration

**Symptom**: Some cards disappeared

**Solution**:
1. Check for unmapped card types in migration output
2. Add missing card types to card_mapping in migration script
3. Create missing card_definitions manually
4. Re-run migration

## Support

For issues or questions:
1. Check `/docs/templates-migration.sql` for schema reference
2. Review PHASE 7 implementation in `/components/canvas/cards/dynamic/`
3. Check git history for implementation details
4. Open issue on GitHub if needed

## Next Steps

After migration is complete:
1. ✅ Create custom card definitions via `/admin/cards/new`
2. ✅ Create custom templates via `/admin/templates`
3. ✅ Use AI to generate card structures
4. ✅ Delete hardcoded card components (optional)
5. ✅ Test template cloning for new projects
