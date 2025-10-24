'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  Eye,
  FileText,
  Presentation,
  Check,
  AlertCircle,
  Sparkles,
  Clock,
} from 'lucide-react'
import { OverviewHeader } from './overview-header'
import { ProgressSection } from './progress-section'
import { StageOverview } from './stage-overview'
import { ExportActions } from './export-actions'
import { STAGE_ICONS } from '@/lib/card-constants'

interface Card {
  id: string
  card_type: string
  content: Record<string, any>
  stage_id: string
  position: number
  created_at: string
  updated_at: string
}

interface Stage {
  id: string
  project_id: string
  stage_number: number
  stage_name: string
  stage_color: string
  created_at: string
}

interface Project {
  id: string
  name: string
  description: string | null
  user_id: string
  created_at: string
  updated_at: string
  last_opened_at: string | null
}

interface StageProgress {
  stageNumber: number
  total: number
  completed: number
  isComplete: boolean
}

interface Progress {
  total: number
  completed: number
  percentage: number
  stageProgress: StageProgress[]
}

interface ProjectOverviewProps {
  project: Project
  stages: Stage[]
  cards: Card[]
  progress: Progress
}

export function ProjectOverview({
  project,
  stages,
  cards,
  progress,
}: ProjectOverviewProps) {
  // Group cards by stage
  const cardsByStage = cards.reduce(
    (acc, card) => {
      const stageId = card.stage_id
      if (!acc[stageId]) {
        acc[stageId] = []
      }
      acc[stageId].push(card)
      return acc
    },
    {} as Record<string, Card[]>
  )

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-[#E6E9F2]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0F1115]/80 backdrop-blur-xl">
        <nav className="h-14 px-6 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link
              href={`/canvas/${project.id}`}
              className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="text-sm font-semibold tracking-tight">
                Project Overview
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-[#7AA2FF]/10 rounded-md">
                <div className="w-1.5 h-1.5 rounded-full bg-[#7AA2FF]"></div>
                <span className="text-xs text-[#7AA2FF]">
                  {progress.completed}/{progress.total} Cards
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/canvas/${project.id}`}
              className="px-3 py-1.5 text-xs font-medium text-[#E6E9F2]/80 hover:text-[#E6E9F2] hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              Canvas
            </Link>
            <div className="w-px h-6 bg-white/5 mx-1"></div>
            <button
              className="px-3 py-1.5 text-xs font-medium text-[#E6E9F2]/80 hover:text-[#E6E9F2] hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1.5"
              onClick={() => {
                // TODO: Implement export PRD
                console.log('Export PRD')
              }}
            >
              <FileText className="w-3.5 h-3.5" />
              Export PRD
            </button>
            <button
              className="px-3 py-1.5 text-xs font-medium bg-[#7AA2FF] hover:bg-[#6690E8] text-white rounded-lg transition-colors flex items-center gap-1.5"
              onClick={() => {
                // TODO: Implement generate presentation
                console.log('Generate Presentation')
              }}
            >
              <Presentation className="w-3.5 h-3.5" />
              Generate Presentation
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="pt-14">
        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* Hero Header */}
          <OverviewHeader project={project} progress={progress} />

          {/* Progress Section */}
          <ProgressSection progress={progress} stages={stages} />

          {/* Story Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold tracking-tight mb-3">
                A História do Projeto
              </h2>
              <p className="text-[#E6E9F2]/60">
                Uma narrativa completa do conceito à execução
              </p>
            </div>

            {/* Render each stage */}
            {stages.map((stage, index) => {
              const stageCards = cardsByStage[stage.id] || []
              const stageProgressData = progress.stageProgress.find(
                (sp) => sp.stageNumber === stage.stage_number
              )

              return (
                <StageOverview
                  key={stage.id}
                  stage={stage}
                  cards={stageCards}
                  stageProgress={stageProgressData}
                  index={index}
                />
              )
            })}
          </div>

          {/* Export Actions */}
          <ExportActions projectId={project.id} />
        </div>
      </main>
    </div>
  )
}
