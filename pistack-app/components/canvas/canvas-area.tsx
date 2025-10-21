'use client'

import { ForwardedRef, forwardRef } from 'react'
import { StageSection } from '@/components/canvas/stage-section'

interface StageRecord {
  id: string
  stage_number: number
  stage_name: string
  stage_color: string
}

interface CanvasAreaProps {
  projectId: string
  stages: StageRecord[]
  searchTerm: string
  onSearchChange: (value: string) => void
  showOnlyFilled: boolean
  onToggleFilled: () => void
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  registerStageRef?: (
    stageNumber: number,
    node: HTMLDivElement | null
  ) => void
}

const CanvasAreaBase = (
  {
    projectId,
    stages,
    searchTerm,
    onSearchChange,
    showOnlyFilled,
    onToggleFilled,
    zoom,
    onZoomIn,
    onZoomOut,
    registerStageRef,
  }: CanvasAreaProps,
  ref: ForwardedRef<HTMLDivElement>
) => {
  return (
    <div ref={ref} className="flex-1 overflow-auto bg-[#0A0B0E] p-6">
      <div className="max-w-7xl mx-auto space-y-16">
        {stages.map((stage) => (
          <StageSection
            key={stage.id}
            ref={(node) => registerStageRef?.(stage.stage_number, node)}
            projectId={projectId}
            stage={stage}
            searchTerm={searchTerm}
            showOnlyFilled={showOnlyFilled}
            zoom={zoom}
            onToggleFilled={onToggleFilled}
          />
        ))}
      </div>
    </div>
  )
}

export const CanvasArea = forwardRef<HTMLDivElement, CanvasAreaProps>(
  CanvasAreaBase
)
