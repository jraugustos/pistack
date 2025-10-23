# Checklist de Atualização de Cards - PIStack

Este documento descreve todos os passos necessários ao criar ou atualizar um card no PIStack, desde a implementação no código até a atualização das instruções dos assistants na OpenAI.

---

## 📋 Visão Geral

Quando você criar ou modificar um card, siga este checklist completo para garantir que tudo funcione corretamente em todos os componentes do sistema.

---

## 🔧 1. Implementação do Card Component

### 1.1 Criar/Atualizar o Arquivo do Card

**Localização:** `pistack-app/components/canvas/cards/etapa-{N}/{card-name}-card.tsx`

**Estrutura necessária:**

```typescript
'use client'

import { useState, useEffect, useMemo } from 'react'
import { IconName, Plus, Trash2 } from 'lucide-react'
import { BaseCard } from '../base-card'
import { useAutosave } from '@/hooks/use-autosave'

// 1. Definir interfaces TypeScript
interface CardItem {
  field1?: string
  field2?: string
  nestedArray?: string[]
}

interface CardNameCardProps {
  cardId: string
  // Props do card (devem coincidir com o schema)
  field1?: string
  field2?: CardItem[]
  onAiClick?: () => void
  onSave?: (content: { field1: string; field2: CardItem[] }) => Promise<void>
}

// 2. Função de normalização
function normalizeContent(input: any) {
  if (!input) return { field1: '', field2: [] }

  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input)
      return normalizeContent(parsed)
    } catch {
      return { field1: '', field2: [] }
    }
  }

  return {
    field1: input.field1 || '',
    field2: Array.isArray(input.field2) ? input.field2 : []
  }
}

// 3. Componente principal
export function CardNameCard({
  cardId,
  field1 = '',
  field2 = [],
  onAiClick,
  onSave,
}: CardNameCardProps) {
  const [local, setLocal] = useState(normalizeContent({ field1, field2 }))

  useEffect(() => {
    setLocal(normalizeContent({ field1, field2 }))
  }, [field1, field2])

  // 4. useAutosave com signature correta
  useAutosave(local, {
    delay: 1500,
    onSave: async (data) => {
      if (onSave) {
        const clean = {
          field1: data.field1?.trim() || '',
          field2: data.field2.map((item: CardItem) => ({
            field1: item.field1?.trim() || '',
            field2: item.field2?.trim() || '',
            nestedArray: (item.nestedArray || []).map((s: string) => s.trim()).filter(Boolean)
          })).filter((item: CardItem) => item.field1)
        }
        await onSave(clean)
      }
    }
  })

  // 5. Handlers para manipular estado
  const addItem = () => {
    setLocal(prev => ({ ...prev, field2: [...prev.field2, { field1: '', field2: '', nestedArray: [] }] }))
  }

  const removeItem = (idx: number) => {
    setLocal(prev => ({ ...prev, field2: prev.field2.filter((_, i) => i !== idx) }))
  }

  const updateItem = (idx: number, patch: Partial<CardItem>) => {
    setLocal(prev => ({
      ...prev,
      field2: prev.field2.map((item, i) => i === idx ? { ...item, ...patch } : item)
    }))
  }

  // 6. Render com BaseCard
  return (
    <BaseCard
      cardId={cardId}
      cardTitle="Nome do Card"
      icon={IconName}
      stageColor="#COR_DA_ETAPA"
      onAiClick={onAiClick}
    >
      {/* Inputs e UI do card */}
    </BaseCard>
  )
}
```

**✅ Checklist de Implementação:**
- [ ] Interfaces TypeScript definidas corretamente
- [ ] Função de normalização implementada
- [ ] useState e useEffect configurados
- [ ] useAutosave com signature de objeto: `{ onSave, delay }`
- [ ] Handlers para add/remove/update implementados
- [ ] Nested arrays (se houver) com handlers próprios
- [ ] BaseCard com `cardTitle` (não `title`)
- [ ] Cor da etapa correta (`stageColor`)
- [ ] Ícone apropriado do lucide-react

---

