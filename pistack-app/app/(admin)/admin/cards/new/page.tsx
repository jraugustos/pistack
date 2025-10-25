'use client'

/**
 * Card Creator Page (PHASE 6.3: Manual Card Creator)
 * Admin-only page to create new card definitions
 * Features:
 * - Two modes: AI-powered or Manual
 * - Field builder with preview
 * - Real-time card preview
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  Wrench,
  ArrowRight,
  Plus,
  Check,
  RefreshCw,
} from 'lucide-react'
import type {
  CardDefinition,
  CardField,
  CardCategory,
  FieldType,
} from '@/lib/types/card-definition'
import { AddFieldModal } from '@/components/admin/cards/add-field-modal'
import { CardPreview } from '@/components/admin/cards/card-preview'

type CreationMode = 'ai' | 'manual' | null

interface AIFormData {
  description: string
  category: CardCategory | ''
  icon: string
}

interface ManualFormData {
  name: string
  description: string
  category: CardCategory | ''
  icon: string
  fields: CardField[]
}

interface AIGeneratedCard {
  name: string
  fields: CardField[]
  suggestion: string
}

export default function CardCreatorPage() {
  const router = useRouter()
  const [mode, setMode] = useState<CreationMode>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // AI Mode State
  const [aiForm, setAiForm] = useState<AIFormData>({
    description: '',
    category: '',
    icon: 'file-text',
  })
  const [aiGenerated, setAiGenerated] = useState<AIGeneratedCard | null>(null)

  // Manual Mode State
  const [manualForm, setManualForm] = useState<ManualFormData>({
    name: '',
    description: '',
    category: '',
    icon: 'file-text',
    fields: [],
  })
  const [showAddFieldModal, setShowAddFieldModal] = useState(false)

  // Handle AI Generation
  const handleGenerateAI = async () => {
    if (!aiForm.description || !aiForm.category) {
      alert('Preencha a descrição e categoria do card')
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch('/api/admin/card-definitions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: aiForm.description,
          category: aiForm.category,
          icon: aiForm.icon,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao gerar card')
      }

      const data = await response.json()
      setAiGenerated(data.card)
    } catch (error) {
      console.error('Error generating card:', error)
      alert(error instanceof Error ? error.message : 'Erro ao gerar card com IA')
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle AI Save
  const handleSaveAI = async () => {
    if (!aiGenerated || !aiForm.category) return

    setIsSaving(true)

    try {
      const response = await fetch('/api/admin/card-definitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: aiGenerated.name,
          description: aiForm.description,
          category: aiForm.category,
          icon: aiForm.icon,
          fields: aiGenerated.fields,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar card')
      }

      alert('Card criado com sucesso!')
      router.push('/admin/templates')
    } catch (error) {
      console.error('Error saving card:', error)
      alert(error instanceof Error ? error.message : 'Erro ao salvar card')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle Manual Save
  const handleSaveManual = async () => {
    if (!manualForm.name || !manualForm.category || manualForm.fields.length === 0) {
      alert('Preencha o nome, categoria e adicione pelo menos um campo')
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch('/api/admin/card-definitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: manualForm.name,
          description: manualForm.description,
          category: manualForm.category,
          icon: manualForm.icon,
          fields: manualForm.fields,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar card')
      }

      alert('Card criado com sucesso!')
      router.push('/admin/templates')
    } catch (error) {
      console.error('Error saving card:', error)
      alert(error instanceof Error ? error.message : 'Erro ao salvar card')
    } finally {
      setIsSaving(false)
    }
  }

  // Add field to manual form
  const handleAddField = (field: CardField) => {
    setManualForm((prev) => ({
      ...prev,
      fields: [...prev.fields, field],
    }))
  }

  // Remove field from manual form
  const handleRemoveField = (index: number) => {
    setManualForm((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }))
  }

  return (
    <div className="h-screen pt-14 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            Criar Novo Card
          </h1>
          <p className="text-[#E6E9F2]/60">
            Escolha como deseja criar seu card personalizado
          </p>
        </div>

        {/* Mode Selection */}
        {!mode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Mode */}
            <button
              onClick={() => setMode('ai')}
              className="text-left bg-[#151821] border-2 border-white/10 rounded-xl p-6 hover:border-[#7AA2FF]/50 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#7AA2FF]/10 border border-[#7AA2FF]/20 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-[#7AA2FF]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Criar com IA</h3>
              <p className="text-sm text-[#E6E9F2]/60 mb-4">
                Descreva o que seu card deve fazer e a IA criará a estrutura
                automaticamente
              </p>
              <div className="flex items-center gap-1.5 text-sm text-[#7AA2FF]">
                <span>Recomendado</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>

            {/* Manual Mode */}
            <button
              onClick={() => setMode('manual')}
              className="text-left bg-[#151821] border-2 border-white/10 rounded-xl p-6 hover:border-[#5AD19A]/50 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#5AD19A]/10 border border-[#5AD19A]/20 flex items-center justify-center mb-4">
                <Wrench className="w-6 h-6 text-[#5AD19A]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Criar Manualmente</h3>
              <p className="text-sm text-[#E6E9F2]/60 mb-4">
                Defina cada campo e configuração do card de forma precisa e
                personalizada
              </p>
              <div className="flex items-center gap-1.5 text-sm text-[#5AD19A]">
                <span>Controle total</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          </div>
        )}

        {/* AI Mode Content */}
        {mode === 'ai' && (
          <div className="space-y-6">
            <div className="bg-[#151821] rounded-xl border border-white/10 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-[#7AA2FF]" />
                <h3 className="text-sm font-semibold">Descreva seu Card</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[#E6E9F2]/60 mb-1.5 block">
                    O que este card deve fazer?
                  </label>
                  <textarea
                    value={aiForm.description}
                    onChange={(e) =>
                      setAiForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Ex: Quero um card para documentar personas de usuário. Deve ter campos para nome, idade, objetivos, frustrações e uma foto."
                    rows={4}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm placeholder:text-[#E6E9F2]/40 focus:outline-none focus:border-[#7AA2FF]/50 transition-colors resize-none"
                  />
                  <p className="text-xs text-[#E6E9F2]/40 mt-1.5">
                    Seja específico sobre os campos que você precisa e o propósito
                    do card
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#E6E9F2]/60 mb-1.5 block">
                      Categoria do Card
                    </label>
                    <select
                      value={aiForm.category}
                      onChange={(e) =>
                        setAiForm((prev) => ({
                          ...prev,
                          category: e.target.value as CardCategory,
                        }))
                      }
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#7AA2FF]/50 transition-colors"
                    >
                      <option value="">Selecione...</option>
                      <option value="ideation">Ideação</option>
                      <option value="research">Pesquisa</option>
                      <option value="planning">Planejamento</option>
                      <option value="design">Design</option>
                      <option value="development">Desenvolvimento</option>
                      <option value="marketing">Marketing</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-[#E6E9F2]/60 mb-1.5 block">
                      Ícone
                    </label>
                    <select
                      value={aiForm.icon}
                      onChange={(e) =>
                        setAiForm((prev) => ({ ...prev, icon: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#7AA2FF]/50 transition-colors"
                    >
                      <option value="file-text">Documento</option>
                      <option value="user">Usuário</option>
                      <option value="users">Grupo</option>
                      <option value="lightbulb">Ideia</option>
                      <option value="target">Objetivo</option>
                      <option value="layout">Layout</option>
                      <option value="code">Código</option>
                      <option value="trending-up">Crescimento</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                  className="w-full px-4 py-3 bg-[#7AA2FF] hover:bg-[#6690E8] text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4" />
                  {isGenerating ? 'Gerando...' : 'Gerar Card com IA'}
                </button>
              </div>
            </div>

            {/* AI Generated Preview */}
            {aiGenerated && (
              <div className="bg-[#151821] rounded-xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold">
                    Preview do Card Gerado
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleGenerateAI}
                      disabled={isGenerating}
                      className="px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Regenerar
                    </button>
                    <button
                      onClick={handleSaveAI}
                      disabled={isSaving}
                      className="px-3 py-1.5 text-xs font-medium bg-[#5AD19A] hover:bg-[#4AC189] text-white rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {isSaving ? 'Salvando...' : 'Salvar Card'}
                    </button>
                  </div>
                </div>

                <CardPreview
                  name={aiGenerated.name}
                  category={aiForm.category as CardCategory}
                  icon={aiForm.icon}
                  fields={aiGenerated.fields}
                  suggestion={aiGenerated.suggestion}
                />
              </div>
            )}
          </div>
        )}

        {/* Manual Mode Content */}
        {mode === 'manual' && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-[#151821] rounded-xl border border-white/10 p-6">
              <h3 className="text-sm font-semibold mb-4">
                Informações Básicas
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[#E6E9F2]/60 mb-1.5 block">
                    Nome do Card
                  </label>
                  <input
                    type="text"
                    value={manualForm.name}
                    onChange={(e) =>
                      setManualForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Ex: Persona de Usuário"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm placeholder:text-[#E6E9F2]/40 focus:outline-none focus:border-[#7AA2FF]/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#E6E9F2]/60 mb-1.5 block">
                    Descrição
                  </label>
                  <textarea
                    value={manualForm.description}
                    onChange={(e) =>
                      setManualForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Descreva o propósito deste card..."
                    rows={2}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm placeholder:text-[#E6E9F2]/40 focus:outline-none focus:border-[#7AA2FF]/50 transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#E6E9F2]/60 mb-1.5 block">
                      Categoria
                    </label>
                    <select
                      value={manualForm.category}
                      onChange={(e) =>
                        setManualForm((prev) => ({
                          ...prev,
                          category: e.target.value as CardCategory,
                        }))
                      }
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#7AA2FF]/50 transition-colors"
                    >
                      <option value="">Selecione...</option>
                      <option value="ideation">Ideação</option>
                      <option value="research">Pesquisa</option>
                      <option value="planning">Planejamento</option>
                      <option value="design">Design</option>
                      <option value="development">Desenvolvimento</option>
                      <option value="marketing">Marketing</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-[#E6E9F2]/60 mb-1.5 block">
                      Ícone
                    </label>
                    <select
                      value={manualForm.icon}
                      onChange={(e) =>
                        setManualForm((prev) => ({
                          ...prev,
                          icon: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#7AA2FF]/50 transition-colors"
                    >
                      <option value="file-text">Documento</option>
                      <option value="user">Usuário</option>
                      <option value="users">Grupo</option>
                      <option value="lightbulb">Ideia</option>
                      <option value="target">Objetivo</option>
                      <option value="layout">Layout</option>
                      <option value="code">Código</option>
                      <option value="trending-up">Crescimento</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Fields Configuration */}
            <div className="bg-[#151821] rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Campos do Card</h3>
                <button
                  onClick={() => setShowAddFieldModal(true)}
                  className="px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar Campo
                </button>
              </div>

              <div className="space-y-3">
                {manualForm.fields.length === 0 ? (
                  <div className="text-sm text-[#E6E9F2]/40 text-center py-8 border-2 border-dashed border-white/10 rounded-lg">
                    Nenhum campo adicionado. Clique em "Adicionar Campo" para
                    começar.
                  </div>
                ) : (
                  manualForm.fields.map((field, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div>
                        <div className="text-sm font-medium">{field.name}</div>
                        <div className="text-xs text-[#E6E9F2]/60">
                          {field.type} {field.required && '• Obrigatório'}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveField(index)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Remover
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Preview and Save */}
            <div className="bg-[#151821] rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Preview do Card</h3>
                <button
                  onClick={handleSaveManual}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium bg-[#5AD19A] hover:bg-[#4AC189] text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4" />
                  {isSaving ? 'Salvando...' : 'Salvar Card'}
                </button>
              </div>

              {manualForm.name && manualForm.category ? (
                <CardPreview
                  name={manualForm.name}
                  category={manualForm.category as CardCategory}
                  icon={manualForm.icon}
                  fields={manualForm.fields}
                />
              ) : (
                <div className="border-2 border-dashed border-white/10 rounded-lg p-6">
                  <p className="text-sm text-[#E6E9F2]/40 text-center">
                    Preencha as informações básicas para ver o preview
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Field Modal */}
      {showAddFieldModal && (
        <AddFieldModal
          onAdd={handleAddField}
          onClose={() => setShowAddFieldModal(false)}
        />
      )}
    </div>
  )
}
