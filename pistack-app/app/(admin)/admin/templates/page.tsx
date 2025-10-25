'use client'

import { useEffect, useState } from 'react'
import { Plus, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { TemplateCard } from '@/components/admin/templates/template-card'
import { Template } from '@/lib/types/card-definition'

/**
 * Templates Admin Page
 * Pixel-perfect implementation of HTML lines 40-198 from template-card-creator.html
 */
export default function TemplatesAdminPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/admin/templates')

      if (!res.ok) {
        throw new Error('Failed to fetch templates')
      }

      const data = await res.json()
      setTemplates(data.templates || [])
    } catch (err: any) {
      console.error('Error fetching templates:', err)
      setError(err.message || 'Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = () => {
    router.push('/admin/templates/editor')
  }

  const handleBack = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#E6E9F2]">
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
            <div className="flex items-center gap-3">
              <div className="text-sm font-semibold tracking-tight">
                Templates de Projeto
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="pt-14 h-screen">
        <div className="h-full overflow-y-auto">
          <div className="max-w-7xl mx-auto p-8">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-semibold tracking-tight">
                  Templates de Projeto
                </h1>
                <button
                  onClick={handleCreateTemplate}
                  className="px-4 py-2 bg-[#7AA2FF] hover:bg-[#6690E8] text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Criar Template
                </button>
              </div>
              <p className="text-[#E6E9F2]/60">
                Escolha um template para começar seu projeto ou crie um personalizado
              </p>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-[#7AA2FF] border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                <p className="text-sm text-red-400">{error}</p>
                <button
                  onClick={fetchTemplates}
                  className="mt-2 text-xs text-red-300 hover:text-red-200 underline"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {/* Templates Grid */}
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                      <Plus className="w-8 h-8 text-[#E6E9F2]/40" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      Nenhum template criado
                    </h3>
                    <p className="text-sm text-[#E6E9F2]/60 mb-4">
                      Crie seu primeiro template para começar
                    </p>
                    <button
                      onClick={handleCreateTemplate}
                      className="px-4 py-2 bg-[#7AA2FF] hover:bg-[#6690E8] text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      Criar Primeiro Template
                    </button>
                  </div>
                ) : (
                  templates.map((template) => (
                    <TemplateCard key={template.id} template={template} />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
