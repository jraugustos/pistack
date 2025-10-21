'use client'

import { useState } from 'react'
import { ArrowLeft, History, Users, Download, X, Search, Filter, ZoomIn, ZoomOut } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { useRouter } from 'next/navigation'

interface CanvasHeaderProps {
  projectName: string
  projectId: string
  activeStage: number
  stageName?: string
  searchTerm: string
  onSearchChange: (value: string) => void
  showOnlyFilled: boolean
  onToggleFilled: () => void
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
}

export function CanvasHeader({
  projectName,
  projectId,
  activeStage,
  stageName,
  searchTerm,
  onSearchChange,
  showOnlyFilled,
  onToggleFilled,
  zoom,
  onZoomIn,
  onZoomOut,
}: CanvasHeaderProps) {
  const router = useRouter()
  const [shareFeedback, setShareFeedback] = useState<string | null>(null)
  const [exportFeedback, setExportFeedback] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isVersionsOpen, setIsVersionsOpen] = useState(false)
  const [isLoadingVersions, setIsLoadingVersions] = useState(false)
  const [versionsError, setVersionsError] = useState<string | null>(null)
  const [versions, setVersions] = useState<
    Array<{
      id: string
      role: 'user' | 'assistant'
      content: string
      createdAt?: string
    }>
  >([])

  const stageLabel = stageName || `Etapa ${activeStage}`

  const resetShareFeedback = () => {
    window.setTimeout(() => {
      setShareFeedback(null)
    }, 3000)
  }

  const resetExportFeedback = () => {
    window.setTimeout(() => {
      setExportFeedback(null)
    }, 3000)
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/canvas/${projectId}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: `PIStack - ${projectName}`,
          url: shareUrl,
        })
        setShareFeedback('Link compartilhado!')
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        setShareFeedback('Link copiado para a área de transferência!')
      } else {
        window.prompt(
          'Copie o link do projeto:',
          shareUrl
        )
        setShareFeedback('Link disponível para copiar.')
      }
    } catch (error) {
      console.error('Share error:', error)
      setShareFeedback('Não foi possível compartilhar o link.')
    } finally {
      resetShareFeedback()
    }
  }

  const handleExport = async () => {
    if (isExporting) return
    setIsExporting(true)

    try {
      const response = await fetch(`/api/projects/${projectId}/export`)

      if (!response.ok) {
        throw new Error(`Export failed with status ${response.status}`)
      }

      const data = await response.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `pistack-project-${projectId}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)

      setExportFeedback('Exportação concluída!')
    } catch (error) {
      console.error('Export error:', error)
      setExportFeedback('Não foi possível exportar o projeto.')
    } finally {
      setIsExporting(false)
      resetExportFeedback()
    }
  }

  const formatTimestamp = (value?: string) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  }

  const loadVersions = async () => {
    setIsVersionsOpen(true)
    setIsLoadingVersions(true)
    setVersionsError(null)

    try {
      const params = new URLSearchParams({
        projectId,
        stage: String(activeStage),
      })

      const response = await fetch(`/api/ai/history?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`History request failed: ${response.status}`)
      }

      const data = await response.json()

      setVersions(
        data.messages?.map((message: any) => ({
          id: message.id || crypto.randomUUID(),
          role: message.role,
          content: message.content,
          createdAt: message.createdAt,
        })) ?? []
      )
    } catch (error) {
      console.error('Versions load error:', error)
      setVersions([])
      setVersionsError('Não foi possível carregar o histórico agora.')
    } finally {
      setIsLoadingVersions(false)
    }
  }


  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0F1115]/80 backdrop-blur-xl transition-colors duration-200">
        <nav className="h-14 px-4 flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/projects')}
              className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-lg transition-colors"
              aria-label="Voltar para projetos"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="text-sm font-semibold tracking-tight">
                {projectName}
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-[#5AD19A]/10 rounded-md">
                <div className="w-1.5 h-1.5 rounded-full bg-[#5AD19A]"></div>
                <span className="text-xs text-[#5AD19A]">Autosaved</span>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-3 ml-6">
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E6E9F2]/40" />
                <input
                  value={searchTerm}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Buscar cards..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-sm text-[#E6E9F2]/80 placeholder:text-[#E6E9F2]/40 focus:outline-none focus:border-[#7AA2FF]/60 transition-colors"
                />
              </div>
              <button
                onClick={onToggleFilled}
                className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors ${
                  showOnlyFilled
                    ? 'border-[#5AD19A]/40 bg-[#5AD19A]/10 text-[#5AD19A]'
                    : 'border-transparent text-[#E6E9F2]/60 hover:text-[#E6E9F2] hover:bg-white/5'
                }`}
                aria-pressed={showOnlyFilled}
                aria-label={
                  showOnlyFilled
                    ? 'Mostrar todos os cards'
                    : 'Mostrar apenas cards preenchidos'
                }
              >
                <Filter className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={onZoomOut}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-transparent text-[#E6E9F2]/60 hover:text-[#E6E9F2] hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={zoom <= 60}
                  aria-label="Diminuir zoom"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium text-[#E6E9F2]/80 w-12 text-center">
                  {zoom}%
                </span>
                <button
                  onClick={onZoomIn}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-transparent text-[#E6E9F2]/60 hover:text-[#E6E9F2] hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={zoom >= 150}
                  aria-label="Aumentar zoom"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <ThemeToggle />

              <button
                onClick={loadVersions}
                disabled={isLoadingVersions}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  isLoadingVersions
                    ? 'text-[#E6E9F2]/30 cursor-not-allowed'
                    : 'text-[#E6E9F2]/80 hover:text-[#E6E9F2] hover:bg-white/5'
                }`}
                aria-label="Ver histórico do assistente"
              >
                <History className="w-3.5 h-3.5" />
                {isLoadingVersions ? 'Abrindo...' : 'Versions'}
              </button>

              <button
                onClick={handleShare}
                className="px-3 py-1.5 text-xs font-medium text-[#E6E9F2]/80 hover:text-[#E6E9F2] hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1.5"
                aria-label="Compartilhar projeto"
              >
                <Users className="w-3.5 h-3.5" />
                Share
              </button>

              <div className="w-px h-6 bg-white/5 mx-1"></div>

              <button
                onClick={handleExport}
                disabled={isExporting}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  isExporting
                    ? 'bg-[#7AA2FF]/40 text-white cursor-not-allowed'
                    : 'bg-[#7AA2FF] hover:bg-[#6690E8] text-white'
                }`}
                aria-label="Exportar projeto em JSON"
              >
                <Download className="w-3.5 h-3.5" />
                {isExporting ? 'Exportando...' : 'Export'}
              </button>
            </div>

            {(shareFeedback || exportFeedback) && (
              <span
                className="text-[11px] text-[#E6E9F2]/50"
                aria-live="polite"
              >
                {shareFeedback || exportFeedback}
              </span>
            )}
          </div>
        </nav>
        <div className="px-4 py-3 border-t border-white/5 flex flex-wrap items-center gap-3 lg:hidden bg-[#0F1115]/95">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E6E9F2]/40" />
            <input
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Buscar cards..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-sm text-[#E6E9F2]/80 placeholder:text-[#E6E9F2]/40 focus:outline-none focus:border-[#7AA2FF]/60 transition-colors"
            />
          </div>
          <button
            onClick={onToggleFilled}
            className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors ${
              showOnlyFilled
                ? 'border-[#5AD19A]/40 bg-[#5AD19A]/10 text-[#5AD19A]'
                : 'border-transparent text-[#E6E9F2]/60 hover:text-[#E6E9F2] hover:bg-white/5'
            }`}
            aria-pressed={showOnlyFilled}
            aria-label={
              showOnlyFilled
                ? 'Mostrar todos os cards'
                : 'Mostrar apenas cards preenchidos'
            }
          >
            <Filter className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onZoomOut}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-transparent text-[#E6E9F2]/60 hover:text-[#E6E9F2] hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={zoom <= 60}
              aria-label="Diminuir zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-[#E6E9F2]/80 w-12 text-center">
              {zoom}%
            </span>
            <button
              onClick={onZoomIn}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-transparent text-[#E6E9F2]/60 hover:text-[#E6E9F2] hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={zoom >= 150}
              aria-label="Aumentar zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {isVersionsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg bg-[#0F1115] border border-white/10 rounded-xl shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div>
                <p className="text-sm font-semibold">Histórico da {stageLabel}</p>
                <p className="text-xs text-[#E6E9F2]/40">
                  Últimas interações com o assistente
                </p>
              </div>
              <button
                onClick={() => setIsVersionsOpen(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Fechar histórico"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-4 py-4 space-y-3">
              {isLoadingVersions ? (
                <p className="text-xs text-[#E6E9F2]/60">
                  Carregando histórico...
                </p>
              ) : versionsError ? (
                <p className="text-xs text-[#E6E9F2]/60">{versionsError}</p>
              ) : versions.length === 0 ? (
                <p className="text-xs text-[#E6E9F2]/60">
                  Nenhuma interação registrada para esta etapa ainda.
                </p>
              ) : (
                versions.map((item) => (
                  <div
                    key={item.id}
                    className="border border-white/10 rounded-lg p-3 space-y-2 bg-white/[0.03]"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#E6E9F2]/50">
                      <span>
                        {item.role === 'assistant' ? 'AI Assistant' : 'Você'}
                      </span>
                      <span>{formatTimestamp(item.createdAt)}</span>
                    </div>
                    <p className="text-sm text-[#E6E9F2]/80 whitespace-pre-line">
                      {item.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
