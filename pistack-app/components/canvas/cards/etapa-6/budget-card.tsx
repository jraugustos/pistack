'use client'

import { DollarSign, Plus, X } from 'lucide-react'
import { useState, useMemo } from 'react'
import { BaseCard } from '../base-card'
import { useAutosave } from '@/hooks/use-autosave'

interface BudgetItemEntry {
  category?: string
  description?: string
  value?: number
}

interface BudgetCardProps {
  cardId: string
  content?: {
    totalBudget?: number
    breakdown?: BudgetItemEntry[]
    currency?: string
  }
  onAiClick?: () => void
  onSave?: (content: any) => Promise<void>
}

function toBudgetArray(input: unknown): BudgetItemEntry[] {
  if (!input) return []
  if (Array.isArray(input)) {
    return input.map((i) =>
      typeof i === 'string'
        ? { category: i, description: '', value: 0 }
        : {
            category: i?.category || '',
            description: i?.description || '',
            value: Number(i?.value) || 0,
          }
    )
  }
  return []
}

export function BudgetCard({ cardId, content, onAiClick, onSave }: BudgetCardProps) {
  const [localTotalBudget, setLocalTotalBudget] = useState(content?.totalBudget || 0)
  const [localCurrency, setLocalCurrency] = useState(content?.currency || 'BRL')
  const [localBreakdown, setLocalBreakdown] = useState<BudgetItemEntry[]>(() =>
    toBudgetArray(content?.breakdown)
  )

  const dataToSave = useMemo(
    () => ({
      totalBudget: Number(localTotalBudget) || 0,
      currency: localCurrency.trim(),
      breakdown: localBreakdown
        .map((b: BudgetItemEntry) => ({
          category: b.category?.trim() || '',
          description: b.description?.trim() || '',
          value: Number(b.value) || 0,
        }))
        .filter((b: BudgetItemEntry) => b.category),
    }),
    [localTotalBudget, localCurrency, localBreakdown]
  )

  useAutosave(dataToSave, { onSave: onSave || (async () => {}), delay: 1500 })

  const addItem = () => {
    setLocalBreakdown([...localBreakdown, { category: '', description: '', value: 0 }])
  }

  const removeItem = (index: number) => {
    setLocalBreakdown(localBreakdown.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof BudgetItemEntry, value: string | number) => {
    setLocalBreakdown(localBreakdown.map((b, i) => (i === index ? { ...b, [field]: value } : b)))
  }

  // Calculate total from breakdown
  const calculatedTotal = localBreakdown.reduce((sum, item) => sum + (Number(item.value) || 0), 0)

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="Orçamento"
      icon={DollarSign}
      stageColor="#9B8AFB"
      onAiClick={onAiClick}
    >
      <div className="space-y-4">
        {/* Currency and Total */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Moeda</label>
            <select
              value={localCurrency}
              onChange={(e) => setLocalCurrency(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="BRL">BRL (R$)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Orçamento Total</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={localTotalBudget}
              onChange={(e) => setLocalTotalBudget(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Calculated Total */}
        {calculatedTotal > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-900">Total Calculado:</span>
              <span className="text-lg font-bold text-blue-900">
                {localCurrency === 'BRL' && 'R$ '}
                {localCurrency === 'USD' && '$ '}
                {localCurrency === 'EUR' && '€ '}
                {calculatedTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        {/* Breakdown */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Detalhamento</label>
            <button
              onClick={addItem}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Plus className="w-3 h-3" />
              Adicionar
            </button>
          </div>

          <div className="space-y-2">
            {localBreakdown.map((item, idx) => (
              <div key={idx} className="border rounded-md p-3 bg-gray-50 space-y-2">
                <div className="flex items-start gap-2">
                  <input
                    type="text"
                    value={item.category || ''}
                    onChange={(e) => updateItem(idx, 'category', e.target.value)}
                    placeholder="Categoria"
                    className="flex-1 px-2 py-1 border rounded text-sm font-medium"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.value || 0}
                    onChange={(e) => updateItem(idx, 'value', parseFloat(e.target.value))}
                    placeholder="0.00"
                    className="w-28 px-2 py-1 border rounded text-sm text-right"
                  />
                  <button
                    onClick={() => removeItem(idx)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={item.description || ''}
                  onChange={(e) => updateItem(idx, 'description', e.target.value)}
                  placeholder="Descrição detalhada"
                  className="w-full px-2 py-1 border rounded text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </BaseCard>
  )
}
