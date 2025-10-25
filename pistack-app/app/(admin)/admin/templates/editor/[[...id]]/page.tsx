'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import { Template, TemplateStage } from '@/lib/types/card-definition'
import { StagesSidebar } from '@/components/admin/templates/editor/stages-sidebar'
import { StageConfigPanel } from '@/components/admin/templates/editor/stage-config-panel'
import { CardLibraryModal } from '@/components/admin/templates/card-library-modal'

/**
 * Template Editor Page
 * Pixel-perfect implementation of HTML lines 200-323
 *
 * Routes:
 * - /admin/templates/editor - Create new template
 * - /admin/templates/editor/[id] - Edit existing template
 */
export default function TemplateEditorPage({
  params,
}: {
  params: { id?: string[] }
}) {
  const router = useRouter()
  const templateId = params.id?.[0]
  const isEdit = !!templateId

  const [template, setTemplate] = useState<Template>({
    id: '',
    name: 'Novo Template',
    description: '',
    category: null,
    icon: null,
    is_active: false,
    is_system: true,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    stages: [],
  })

  const [activeStageId, setActiveStageId] = useState<string | null>(null)
  const [showCardLibrary, setShowCardLibrary] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)

  // Fetch template if editing
  useEffect(() => {
    if (isEdit && templateId) {
      fetchTemplate(templateId)
    }
  }, [templateId])

  const fetchTemplate = async (id: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/templates/${id}`)
      const data = await res.json()

      if (data.template) {
        setTemplate(data.template)
        // Set first stage as active
        if (data.template.stages && data.template.stages.length > 0) {
          setActiveStageId(data.template.stages[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching template:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateUpdate = (updates: Partial<Template>) => {
    setTemplate((prev) => ({ ...prev, ...updates }))
  }

  const handleAddStage = () => {
    const newStageNumber =
      template.stages && template.stages.length > 0
        ? Math.max(...template.stages.map((s) => s.stage_number)) + 1
        : 1

    const newStage: TemplateStage = {
      id: `temp-${Date.now()}`, // Temporary ID until saved
      template_id: template.id,
      stage_number: newStageNumber,
      stage_name: `Nova Etapa ${newStageNumber}`,
      stage_description: '',
      stage_color: '#7AA2FF',
      assistant_instructions: '',
      position: newStageNumber - 1,
      created_at: new Date().toISOString(),
      cards: [],
    }

    setTemplate((prev) => ({
      ...prev,
      stages: [...(prev.stages || []), newStage],
    }))

    setActiveStageId(newStage.id)
  }

  const handleStageUpdate = (updates: Partial<TemplateStage>) => {
    if (!activeStageId) return

    setTemplate((prev) => ({
      ...prev,
      stages: prev.stages?.map((stage) =>
        stage.id === activeStageId ? { ...stage, ...updates } : stage
      ),
    }))
  }

  const handleAddCards = (cardDefIds: string[]) => {
    if (!activeStageId) return

    setTemplate((prev) => ({
      ...prev,
      stages: prev.stages?.map((stage) => {
        if (stage.id !== activeStageId) return stage

        // Get current max position
        const maxPosition =
          stage.cards && stage.cards.length > 0
            ? Math.max(...stage.cards.map((c) => c.position))
            : -1

        // Create new template_cards
        const newCards = cardDefIds.map((cardDefId, index) => ({
          id: `temp-${Date.now()}-${index}`,
          template_stage_id: stage.id,
          card_definition_id: cardDefId,
          position: maxPosition + 1 + index,
          created_at: new Date().toISOString(),
        }))

        return {
          ...stage,
          cards: [...(stage.cards || []), ...newCards],
        }
      }),
    }))
  }

  const handleRemoveCard = (cardId: string) => {
    if (!activeStageId) return

    setTemplate((prev) => ({
      ...prev,
      stages: prev.stages?.map((stage) => {
        if (stage.id !== activeStageId) return stage

        return {
          ...stage,
          cards: stage.cards?.filter((card) => card.id !== cardId) || [],
        }
      }),
    }))
  }

  const handleSaveTemplate = async () => {
    try {
      setSaving(true)

      // Prepare data for API
      const templateData = {
        name: template.name,
        description: template.description,
        category: template.category,
        icon: template.icon,
        stages: template.stages?.map((stage) => ({
          stage_number: stage.stage_number,
          stage_name: stage.stage_name,
          stage_description: stage.stage_description,
          stage_color: stage.stage_color,
          assistant_instructions: stage.assistant_instructions,
          card_definition_ids:
            stage.cards?.map((card) => card.card_definition_id) || [],
        })),
      }

      const url = isEdit
        ? `/api/admin/templates/${templateId}`
        : '/api/admin/templates'

      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
      })

      if (!res.ok) {
        throw new Error('Failed to save template')
      }

      const data = await res.json()

      // Redirect to templates page on success
      router.push('/admin/templates')
    } catch (error) {
      console.error('Error saving template:', error)
      alert('Erro ao salvar template. Por favor, tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    router.push('/admin/templates')
  }

  const activeStage = template.stages?.find((s) => s.id === activeStageId)

  if (loading) {
    return (
      <div className="h-screen bg-[#0F1115] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#7AA2FF] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#0F1115] text-[#E6E9F2]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0F1115]/80 backdrop-blur-xl">
        <nav className="h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="text-sm font-semibold tracking-tight">
              {isEdit ? 'Editar Template' : 'Criar Template'}
            </div>
          </div>
          <button
            onClick={handleSaveTemplate}
            disabled={saving || !template.name}
            className="px-3 py-1.5 text-xs font-medium bg-[#7AA2FF] hover:bg-[#6690E8] text-white rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Salvando...' : 'Salvar Template'}
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <div className="pt-14 h-screen flex">
        {/* Left Sidebar - Stages */}
        <StagesSidebar
          template={template}
          activeStageId={activeStageId}
          onStageSelect={setActiveStageId}
          onAddStage={handleAddStage}
          onTemplateUpdate={handleTemplateUpdate}
        />

        {/* Main Area - Stage Config */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-12 border-b border-white/5 px-4 flex items-center justify-between bg-[#0F1115]">
            <div className="text-sm font-medium text-[#E6E9F2]/60">
              {activeStage
                ? `Etapa ${activeStage.stage_number}: ${activeStage.stage_name}`
                : 'Selecione uma etapa para configurar'}
            </div>
          </div>

          <StageConfigPanel
            stage={activeStage}
            onUpdate={handleStageUpdate}
            onOpenCardLibrary={() => setShowCardLibrary(true)}
            onCreateCard={() =>
              router.push('/admin/templates/cards/new')
            }
            onRemoveCard={handleRemoveCard}
          />
        </div>
      </div>

      {/* Card Library Modal */}
      <CardLibraryModal
        isOpen={showCardLibrary}
        onClose={() => setShowCardLibrary(false)}
        onAddCards={handleAddCards}
        selectedCardIds={
          activeStage?.cards?.map((c) => c.card_definition_id) || []
        }
      />
    </div>
  )
}
