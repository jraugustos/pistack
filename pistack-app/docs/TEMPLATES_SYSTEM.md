# PIStack Templates System - Complete Documentation

## Overview

The PIStack Templates System replaces hardcoded cards with a flexible, database-driven approach. This allows admins to:
- Create custom card definitions with AI or manually
- Build reusable project templates
- Organize cards into stages
- Enable dynamic card rendering

## Architecture

```
Templates System
├── Card Definitions (card_definitions)
│   ├── Name, Icon, Category
│   ├── Fields (JSONB schema)
│   └── System vs Custom
│
├── Templates (templates)
│   ├── Template metadata
│   └── Stages (template_stages)
│       └── Cards (template_cards) → References card_definitions
│
└── Projects (projects)
    ├── template_id → References templates
    └── Cards (cards)
        └── card_definition_id → References card_definitions
```

## Database Schema

### Tables

**card_definitions**: Global repository of card types
- `id` (UUID): Primary key
- `name` (TEXT): Card name (e.g., "Persona de Usuário")
- `description` (TEXT): Optional description
- `category` (ENUM): ideation, research, planning, design, development, marketing
- `icon` (TEXT): Lucide icon name
- `fields` (JSONB): Array of field definitions
- `is_system` (BOOLEAN): System card vs user-created
- `created_by` (UUID): Admin who created it

**templates**: Project templates
- `id` (UUID): Primary key
- `name` (TEXT): Template name
- `description` (TEXT): Optional description
- `category` (TEXT): Optional category
- `icon` (TEXT): Optional icon
- `is_active` (BOOLEAN): Whether template is available
- `is_system` (BOOLEAN): System template vs user-created

**template_stages**: Stages within templates
- `id` (UUID): Primary key
- `template_id` (UUID): Parent template
- `stage_number` (INT): Stage order (1-6)
- `stage_name` (TEXT): Stage name
- `stage_description` (TEXT): Optional description
- `stage_color` (TEXT): Hex color code
- `assistant_instructions` (TEXT): AI instructions
- `position` (INT): Order within template

**template_cards**: M:N relationship between stages and card definitions
- `id` (UUID): Primary key
- `template_stage_id` (UUID): Parent stage
- `card_definition_id` (UUID): Referenced card definition
- `position` (INT): Order within stage

### Modified Existing Tables

**projects**:
- Added: `template_id` (UUID): Template used for this project

**cards**:
- Added: `card_definition_id` (UUID): Card definition reference
- Existing: `card_type` (TEXT): Deprecated, kept for backward compatibility

## Field Types

Cards can have 8 different field types:

| Type | Description | Example Use Case |
|------|-------------|------------------|
| `text` | Short text input | Name, Title |
| `textarea` | Long text input | Description, Notes |
| `number` | Numeric input | Age, Budget |
| `date` | Date picker | Deadline, Launch Date |
| `select` | Dropdown | Priority (High/Med/Low) |
| `checkbox` | Boolean | Completed, Active |
| `file` | File URL | Screenshot, Document |
| `url` | Web URL | Website, Reference Link |

### Field Schema Example

```json
{
  "name": "Nome da Persona",
  "type": "text",
  "placeholder": "Ex: João Silva",
  "required": true
}
```

For `select` fields:
```json
{
  "name": "Prioridade",
  "type": "select",
  "options": ["Alta", "Média", "Baixa"],
  "required": true
}
```

## Implementation Phases

### ✅ PHASE 1: Database Schema (COMPLETED)
- Created 4 new tables
- Added 35 system card definitions
- Created "PIStack Completo" template
- Set up RLS policies

**Files**: `docs/templates-migration.sql`

### ✅ PHASE 2: Admin Middleware (COMPLETED)
- Admin authentication with email whitelist
- Route protection for `/admin/*`
- `isAdmin()`, `requireAdmin()` helpers

**Files**:
- `lib/auth/admin.ts`
- `app/(admin)/layout.tsx`

### ✅ PHASE 3: Card Definitions API (COMPLETED)
- GET/POST `/api/admin/card-definitions`
- GET/PATCH/DELETE `/api/admin/card-definitions/[id]`
- Full validation of fields

**Files**:
- `app/api/admin/card-definitions/route.ts`
- `app/api/admin/card-definitions/[id]/route.ts`

