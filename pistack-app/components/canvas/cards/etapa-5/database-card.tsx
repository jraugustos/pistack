'use client'

import { Database, Plus, X } from 'lucide-react'
import { useState, useMemo } from 'react'
import { BaseCard } from '../base-card'
import { useAutosave } from '@/hooks/use-autosave'
import { toArrayOfStrings } from '@/lib/array-normalizers'

interface FieldItem {
  name?: string
  type?: string
  constraints?: string
}

interface TableItem {
  name?: string
  description?: string
  fields?: FieldItem[]
}

interface DatabaseCardProps {
  cardId: string
  content?: {
    type?: string
    description?: string
    tables?: TableItem[]
    relationships?: string[]
  }
  onAiClick?: () => void
  onSave?: (content: any) => Promise<void>
}

function toFieldArray(input: unknown): FieldItem[] {
  if (!input) return []
  if (Array.isArray(input)) {
    return input.map((i) =>
      typeof i === 'string'
        ? { name: i, type: '', constraints: '' }
        : {
            name: i?.name || '',
            type: i?.type || '',
            constraints: i?.constraints || '',
          }
    )
  }
  return []
}

function toTableArray(input: unknown): TableItem[] {
  if (!input) return []
  if (Array.isArray(input)) {
    return input.map((i) =>
      typeof i === 'string'
        ? { name: i, description: '', fields: [] }
        : {
            name: i?.name || '',
            description: i?.description || '',
            fields: toFieldArray(i?.fields),
          }
    )
  }
  return []
}

