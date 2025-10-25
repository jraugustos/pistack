'use client'

/**
 * DynamicCard - Universal card component
 * PHASE 7: Dynamic Card Rendering
 *
 * Replaces all hardcoded cards with database-driven rendering
 * Renders fields based on CardDefinition schema
 */

import { useState, useEffect } from 'react'
import * as LucideIcons from 'lucide-react'
import { BaseCard } from '../base-card'
import { useAutosave } from '@/hooks/use-autosave'
import type { CardDefinition, CardField } from '@/lib/types/card-definition'
import {
  TextField,
  TextAreaField,
  NumberField,
  DateField,
  SelectField,
  CheckboxField,
  FileField,
  URLField,
} from './field-renderers'

interface DynamicCardProps {
  cardId: string
  definition: CardDefinition
  content?: Record<string, any>
  stageColor: string
  onAiClick?: () => void
  onSave?: (data: Record<string, any>) => Promise<void>
}

/**
 * DynamicCard - Renders any card based on definition
 *
 * Supports all field types:
 * - text, textarea, number, date, select, checkbox, file, url
 *
 * Features:
 * - Autosave with 2s debounce
 * - Dynamic icon from Lucide
 * - Type-safe field rendering
 */
export function DynamicCard({
  cardId,
  definition,
  content = {},
  stageColor,
  onAiClick,
  onSave,
}: DynamicCardProps) {
  const [localContent, setLocalContent] = useState<Record<string, any>>(content)

  // Update local state when props change
  useEffect(() => {
    setLocalContent(content)
  }, [content])

  // Autosave when content changes
  useAutosave(localContent, {
    delay: 2000,
    onSave: async (data) => {
      if (onSave && Object.keys(data).length > 0) {
        await onSave(data)
      }
    },
  })

  // Get Lucide icon component
  const IconComponent =
    LucideIcons[definition.icon as keyof typeof LucideIcons] ||
    LucideIcons.FileText

  // Handle field value change
  const handleFieldChange = (fieldName: string, value: any) => {
    setLocalContent((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
  }

  // Render field based on type
  const renderField = (field: CardField) => {
    const value = localContent[field.name]

    const commonProps = {
      field,
      value,
      onChange: (newValue: any) => handleFieldChange(field.name, newValue),
      stageColor,
    }

    switch (field.type) {
      case 'text':
        return <TextField key={field.name} {...commonProps} />
      case 'textarea':
        return <TextAreaField key={field.name} {...commonProps} />
      case 'number':
        return <NumberField key={field.name} {...commonProps} />
      case 'date':
        return <DateField key={field.name} {...commonProps} />
      case 'select':
        return <SelectField key={field.name} {...commonProps} />
      case 'checkbox':
        return <CheckboxField key={field.name} {...commonProps} />
      case 'file':
        return <FileField key={field.name} {...commonProps} />
      case 'url':
        return <URLField key={field.name} {...commonProps} />
      default:
        console.warn(`Unknown field type: ${field.type}`)
        return null
    }
  }

  return (
    <BaseCard
      cardId={cardId}
      cardTitle={definition.name}
      icon={IconComponent}
      stageColor={stageColor}
      onAiClick={onAiClick}
    >
      {definition.fields.map((field) => renderField(field))}
    </BaseCard>
  )
}
