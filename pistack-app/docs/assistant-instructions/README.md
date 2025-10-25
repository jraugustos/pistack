# Assistant Instructions - Overview

This directory contains comprehensive instructions for the AI assistant that generates card definitions in PIStack.

## Files

### 1. [card-generation-assistant.md](./card-generation-assistant.md)
**Main system instructions** - Read this first!

Contains:
- Role and purpose
- Input/output formats
- Field types reference (8 types)
- Decision rules and naming conventions
- Common mistakes to avoid
- Quality checklist

**Use this as**: Primary reference for the OpenAI assistant

### 2. [examples-by-category.md](./examples-by-category.md)
**Comprehensive examples** - Learn by example!

Contains:
- 2+ examples per category (ideation, research, planning, design, development, marketing)
- Real-world scenarios with full JSON outputs
- Advanced patterns (multi-select alternatives, conditional fields, file uploads)
- Pattern recognition for similar requests

**Use this as**: Training data and pattern matching reference

## Quick Reference

### Field Types

| Type | Use Case | Example |
|------|----------|---------|
| `text` | Short text | Names, titles |
| `textarea` | Long text | Descriptions, notes |
| `number` | Numeric values | Age, budget, quantity |
| `date` | Dates | Deadlines, launch dates |
| `select` | Predefined options | Priority, status |
| `checkbox` | Boolean | Completed, validated |
| `file` | File URLs | Documents, images |
| `url` | Web links | Websites, references |

### Categories

1. **ideation** - Creative exploration, brainstorming
2. **research** - Data collection, user insights
3. **planning** - Roadmaps, schedules, priorities
4. **design** - Wireframes, design systems, UI/UX
5. **development** - Technical specs, architecture, APIs
6. **marketing** - Campaigns, content, metrics

## Integration with OpenAI

### System Prompt

When calling OpenAI GPT-4o-mini, use this system prompt:

```
You are a helpful assistant that generates structured card definitions in JSON format for a project management tool called PIStack.

Follow the instructions in the card-generation-assistant.md file exactly.

Key rules:
- Return ONLY valid JSON (no markdown, no code blocks)
- Use Portuguese for field names and placeholders
- Include 3-8 fields maximum
- Provide helpful placeholders with examples
- Write a brief suggestion explaining your choices

Always validate your response against the quality checklist before returning.
```

### User Prompt Template

```
Description: {user_description}
Category: {category}
Icon: {icon}

Generate a card definition following the instructions.
```

### Example API Call

```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    {
      role: 'system',
      content: `You are a helpful assistant that generates structured card definitions in JSON format. Always return valid JSON without markdown formatting.

Follow these rules:
- Use Portuguese for all field names and placeholders
- Include 3-8 fields (sweet spot: 4-6)
- Choose appropriate field types from: text, textarea, number, date, select, checkbox, file, url
- Mark 1-3 fields as required (only essentials)
- Provide helpful placeholders with "Ex:" prefix
- Write 1-2 sentence suggestion explaining your choices

Return format:
{
  "name": "Card Name",
  "fields": [...],
  "suggestion": "Brief explanation"
}
`
    },
    {
      role: 'user',
      content: `Description: ${description}\nCategory: ${category}\nIcon: ${icon}\n\nGenerate a card definition.`
    }
  ],
  temperature: 0.7,
  max_tokens: 1000
})
```

## Testing the Assistant

### Test Cases

Run these test cases to validate the assistant:

#### Test 1: Simple Request
```json
{
  "description": "Track competitor products",
  "category": "research",
  "icon": "trending-up"
}
```

**Expected**: 4-6 fields including name, description, strengths/weaknesses

#### Test 2: Complex Request
```json
{
  "description": "Document user stories with acceptance criteria, story points, priority, and dependencies",
  "category": "planning",
  "icon": "book-open"
}
```

**Expected**: ~6 fields with select for priority, number for story points, textarea for criteria

#### Test 3: Ambiguous Request
```json
{
  "description": "Need something to track stuff",
  "category": "ideation",
  "icon": "lightbulb"
}
```

**Expected**: Generic card with 3-4 flexible fields, suggestion explains assumptions

#### Test 4: Edge Case - Too Many Fields
```json
{
  "description": "Track everything about a customer: name, email, phone, address, city, state, country, zip, company, role, linkedin, twitter, facebook, notes, tags, source, date contacted, status",
  "category": "research",
  "icon": "user"
}
```

**Expected**: Card with 6-7 most important fields, suggestion mentions additional cards might be needed

## Validation Checklist

After generating a card, verify:

- [ ] Valid JSON (use JSON.parse to test)
- [ ] No markdown formatting (no \`\`\`json blocks)
- [ ] Field count: 3-8 fields
- [ ] All field types are valid
- [ ] Select fields have 2-10 options
- [ ] Required fields: 1-3 only
- [ ] Portuguese naming
- [ ] Helpful placeholders
- [ ] Suggestion is present and informative
- [ ] No duplicate field names

## Common Issues & Solutions

### Issue: Response includes markdown

**Problem**:
```
```json
{
  "name": "Card"
}
```
```

**Solution**: Update system prompt to emphasize "Return ONLY the JSON object, no markdown"

### Issue: Too many required fields

**Problem**: All 8 fields marked as required

**Solution**: Review decision rules - only 1-3 essentials should be required

### Issue: Vague field names

**Problem**: Field named "Data" instead of "Data de Nascimento"

**Solution**: Emphasize specificity in naming conventions

### Issue: Select with 20+ options

**Problem**: Select field with entire country list

**Solution**: Either use text field or limit to 8-10 most common options

## Performance Tips

1. **Cache instructions**: Load assistant instructions once, reuse across requests
2. **Validate early**: Check JSON validity before saving to database
3. **Retry logic**: If response has markdown, strip and retry once
4. **Fallback**: If AI fails, provide simple default card structure
5. **Monitor**: Log failed generations for pattern analysis

## Updating Instructions

When updating these instructions:

1. Test with 10+ diverse examples
2. Update examples in both files
3. Update API implementation if needed
4. Document breaking changes
5. Version the instructions (add date to filename if major update)

## Support

For questions or improvements:
- Check existing examples first
- Review quality checklist
- Test with similar category examples
- Update documentation with new patterns

---

**Version**: 1.0
**Last Updated**: 2025-01-XX
**Compatibility**: OpenAI GPT-4o-mini, GPT-4, GPT-3.5-turbo
