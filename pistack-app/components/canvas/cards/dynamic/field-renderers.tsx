'use client'

/**
 * Field Renderers for Dynamic Cards
 * PHASE 7: Dynamic Card Rendering
 *
 * Renders different field types based on card definition schema
 */

import { useState, useEffect } from 'react'
import type { CardField } from '@/lib/types/card-definition'

interface FieldRendererProps {
  field: CardField
  value: any
  onChange: (value: any) => void
  stageColor: string
}

export function TextField({
  field,
  value,
  onChange,
  stageColor,
}: FieldRendererProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [localValue, setLocalValue] = useState(value || '')

  useEffect(() => {
    setLocalValue(value || '')
  }, [value])

  const handleBlur = () => {
    setIsEditing(false)
    onChange(localValue)
  }

  return (
    <div className="mb-3">
      <label className="text-xs text-[#E6E9F2]/60 mb-1 block">
        {field.name}
        {field.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {isEditing ? (
        <input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleBlur()
            if (e.key === 'Escape') {
              setLocalValue(value || '')
              setIsEditing(false)
            }
          }}
          placeholder={field.placeholder}
          className="w-full bg-white/10 border rounded px-2 py-1 text-sm focus:outline-none"
          style={{ borderColor: `${stageColor}50` }}
          autoFocus
        />
      ) : (
        <div
          className="w-full cursor-text hover:bg-white/5 rounded px-2 py-1 text-sm transition-colors min-h-[28px]"
          onClick={() => setIsEditing(true)}
        >
          {localValue || (
            <span className="text-[#E6E9F2]/40">{field.placeholder || 'Clique para editar'}</span>
          )}
        </div>
      )}
    </div>
  )
}

export function TextAreaField({
  field,
  value,
  onChange,
  stageColor,
}: FieldRendererProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [localValue, setLocalValue] = useState(value || '')

  useEffect(() => {
    setLocalValue(value || '')
  }, [value])

  const handleBlur = () => {
    setIsEditing(false)
    onChange(localValue)
  }

  return (
    <div className="mb-3">
      <label className="text-xs text-[#E6E9F2]/60 mb-1 block">
        {field.name}
        {field.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {isEditing ? (
        <textarea
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.metaKey) handleBlur()
            if (e.key === 'Escape') {
              setLocalValue(value || '')
              setIsEditing(false)
            }
          }}
          placeholder={field.placeholder}
          className="w-full bg-white/10 border rounded px-2 py-1 text-sm focus:outline-none resize-none"
          style={{ borderColor: `${stageColor}50` }}
          rows={3}
          autoFocus
        />
      ) : (
        <div
          className="w-full cursor-text hover:bg-white/5 rounded px-2 py-1 text-sm transition-colors min-h-[60px] whitespace-pre-wrap"
          onClick={() => setIsEditing(true)}
        >
          {localValue || (
            <span className="text-[#E6E9F2]/40">{field.placeholder || 'Clique para editar'}</span>
          )}
        </div>
      )}
    </div>
  )
}

export function NumberField({
  field,
  value,
  onChange,
  stageColor,
}: FieldRendererProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [localValue, setLocalValue] = useState(value?.toString() || '')

  useEffect(() => {
    setLocalValue(value?.toString() || '')
  }, [value])

  const handleBlur = () => {
    setIsEditing(false)
    const numValue = parseFloat(localValue)
    onChange(isNaN(numValue) ? null : numValue)
  }

  return (
    <div className="mb-3">
      <label className="text-xs text-[#E6E9F2]/60 mb-1 block">
        {field.name}
        {field.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {isEditing ? (
        <input
          type="number"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleBlur()
            if (e.key === 'Escape') {
              setLocalValue(value?.toString() || '')
              setIsEditing(false)
            }
          }}
          placeholder={field.placeholder}
          className="w-full bg-white/10 border rounded px-2 py-1 text-sm focus:outline-none"
          style={{ borderColor: `${stageColor}50` }}
          autoFocus
        />
      ) : (
        <div
          className="w-full cursor-text hover:bg-white/5 rounded px-2 py-1 text-sm transition-colors min-h-[28px]"
          onClick={() => setIsEditing(true)}
        >
          {localValue || (
            <span className="text-[#E6E9F2]/40">{field.placeholder || 'Clique para editar'}</span>
          )}
        </div>
      )}
    </div>
  )
}