## 🗄️ 2. Normalização de Arrays

### 2.1 Adicionar ao array-normalizers.ts

**Localização:** `pistack-app/lib/array-normalizers.ts`

**Adicionar case no switch:**

```typescript
case 'card-name':
  // Arrays simples
  data.simpleArray = toArrayOfStrings(data.simpleArray)

  // Arrays de objetos com nested arrays
  if (Array.isArray(data.complexArray)) {
    data.complexArray = data.complexArray.map((item: any) => ({
      ...item,
      nestedArray: Array.isArray(item?.nestedArray)
        ? item.nestedArray.map((n: any) =>
            typeof n === 'string' ? { name: n, value: '' } : n
          )
        : []
    }))
  }
  break
```

**✅ Checklist de Normalização:**
- [ ] Case adicionado ao switch com nome correto do card
- [ ] Arrays simples normalizados com `toArrayOfStrings()`
- [ ] Arrays de objetos com estrutura de transformação
- [ ] Nested arrays tratados corretamente
- [ ] Valores default para campos opcionais

---

## 🧪 3. Fixtures de Teste

### 3.1 Atualizar arrays.json

**Localização:** `pistack-app/scripts/fixtures/arrays.json`

**Adicionar entrada:**

```json
"card-name": {
  "simpleArray": "- Item 1\n- Item 2\n- Item 3",
  "complexArray": [
    {
      "field1": "Valor",
      "nestedArray": ["Sub 1", "Sub 2"]
    }
  ]
}
```

### 3.2 Atualizar cards-post.json

**Localização:** `pistack-app/scripts/fixtures/cards-post.json`

**Adicionar exemplo completo:**

```json
"card-name": {
  "content": {
    "field1": "Valor de exemplo",
    "field2": "Descrição detalhada",
    "complexArray": [
      {
        "name": "Item 1",
        "description": "Descrição do item",
        "nestedArray": ["Sub 1", "Sub 2"]
      }
    ]
  }
}
```

### 3.3 Atualizar test-post-cards.mjs

**Localização:** `pistack-app/scripts/test-post-cards.mjs`

**Adicionar ao array `cases`:**

```javascript
const cases = [
  // ... outros cards
  'card-name',
]
```

**Adicionar assertions específicas:**

```javascript
if (type === 'card-name') {
  assert(content.field1, 'field1 missing')
  assert(Array.isArray(content.complexArray), 'complexArray not array')
  assert(content.complexArray.length > 0, 'complexArray empty')
  assert(content.complexArray[0].name, 'complexArray[0].name missing')
}
```

### 3.4 Atualizar validate-arrays.mjs

**Localização:** `pistack-app/scripts/validate-arrays.mjs`

**Adicionar validação:**

```javascript
// card-name
const cardNameSimple = toArrayOfStrings(cardName.simpleArray)
const cardNameComplex = Array.isArray(cardName.complexArray) ? cardName.complexArray : []
results.push({ test: 'card-name.simpleArray array', pass: cardNameSimple.length >= 1 })
results.push({ test: 'card-name.complexArray array', pass: cardNameComplex.length >= 1 })
if (cardNameComplex[0]) {
  const nested = toArrayOfStrings(cardNameComplex[0].nestedArray)
  results.push({ test: 'card-name.complexArray[0].nestedArray', pass: nested.length >= 1 })
}
```

**✅ Checklist de Fixtures:**
- [ ] Entrada adicionada em arrays.json
- [ ] Exemplo completo em cards-post.json
- [ ] Nome do card adicionado ao array `cases` em test-post-cards.mjs
- [ ] Assertions específicas adicionadas em test-post-cards.mjs
- [ ] Validações adicionadas em validate-arrays.mjs
- [ ] Testes rodados com `npm run test:arrays` (27/27 passing)
- [ ] Testes rodados com `npm run test:cards-smoke` (20+/20+ passing)

---

## 📝 4. Documentação

### 4.1 Atualizar project-context.md

**Localização:** `docs/project-context.md`

**Atualizar tabela de status:**

