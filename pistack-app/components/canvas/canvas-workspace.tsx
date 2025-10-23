'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { CanvasHeader } from '@/components/canvas/canvas-header'
import { CanvasSidebar } from '@/components/canvas/canvas-sidebar'
import { CanvasArea } from '@/components/canvas/canvas-area'
import { AiSidebar } from '@/components/canvas/ai-sidebar'

interface StageRecord {
  id: string
  stage_number: number
  stage_name: string
  stage_color: string
  cards_count?: number | null
}

interface ProjectRecord {
  id: string
  name: string
  description?: string | null
}

interface CanvasWorkspaceProps {
  project: ProjectRecord
  stages: StageRecord[]
}

const DEFAULT_STAGE_META: Record<
  number,
  { name: string; color: string; cardsCount: number }
> = {
  1: { name: 'Ideia Base', color: '#7AA2FF', cardsCount: 6 },
  2: { name: 'Entendimento', color: '#5AD19A', cardsCount: 4 },
  3: { name: 'Escopo', color: '#FFC24B', cardsCount: 6 },
  4: { name: 'Design', color: '#FF6B6B', cardsCount: 5 },
  5: { name: 'Tech', color: '#E879F9', cardsCount: 6 },
  6: { name: 'Planejamento', color: '#9B8AFB', cardsCount: 8 },
}

export function CanvasWorkspace({ project, stages }: CanvasWorkspaceProps) {
  const sortedStages = useMemo(
    () =>
      [...stages].sort((a, b) => {
        return a.stage_number - b.stage_number
      }),
    [stages]
  )

  const defaultStageNumber =
    sortedStages.find((stage) => stage.stage_number === 1)?.stage_number ??
    sortedStages[0]?.stage_number ??
    1

  const [activeStage, setActiveStage] = useState<number>(defaultStageNumber)
  const [searchTerm, setSearchTerm] = useState('')
  const [showOnlyFilled, setShowOnlyFilled] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // Restore from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pistack:ai-sidebar-open')
      return saved ? JSON.parse(saved) : false
    }
    return false
  })
  const stageRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const activeStageData = useMemo(
    () =>
      sortedStages.find((stage) => stage.stage_number === activeStage) ?? null,
    [sortedStages, activeStage]
  )

  const sidebarStages = useMemo(
    () =>
      sortedStages.map((stage) => ({
        number: stage.stage_number,
        name:
          stage.stage_name ||
          DEFAULT_STAGE_META[stage.stage_number]?.name ||
          `Etapa ${stage.stage_number}`,
        color:
          stage.stage_color ||
          DEFAULT_STAGE_META[stage.stage_number]?.color ||
          '#7AA2FF',
        cardsCount:
          stage.cards_count ??
          DEFAULT_STAGE_META[stage.stage_number]?.cardsCount ??
          0,
      })),
    [sortedStages]
  )

  const registerStageRef = useCallback(
    (stageNumber: number, node: HTMLDivElement | null) => {
      const previous = stageRefs.current[stageNumber]
      if (previous && observerRef.current) {
        observerRef.current.unobserve(previous)
      }

      stageRefs.current[stageNumber] = node

      if (node) {
        node.setAttribute('data-stage-number', String(stageNumber))
        if (observerRef.current) {
          observerRef.current.observe(node)
        }
      }
    },
    []
  )

  // Save sidebar state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pistack:ai-sidebar-open', JSON.stringify(isSidebarOpen))
    }
  }, [isSidebarOpen])

  // Listen for auto-open events when user clicks Sparkles
  useEffect(() => {
    const handleAutoOpen = () => {
      setIsSidebarOpen(true)
    }

    window.addEventListener('pistack:ai:reference-card', handleAutoOpen)
    return () => {
      window.removeEventListener('pistack:ai:reference-card', handleAutoOpen)
    }
  }, [])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    observerRef.current?.disconnect()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              Number(a.target.getAttribute('data-stage-number')) -
              Number(b.target.getAttribute('data-stage-number'))
          )

        if (visible.length > 0) {
          const stageNumber = Number(
            visible[0].target.getAttribute('data-stage-number')
          )
          if (!Number.isNaN(stageNumber) && stageNumber !== activeStage) {
            setActiveStage(stageNumber)
          }
        }
      },
      {
        root: container,
        threshold: 0.4,
      }
    )

    Object.values(stageRefs.current).forEach((node) => {
      if (node) {
        observerRef.current?.observe(node)
      }
    })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [sortedStages, activeStage])

  const handleStageChange = useCallback(
    (stageNumber: number) => {
      const node = stageRefs.current[stageNumber]
      const container = scrollContainerRef.current

      if (node && container) {
        const nodeRect = node.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        const offset =
          nodeRect.top - containerRect.top + container.scrollTop - 24

        container.scrollTo({
          top: offset,
          behavior: 'smooth',
        })
      }

      setActiveStage(stageNumber)
    },
    []
  )

  return (
    <div className="h-screen flex flex-col bg-[#0F1115] text-[#E6E9F2]">
      <CanvasHeader
        projectName={project.name}
        projectId={project.id}
        activeStage={activeStage}
        stageName={
          activeStageData?.stage_name ||
          DEFAULT_STAGE_META[activeStage]?.name
        }
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showOnlyFilled={showOnlyFilled}
        onToggleFilled={() => setShowOnlyFilled((previous) => !previous)}
        zoom={zoom}
        onZoomIn={() => setZoom((current) => Math.min(150, current + 10))}
        onZoomOut={() => setZoom((current) => Math.max(60, current - 10))}
      />

      <div className="flex-1 flex pt-14 overflow-hidden">
        <CanvasSidebar
          activeStage={activeStage}
          onStageChange={handleStageChange}
          stages={sidebarStages}
          projectId={project.id}
        />

        <CanvasArea
          projectId={project.id}
          stages={sortedStages}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showOnlyFilled={showOnlyFilled}
          onToggleFilled={() => setShowOnlyFilled((previous) => !previous)}
          zoom={zoom}
          onZoomIn={() => setZoom((current) => Math.min(150, current + 10))}
          onZoomOut={() => setZoom((current) => Math.max(60, current - 10))}
          ref={scrollContainerRef}
          registerStageRef={registerStageRef}
        />

        <AiSidebar
          projectId={project.id}
          activeStage={activeStage}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>
    </div>
  )
}