export function DateField({
  field,
  value,
  onChange,
  stageColor,
}: FieldRendererProps) {
  const [localValue, setLocalValue] = useState(value || '')

  useEffect(() => {
    setLocalValue(value || '')
  }, [value])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR')
  }

  return (
    <div className="mb-3">
      <label className="text-xs text-[#E6E9F2]/60 mb-1 block">
        {field.name}
        {field.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        type="date"
        value={localValue}
        onChange={(e) => {
          setLocalValue(e.target.value)
          onChange(e.target.value)
        }}
        placeholder={field.placeholder}
        className="w-full bg-white/10 border rounded px-2 py-1 text-sm focus:outline-none"
        style={{ borderColor: `${stageColor}50` }}
      />
      {localValue && (
        <div className="text-xs text-[#E6E9F2]/40 mt-1">
          {formatDate(localValue)}
        </div>
      )}
    </div>
  )
}

export function SelectField({
  field,
  value,
  onChange,
  stageColor,
}: FieldRendererProps) {
  const [localValue, setLocalValue] = useState(value || '')

  useEffect(() => {
    setLocalValue(value || '')
  }, [value])

  return (
    <div className="mb-3">
      <label className="text-xs text-[#E6E9F2]/60 mb-1 block">
        {field.name}
        {field.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <select
        value={localValue}
        onChange={(e) => {
          setLocalValue(e.target.value)
          onChange(e.target.value)
        }}
        className="w-full bg-white/10 border rounded px-2 py-1 text-sm focus:outline-none"
        style={{ borderColor: `${stageColor}50` }}
      >
        <option value="">{field.placeholder || 'Selecione...'}</option>
        {field.options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

export function CheckboxField({
  field,
  value,
  onChange,
  stageColor,
}: FieldRendererProps) {
  const [localValue, setLocalValue] = useState(value === true)

  useEffect(() => {
    setLocalValue(value === true)
  }, [value])

  return (
    <div className="mb-3">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={localValue}
          onChange={(e) => {
            setLocalValue(e.target.checked)
            onChange(e.target.checked)
          }}
          className="w-4 h-4 rounded"
          style={{ accentColor: stageColor }}
        />
        <span className="text-sm">
          {field.name}
          {field.required && <span className="text-red-400 ml-1">*</span>}
        </span>
      </label>
    </div>
  )
}

export function FileField({
  field,
  value,
  onChange,
  stageColor,
}: FieldRendererProps) {
  const [localValue, setLocalValue] = useState(value || '')

  useEffect(() => {
    setLocalValue(value || '')
  }, [value])

  return (
    <div className="mb-3">
      <label className="text-xs text-[#E6E9F2]/60 mb-1 block">
        {field.name}
        {field.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        type="text"
        value={localValue}
        onChange={(e) => {
          setLocalValue(e.target.value)
          onChange(e.target.value)
        }}
        placeholder={field.placeholder || 'URL do arquivo'}
        className="w-full bg-white/10 border rounded px-2 py-1 text-sm focus:outline-none"
        style={{ borderColor: `${stageColor}50` }}
      />
      {localValue && (
        <div className="mt-2">
          <a
            href={localValue}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs hover:underline"
            style={{ color: stageColor }}
          >
            Ver arquivo
          </a>
        </div>
      )}
    </div>
  )
}

export function URLField({
  field,
  value,
  onChange,
  stageColor,
}: FieldRendererProps) {
  const [localValue, setLocalValue] = useState(value || '')

  useEffect(() => {
    setLocalValue(value || '')
  }, [value])

  return (
    <div className="mb-3">
      <label className="text-xs text-[#E6E9F2]/60 mb-1 block">
        {field.name}
        {field.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        type="url"
        value={localValue}
        onChange={(e) => {
          setLocalValue(e.target.value)
          onChange(e.target.value)
        }}
        placeholder={field.placeholder || 'https://'}
        className="w-full bg-white/10 border rounded px-2 py-1 text-sm focus:outline-none"
        style={{ borderColor: `${stageColor}50` }}
      />
      {localValue && (
        <div className="mt-2">
          <a
            href={localValue}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs hover:underline"
            style={{ color: stageColor }}
          >
            Abrir link
          </a>
        </div>
      )}
    </div>
  )
}