### ✅ PHASE 4: Templates Page (COMPLETED)
- Templates list at `/admin/templates`
- Grid layout with template cards
- Loading/error/empty states

**Files**:
- `app/(admin)/admin/templates/page.tsx`
- `components/admin/templates/template-card.tsx`

### ✅ PHASE 5: Template Editor (COMPLETED)
- Full editor at `/admin/templates/editor/[[...id]]`
- Stages sidebar with drag & drop
- Card library modal with search/filter
- Stage configuration panel

**Files**:
- `app/(admin)/admin/templates/editor/[[...id]]/page.tsx`
- `components/admin/templates/editor/stage-item.tsx`
- `components/admin/templates/editor/stages-sidebar.tsx`
- `components/admin/templates/editor/stage-config-panel.tsx`
- `components/admin/templates/card-library-modal.tsx`
- `app/api/admin/templates/[id]/route.ts`

### ✅ PHASE 6: Card Creator (COMPLETED)
- Two modes: AI-powered and Manual
- AI generation via OpenAI GPT-4o-mini
- Field builder for manual mode
- Real-time preview

**Files**:
- `app/(admin)/admin/cards/new/page.tsx`
- `components/admin/cards/add-field-modal.tsx`
- `components/admin/cards/card-preview.tsx`
- `app/api/admin/card-definitions/generate/route.ts`

### ✅ PHASE 7: Dynamic Card Rendering (COMPLETED)
- `DynamicCard` component
- 8 field type renderers
- Integrated into `stage-section.tsx`
- Backward compatibility with hardcoded cards

**Files**:
- `components/canvas/cards/dynamic/dynamic-card.tsx`
- `components/canvas/cards/dynamic/field-renderers.tsx`
- Updated: `components/canvas/stage-section.tsx`
- Updated: `app/api/cards/route.ts`

### ✅ PHASE 8: Migration Script (COMPLETED)
- SQL script to migrate existing projects
- Documentation for manual migration
- Verification queries

**Files**:
- `docs/migrate-existing-projects.sql`
- `docs/migrate-to-templates.md`

## Usage Guide

### For Admins

#### Creating a Custom Card

1. Navigate to `/admin/cards/new`
2. Choose creation mode:
   - **AI Mode**: Describe what the card should do, select category and icon
   - **Manual Mode**: Enter name, description, category, icon, then add fields
3. Preview the card
4. Save

#### Creating a Template

1. Navigate to `/admin/templates`
2. Click "Criar Template"
3. Add stages (click "Adicionar Etapa")
4. For each stage:
   - Set name, description, color
   - Add AI instructions
   - Click "Adicionar Cards" to select cards from library
5. Save template

#### Managing Card Definitions

- **View All**: GET `/api/admin/card-definitions`
- **Filter by Category**: GET `/api/admin/card-definitions?category=research`
- **Edit**: Click card in library → Edit
- **Delete**: Only if not used in any template

### For Developers

#### Using DynamicCard

```tsx
import { DynamicCard } from '@/components/canvas/cards/dynamic'

<DynamicCard
  cardId="card-uuid"
  definition={cardDefinition}
  content={{ fieldName: value }}
  stageColor="#7AA2FF"
  onAiClick={() => {}}
  onSave={async (data) => {}}
/>
```

#### Creating Custom Field Renderer

```tsx
// components/canvas/cards/dynamic/field-renderers.tsx

export function CustomField({
  field,
  value,
  onChange,
  stageColor,
}: FieldRendererProps) {
  return (
    <div className="mb-3">
      <label className="text-xs text-[#E6E9F2]/60 mb-1 block">
        {field.name}
      </label>
      {/* Your custom field UI */}
    </div>
  )
}
```

Then add to `DynamicCard`:
```tsx
case 'custom':
  return <CustomField key={field.name} {...commonProps} />
```

## API Reference

### Card Definitions

**GET** `/api/admin/card-definitions`
- Query params: `?category=ideation`
- Returns: `{ definitions: CardDefinition[] }`

**POST** `/api/admin/card-definitions`
- Body: `{ name, description, category, icon, fields }`
- Returns: `{ definition: CardDefinition }`
- Auth: Admin only

