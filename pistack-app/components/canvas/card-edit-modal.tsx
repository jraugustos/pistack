'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Code } from 'lucide-react'

interface CardEditModalProps {
  cardType: string
  cardTitle: string
  content: Record<string, any>
  stageColor: string
  isOpen: boolean
  isSaving: boolean
  onClose: () => void
  onSave: (content: Record<string, any>) => Promise<void>
}

/**
 * CardEditModal - Modal user-friendly para edição de cards
 *
 * Renderiza campos baseados no tipo de dado:
 * - String: input de texto ou textarea
 * - Array: lista editável com add/remove
 * - Object com name/target: lista de pares chave-valor
 * - Modo avançado: edição JSON raw
 */
export function CardEditModal({
  cardType,
  cardTitle,
  content,
  stageColor,
  isOpen,
  isSaving,
  onClose,
  onSave,
}: CardEditModalProps) {
  const [editedContent, setEditedContent] = useState<Record<string, any>>(content)
  const [advancedMode, setAdvancedMode] = useState(false)
  const [jsonDraft, setJsonDraft] = useState('')
  const [jsonError, setJsonError] = useState<string>()

  useEffect(() => {
    setEditedContent(content)
    setJsonDraft(JSON.stringify(content, null, 2))
    setJsonError(undefined)
  }, [content])

  if (!isOpen) return null

  const handleFieldChange = (key: string, value: any) => {
    setEditedContent((prev) => ({ ...prev, [key]: value }))
  }

  const handleArrayAdd = (key: string) => {
    const currentArray = Array.isArray(editedContent[key]) ? editedContent[key] : []
    setEditedContent((prev) => ({
      ...prev,
      [key]: [...currentArray, ''],
    }))
  }

  const handleArrayRemove = (key: string, index: number) => {
    const currentArray = Array.isArray(editedContent[key]) ? editedContent[key] : []
    setEditedContent((prev) => ({
      ...prev,
      [key]: currentArray.filter((_, i) => i !== index),
    }))
  }

  const handleArrayItemChange = (key: string, index: number, value: string) => {
    const currentArray = Array.isArray(editedContent[key]) ? editedContent[key] : []
    const newArray = [...currentArray]
    newArray[index] = value
    setEditedContent((prev) => ({ ...prev, [key]: newArray }))
  }

  const handleKpiAdd = (key: string) => {
    const currentArray = Array.isArray(editedContent[key]) ? editedContent[key] : []
    setEditedContent((prev) => ({
      ...prev,
      [key]: [...currentArray, { name: '', target: '' }],
    }))
  }

  const handleKpiRemove = (key: string, index: number) => {
    const currentArray = Array.isArray(editedContent[key]) ? editedContent[key] : []
    setEditedContent((prev) => ({
      ...prev,
      [key]: currentArray.filter((_, i) => i !== index),
    }))
  }

  const handleKpiChange = (key: string, index: number, field: 'name' | 'target', value: string) => {
    const currentArray = Array.isArray(editedContent[key]) ? editedContent[key] : []
    const newArray = [...currentArray]
    newArray[index] = { ...newArray[index], [field]: value }
    setEditedContent((prev) => ({ ...prev, [key]: newArray }))
  }

  const handleSave = async () => {
    if (advancedMode) {
      try {
        const parsed = JSON.parse(jsonDraft)
        await onSave(parsed)
      } catch (error) {
        setJsonError(error instanceof Error ? error.message : 'JSON inválido')
      }
    } else {
      await onSave(editedContent)
    }
  }

  const handleJsonChange = (value: string) => {
    setJsonDraft(value)
    setJsonError(undefined)
  }

  const renderField = (key: string, value: any) => {
    // Array de strings simples
    if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
      return (
        <div key={key} className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <button
              type="button"
              onClick={() => handleArrayAdd(key)}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-white/5"
              style={{ color: stageColor }}
            >
              <Plus className="w-3 h-3" />
              Adicionar
            </button>
          </div>
          <div className="space-y-2">
            {value.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayItemChange(key, index, e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#7AA2FF]"
                  placeholder={`Item ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => handleArrayRemove(key, index)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-lg text-[#FF6B6B]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )
    }

    // Array de objetos {name, target} (KPIs)
    if (
      Array.isArray(value) &&
      value.every((item) => typeof item === 'object' && ('name' in item || 'target' in item))
    ) {
      return (
        <div key={key} className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <button
              type="button"
              onClick={() => handleKpiAdd(key)}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-white/5"
              style={{ color: stageColor }}
            >
              <Plus className="w-3 h-3" />
              Adicionar
            </button>
          </div>
          <div className="space-y-2">
            {value.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item.name || ''}
                  onChange={(e) => handleKpiChange(key, index, 'name', e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#7AA2FF]"
                  placeholder="Nome"
                />
                <input
                  type="text"
                  value={item.target || ''}
                  onChange={(e) => handleKpiChange(key, index, 'target', e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#7AA2FF]"
                  placeholder="Meta"
                />
                <button
                  type="button"
                  onClick={() => handleKpiRemove(key, index)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-lg text-[#FF6B6B]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )
    }

    // String longa (textarea)
    if (typeof value === 'string' && value.length > 100) {
      return (
        <div key={key} className="space-y-2">
          <label className="text-sm font-medium capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </label>
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(key, e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#7AA2FF] resize-none"
            rows={4}
            placeholder={`Digite ${key}...`}
          />
        </div>
      )
    }

    // String curta (input)
    if (typeof value === 'string') {
      return (
        <div key={key} className="space-y-2">
          <label className="text-sm font-medium capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(key, e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#7AA2FF]"
            placeholder={`Digite ${key}...`}
          />
        </div>
      )
    }

    return null
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-3xl bg-[#0F1115] border border-white/10 rounded-xl shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-semibold">Editar: {cardTitle}</h2>
            <p className="text-xs text-[#E6E9F2]/50">
              {advancedMode
                ? 'Modo avançado: edição JSON'
                : 'Preencha os campos abaixo'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAdvancedMode(!advancedMode)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-white/5 rounded-lg transition-colors"
              style={{ color: stageColor }}
            >
              <Code className="w-3.5 h-3.5" />
              {advancedMode ? 'Modo simples' : 'Modo JSON'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {advancedMode ? (
            <div className="space-y-2">
              <textarea
                value={jsonDraft}
                onChange={(e) => handleJsonChange(e.target.value)}
                className="w-full h-96 bg-[#0A0B0E] border border-white/10 rounded-lg text-sm p-3 font-mono resize-none focus:outline-none focus:border-[#7AA2FF]"
                spellCheck={false}
              />
              {jsonError && (
                <div className="text-xs text-[#FF6B6B]">{jsonError}</div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(editedContent).map(([key, value]) =>
                renderField(key, value)
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/10">
          <button
            type="button"
            className="px-4 py-2 text-sm text-[#E6E9F2]/70 hover:text-[#E6E9F2] hover:bg-white/5 rounded-lg"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm font-semibold bg-[#7AA2FF] hover:bg-[#6690E8] text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </div>
    </div>
  )
}