export function DatabaseCard({ cardId, content, onAiClick, onSave }: DatabaseCardProps) {
  const [localType, setLocalType] = useState(content?.type || '')
  const [localDescription, setLocalDescription] = useState(content?.description || '')
  const [localTables, setLocalTables] = useState<TableItem[]>(() => toTableArray(content?.tables))
  const [localRelationships, setLocalRelationships] = useState<string[]>(() =>
    toArrayOfStrings(content?.relationships)
  )

  const dataToSave = useMemo(
    () => ({
      type: localType.trim(),
      description: localDescription.trim(),
      tables: localTables
        .map((t: TableItem) => ({
          name: t.name?.trim() || '',
          description: t.description?.trim() || '',
          fields: (t.fields || [])
            .map((f: FieldItem) => ({
              name: f.name?.trim() || '',
              type: f.type?.trim() || '',
              constraints: f.constraints?.trim() || '',
            }))
            .filter((f: FieldItem) => f.name),
        }))
        .filter((t: TableItem) => t.name),
      relationships: localRelationships.map((r: string) => r.trim()).filter(Boolean),
    }),
    [localType, localDescription, localTables, localRelationships]
  )

  useAutosave(dataToSave, { onSave: onSave || (async () => {}), delay: 1500 })

  // Table handlers
  const addTable = () => {
    setLocalTables([...localTables, { name: '', description: '', fields: [] }])
  }

  const removeTable = (index: number) => {
    setLocalTables(localTables.filter((_, i) => i !== index))
  }

  const updateTable = (index: number, field: keyof TableItem, value: string) => {
    setLocalTables(
      localTables.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    )
  }

  // Field handlers
  const addField = (tableIndex: number) => {
    setLocalTables(
      localTables.map((t, i) =>
        i === tableIndex
          ? { ...t, fields: [...(t.fields || []), { name: '', type: '', constraints: '' }] }
          : t
      )
    )
  }

  const removeField = (tableIndex: number, fieldIndex: number) => {
    setLocalTables(
      localTables.map((t, i) =>
        i === tableIndex ? { ...t, fields: t.fields?.filter((_, fi) => fi !== fieldIndex) } : t
      )
    )
  }

  const updateField = (
    tableIndex: number,
    fieldIndex: number,
    field: keyof FieldItem,
    value: string
  ) => {
    setLocalTables(
      localTables.map((t, i) =>
        i === tableIndex
          ? {
              ...t,
              fields: t.fields?.map((f, fi) => (fi === fieldIndex ? { ...f, [field]: value } : f)),
            }
          : t
      )
    )
  }

  // Relationship handlers
  const addRelationship = () => {
    setLocalRelationships([...localRelationships, ''])
  }

  const removeRelationship = (index: number) => {
    setLocalRelationships(localRelationships.filter((_, i) => i !== index))
  }

  const updateRelationship = (index: number, value: string) => {
    setLocalRelationships(localRelationships.map((r, i) => (i === index ? value : r)))
  }

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="Banco de Dados"
      icon={Database}
      stageColor="#E879F9"
      onAiClick={onAiClick}
    >
      <div className="space-y-4">
        {/* Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Tipo de Banco</label>
          <select
            value={localType}
            onChange={(e) => setLocalType(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
          >
            <option value="">Selecione...</option>
            <option value="Relacional (SQL)">Relacional (SQL)</option>
            <option value="NoSQL - Documento">NoSQL - Documento</option>
            <option value="NoSQL - Chave-Valor">NoSQL - Chave-Valor</option>
            <option value="NoSQL - Grafo">NoSQL - Grafo</option>
            <option value="Híbrido">Híbrido</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <textarea
            value={localDescription}
            onChange={(e) => setLocalDescription(e.target.value)}
            placeholder="Descreva a estratégia geral de persistência..."
            className="w-full px-3 py-2 border rounded-md text-sm resize-none"
            rows={2}
          />
        </div>

        {/* Tables */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Tabelas / Coleções</label>
            <button
              onClick={addTable}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Plus className="w-3 h-3" />
              Adicionar
            </button>
          </div>

          <div className="space-y-3">
            {localTables.map((table, tIdx) => (
              <div key={tIdx} className="border rounded-md p-3 bg-gray-50 space-y-2">
                <div className="flex items-start gap-2">
                  <input
                    type="text"
                    value={table.name || ''}
                    onChange={(e) => updateTable(tIdx, 'name', e.target.value)}
                    placeholder="Nome da tabela"
                    className="flex-1 px-2 py-1 border rounded text-sm font-medium"
                  />
                  <button
                    onClick={() => removeTable(tIdx)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <input
                  type="text"
                  value={table.description || ''}
                  onChange={(e) => updateTable(tIdx, 'description', e.target.value)}
                  placeholder="Descrição da tabela"
                  className="w-full px-2 py-1 border rounded text-sm"
                />

                {/* Fields */}
                <div className="pl-2 border-l-2 border-blue-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">Campos</span>
                    <button
                      onClick={() => addField(tIdx)}
                      className="flex items-center gap-1 px-2 py-0.5 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      <Plus className="w-3 h-3" />
                      Campo
                    </button>
                  </div>

                  {table.fields?.map((field, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-1">
                      <input
                        type="text"
                        value={field.name || ''}
                        onChange={(e) => updateField(tIdx, fIdx, 'name', e.target.value)}
                        placeholder="Nome"
                        className="flex-1 px-2 py-1 border rounded text-xs"
                      />
                      <input
                        type="text"
                        value={field.type || ''}
                        onChange={(e) => updateField(tIdx, fIdx, 'type', e.target.value)}
                        placeholder="Tipo"
                        className="w-24 px-2 py-1 border rounded text-xs"
                      />
                      <input
                        type="text"
                        value={field.constraints || ''}
                        onChange={(e) => updateField(tIdx, fIdx, 'constraints', e.target.value)}
                        placeholder="Constraints"
                        className="w-28 px-2 py-1 border rounded text-xs"
                      />
                      <button
                        onClick={() => removeField(tIdx, fIdx)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Relationships */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Relacionamentos</label>
            <button
              onClick={addRelationship}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Plus className="w-3 h-3" />
              Adicionar
            </button>
          </div>

          <div className="space-y-2">
            {localRelationships.map((rel, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={rel}
                  onChange={(e) => updateRelationship(idx, e.target.value)}
                  placeholder="Ex: users 1:N posts"
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                />
                <button
                  onClick={() => removeRelationship(idx)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BaseCard>
  )
}