```markdown
| Etapa X | **N+1/N+1** (100%) | **0/N+1** (0%) | **N+1** |
```

**Adicionar descrição do card (se necessário):**

```markdown
#### Card Name
- **Objetivo:** Descrição do propósito do card
- **Estrutura:** field1 (string), complexArray[] (objects com nested arrays)
- **Inline Editing:** ✅ Implementado
```

**✅ Checklist de Documentação:**
- [ ] Tabela de status atualizada com novo count
- [ ] Descrição do card adicionada (se necessário)
- [ ] Status de implementação marcado como ✅

---

## 🤖 5. Assistant Instructions

### 5.1 Identificar o Assistant Correto

**Mapeamento Etapa → Assistant:**
- Etapa 1 → `ideation.md`
- Etapa 2 → `discovery.md`
- Etapa 3 → `scope.md`
- Etapa 4 → `design.md`
- Etapa 5 → `tech.md`
- Etapa 6 → `planning.md`

### 5.2 Atualizar o Arquivo do Assistant

**Localização:** `docs/assistant-instructions/{nome}.md`

**Adicionar schema na seção "Schemas de referência":**

```markdown
card-name
{
  "field1": "Valor do campo",
  "field2": "Descrição",
  "complexArray": [
    {
      "name": "Nome do item",
      "description": "Descrição do item",
      "nestedArray": [
        "Sub-item 1",
        "Sub-item 2"
      ]
    }
  ]
}
```

**Adicionar exemplo correto:**

```markdown
Exemplo correto de card-name:
{
  "card_id": "[ID]",
  "content": {
    "field1": "Exemplo real",
    "field2": "Descrição detalhada do caso de uso",
    "complexArray": [
      {
        "name": "Item Exemplo",
        "description": "Como este item funciona na prática",
        "nestedArray": [
          "Detalhe específico 1",
          "Detalhe específico 2"
        ]
      }
    ]
  }
}
```

**Adicionar princípios (se aplicável):**

```markdown
Princípios de [Nome do Card]:
- Diretriz 1: Explicação
- Diretriz 2: Explicação
- Anti-padrão: ❌ O que evitar
```

**✅ Checklist do Assistant:**
- [ ] Schema adicionado com estrutura exata
- [ ] Tipos de dados corretos (string, array, object)
- [ ] Nested arrays documentados
- [ ] Exemplo correto com dados reais (não placeholders)
- [ ] Princípios/diretrizes adicionados (se aplicável)
- [ ] Anti-padrões documentados (se aplicável)

### 5.3 Atualizar orchestrator.md

**Localização:** `docs/assistant-instructions/orchestrator.md`

**Atualizar contagem de cards:**

```markdown
Etapa X - Nome (Cor #HEX) - N+1 cards
Cards: [lista atualizada com novo card]
Total: 35+1 cards distribuídos em 6 etapas sequenciais.
```

**Adicionar schema na seção "Schemas de Cards (Referência)":**

```markdown
Etapa X
card-name: complexArray (array de {name, description, nestedArray})
```

**Atualizar validações de qualidade:**

```markdown
✅ Etapa X está pronta quando:
✓ [Nova validação relacionada ao card]
```

**✅ Checklist do Orchestrator:**
- [ ] Contagem total de cards atualizada
- [ ] Card adicionado na lista da etapa correta
- [ ] Schema de referência adicionado
- [ ] Validação de qualidade atualizada (se aplicável)

---

## 🚀 6. Build e Testes

### 6.1 Testes TypeScript

```bash
cd pistack-app
npm run build
```

**✅ Verificar:**
- [ ] Build compila sem erros TypeScript
- [ ] Nenhum erro de props em BaseCard
- [ ] useAutosave com signature correta
- [ ] Tipos de arrays corretos

### 6.2 Testes de Arrays

```bash
cd pistack-app
npm run test:arrays
```

**✅ Verificar:**
- [ ] Todos os testes passando (27+/27+ tests)
- [ ] Normalização do novo card funcionando
- [ ] Arrays simples e complexos normalizados

### 6.3 Testes de POST

