'use client'

/**
 * Add Field Modal
 * Modal for adding fields to manual card creator
 * HTML reference: lines 532-584
 */

import { useState } from 'react'
import { X } from 'lucide-react'
import type { CardField, FieldType } from '@/lib/types/card-definition'

interface AddFieldModalProps {
  onAdd: (field: CardField) => void
  onClose: () => void
}

export function AddFieldModal({ onAdd, onClose }: AddFieldModalProps) {
  const [fieldName, setFieldName] = useState('')
  const [fieldType, setFieldType] = useState<FieldType>('text')
  const [placeholder, setPlaceholder] = useState('')
  const [required, setRequired] = useState(false)

  const handleAdd = () => {
    if (!fieldName) {
      alert('Digite o nome do campo')
      return
    }

    const field: CardField = {
      name: fieldName,
      type: fieldType,
      placeholder: placeholder || undefined,
      required,
    }

    onAdd(field)
    onClose()

    // Reset form
    setFieldName('')
    setFieldType('text')
    setPlaceholder('')
    setRequired(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0F1115] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">
              Adicionar Campo
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs text-[#E6E9F2]/60 mb-1.5 block">
              Nome do Campo
            </label>
            <input
              type="text"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              placeholder="Ex: Nome da Persona"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm placeholder:text-[#E6E9F2]/40 focus:outline-none focus:border-[#7AA2FF]/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-[#E6E9F2]/60 mb-1.5 block">
              Tipo do Campo
            </label>
            <select
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value as FieldType)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#7AA2FF]/50 transition-colors"
            >
              <option value="text">Texto Curto</option>
              <option value="textarea">Texto Longo</option>
              <option value="number">Número</option>
              <option value="date">Data</option>
              <option value="select">Lista de Opções</option>
              <option value="checkbox">Checkbox</option>
              <option value="file">Arquivo/Imagem</option>
              <option value="url">URL</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-[#E6E9F2]/60 mb-1.5 block">
              Placeholder
            </label>
            <input
              type="text"
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              placeholder="Texto de ajuda para o usuário..."
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm placeholder:text-[#E6E9F2]/40 focus:outline-none focus:border-[#7AA2FF]/50 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="field-required"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="w-4 h-4 rounded bg-white/5 border border-white/10"
            />
            <label htmlFor="field-required" className="text-sm text-[#E6E9F2]/80">
              Campo obrigatório
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#E6E9F2]/80 hover:text-[#E6E9F2] hover:bg-white/5 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 text-sm font-medium bg-[#7AA2FF] hover:bg-[#6690E8] text-white rounded-lg transition-colors"
          >
            Adicionar Campo
          </button>
        </div>
      </div>
    </div>
  )
}