**GET** `/api/admin/card-definitions/[id]`
- Returns: `{ definition: CardDefinition }`

**PATCH** `/api/admin/card-definitions/[id]`
- Body: Partial card definition
- Returns: `{ definition: CardDefinition }`
- Auth: Admin only

**DELETE** `/api/admin/card-definitions/[id]`
- Returns: `{ success: true }`
- Auth: Admin only
- Fails if card is used in any template

**POST** `/api/admin/card-definitions/generate` (AI)
- Body: `{ description, category, icon }`
- Returns: `{ card: { name, fields, suggestion } }`
- Uses: OpenAI GPT-4o-mini
- Auth: Admin only

### Templates

**GET** `/api/admin/templates`
- Returns: `{ templates: Template[] }` with nested stages/cards

**POST** `/api/admin/templates`
- Body: `{ name, description, category, icon, stages[] }`
- Returns: `{ template: Template }`
- Auth: Admin only

**GET** `/api/admin/templates/[id]`
- Returns: `{ template: Template }` with nested stages/cards
- Public: Yes (for template selection)

**PATCH** `/api/admin/templates/[id]`
- Body: Partial template with stages
- Strategy: Delete all stages, recreate (transaction-like)
- Returns: `{ template: Template }`
- Auth: Admin only

**DELETE** `/api/admin/templates/[id]`
- Returns: `{ success: true }`
- Protection: Cannot delete active or in-use templates
- Auth: Admin only

### Cards (Modified)

**GET** `/api/cards?stageId=xxx`
- Returns: `{ cards: Card[] }` with `definition` joined
- Now includes: `card_definition_id` and `definition` object

## Security

### RLS Policies

**card_definitions**:
- READ: Public (anyone can view)
- WRITE: Admin only (`is_admin()` function)

**templates**, **template_stages**, **template_cards**:
- READ: Public (for template selection)
- WRITE: Admin only

**cards**:
- READ/WRITE: User owns the project

### Admin Access

Admins are defined in `.env.local`:
```bash
ADMIN_EMAILS=admin@example.com,admin2@example.com
```

Check via Clerk authentication and email matching.

## Migration Checklist

Before migrating to templates:

- [ ] Backup database
- [ ] Run `templates-migration.sql` in Supabase
- [ ] Verify 35 card definitions exist
- [ ] Verify "PIStack Completo" template exists
- [ ] Get template ID from database
- [ ] Update `migrate-existing-projects.sql` with template ID
- [ ] Run migration script
- [ ] Verify all cards have `card_definition_id`
- [ ] Test existing projects still render
- [ ] Test creating new cards
- [ ] Test AI assistant

After migration:

- [ ] Cards render with DynamicCard
- [ ] All field types work correctly
- [ ] Autosave works (2s debounce)
- [ ] Edit/Delete buttons work
- [ ] AI assistant works
- [ ] Can create custom cards
- [ ] Can create custom templates

## Troubleshooting

### Cards Not Rendering
- Check `card_definition_id` is set in database
- Check definition exists in `card_definitions`
- Check browser console for errors
- Verify `definition` is returned by API

### Migration Fails
- Verify template ID is correct UUID
- Check `templates-migration.sql` ran successfully
- Ensure no foreign key conflicts
- Check Supabase logs

### AI Generation Fails
- Verify `OPENAI_API_KEY` in `.env.local`
- Check API credits/quotas
- Review OpenAI API logs
- Check request format in Network tab

### Permission Denied
- Verify email in `ADMIN_EMAILS`
- Check Clerk authentication
- Clear browser cache
- Re-login to application

## Performance Considerations

1. **Card Definitions**: Cached at application level
2. **Templates**: Public READ, minimal queries
3. **Field Rendering**: Optimized with React hooks
4. **Autosave**: 2s debounce prevents excessive API calls

## Future Enhancements

- [ ] Template marketplace
- [ ] Card definition templates
- [ ] Bulk card operations
- [ ] Template versioning
- [ ] Template cloning
- [ ] Card field validation rules
- [ ] Conditional field visibility
- [ ] Field dependencies
- [ ] Custom field types
- [ ] Template analytics

## Support & Contribution

- **Documentation**: `/docs/*`
- **Examples**: See existing templates
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

## License

Same as PIStack main project