```bash
cd pistack-app
npm run test:cards-smoke
```

**✅ Verificar:**
- [ ] Todos os testes passando (20+/20+ tests)
- [ ] POST do novo card retorna 200/201
- [ ] Content está populado corretamente
- [ ] Assertions específicas passando

---

## 📤 7. Deploy para OpenAI

### 7.1 Copiar Instructions Atualizadas

**Para cada assistant modificado:**

1. Abrir o arquivo `.md` em `docs/assistant-instructions/`
2. Copiar o conteúdo completo
3. Acessar [OpenAI Platform](https://platform.openai.com/assistants)
4. Selecionar o assistant correspondente
5. Colar o conteúdo na seção "Instructions"
6. Salvar as alterações

**✅ Checklist de Deploy:**
- [ ] Assistant da etapa atualizado na OpenAI
- [ ] Orchestrator atualizado na OpenAI (se modificado)
- [ ] Schemas validados após paste
- [ ] Nenhum caractere especial corrompido

### 7.2 Testar na OpenAI

**Testes mínimos:**

1. **Criar card via IA:**
   ```
   "Crie um card de [nome] com dados de exemplo"
   ```
   - [ ] Card criado com estrutura correta
   - [ ] Arrays no formato JSON válido
   - [ ] Campos obrigatórios preenchidos

2. **Atualizar card existente:**
   ```
   "Adicione mais 2 itens ao complexArray"
   ```
   - [ ] Array expandido corretamente
   - [ ] Estrutura de objetos mantida
   - [ ] Nested arrays preservados

3. **Validar consistência:**
   ```
   "/validate"
   ```
   - [ ] Novo card incluído na validação
   - [ ] Consistência cross-etapa verificada

---

## 📋 Checklist Resumido

Use este checklist rápido para garantir que não esqueceu nada:

### Código
- [ ] Card component implementado em `etapa-{N}/{card-name}-card.tsx`
- [ ] Normalização adicionada em `array-normalizers.ts`
- [ ] Build TypeScript passando

### Testes
- [ ] Fixture adicionada em `arrays.json`
- [ ] Exemplo completo em `cards-post.json`
- [ ] Testes atualizados em `test-post-cards.mjs`
- [ ] Validação adicionada em `validate-arrays.mjs`
- [ ] `npm run test:arrays` passando (27+/27+)
- [ ] `npm run test:cards-smoke` passando (20+/20+)

### Documentação
- [ ] `project-context.md` atualizado
- [ ] Assistant da etapa atualizado em `docs/assistant-instructions/`
- [ ] `orchestrator.md` atualizado

### Deploy
- [ ] Assistant da etapa atualizado na OpenAI
- [ ] Orchestrator atualizado na OpenAI
- [ ] Testes básicos na OpenAI realizados

---

## 🔍 Troubleshooting Comum

### Erro: "Property 'title' does not exist"
**Solução:** Usar `cardTitle` em vez de `title` no BaseCard

### Erro: "Expected 2 arguments, but got 3" no useAutosave
**Solução:** Usar signature de objeto: `useAutosave(data, { onSave, delay })`

### Build falha com erro de tipos em arrays
**Solução:** Adicionar type assertion em `.map()`: `.map((item: TypeName) => ...)`

### Testes de array falhando
**Solução:** Verificar se o case foi adicionado corretamente em `array-normalizers.ts`

### POST retorna card vazio
**Solução:** Verificar se o exemplo em `cards-post.json` tem todos os campos obrigatórios

### IA retorna arrays como string
**Solução:** Adicionar exemplos corretos e incorretos no arquivo do assistant

---

## 📚 Referências

- **Padrão de Cards:** Ver cards existentes em `pistack-app/components/canvas/cards/`
- **Schemas dos Assistants:** Ver `docs/assistant-instructions/`
- **Normalização:** Ver `pistack-app/lib/array-normalizers.ts`
- **Testes:** Ver `pistack-app/scripts/`

---

**Última atualização:** 2025-10-22
**Versão:** 1.0
**Total de cards no sistema:** 35 cards distribuídos em 6 etapas
