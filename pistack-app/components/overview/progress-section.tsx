import { Check, Clock, AlertCircle } from 'lucide-react'

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

interface Stage {
  id: string
  stage_number: number
  stage_name: string
  stage_color: string
}

interface ProgressSectionProps {
  progress: Progress
  stages: Stage[]
}

export function ProgressSection({ progress, stages }: ProgressSectionProps) {
  const getProgressColor = (percentage: number) => {
    if (percentage === 100) return '#5AD19A'
    if (percentage >= 75) return '#7AA2FF'
    if (percentage >= 50) return '#FFC24B'
    return '#FF6B6B'
  }

  return (
    <div className="max-w-4xl mx-auto mb-20 animate-fade-in-up animate-delay-1">
      <div className="bg-[#151821] rounded-2xl border border-white/5 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold mb-1">Progresso do Projeto</h3>
            <p className="text-sm text-[#E6E9F2]/60">
              {progress.completed} de {progress.total} cards preenchidos
            </p>
          </div>
          <div className="text-right">
            <div
              className="text-2xl font-semibold"
              style={{
                color: getProgressColor(progress.percentage),
              }}
            >
              {progress.percentage}%
            </div>
            <div className="text-xs text-[#E6E9F2]/40">Completo</div>
          </div>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#7AA2FF] to-[#5AD19A] rounded-full transition-all duration-500"
            style={{ width: `${progress.percentage}%` }}
          ></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-6">
          {stages.map((stage) => {
            const stageProgress = progress.stageProgress.find(
              (sp) => sp.stageNumber === stage.stage_number
            )
            const isComplete = stageProgress?.isComplete ?? false
            const completed = stageProgress?.completed ?? 0
            const total = stageProgress?.total ?? 0
            const hasCards = completed > 0

            return (
              <div key={stage.id} className="text-center">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 border ${
                    isComplete
                      ? 'bg-[#5AD19A]/10 border-[#5AD19A]/30'
                      : hasCards
                        ? 'bg-[#FFC24B]/10 border-[#FFC24B]/30'
                        : 'bg-white/5 border-white/10'
                  }`}
                >
                  {isComplete ? (
                    <Check className="w-5 h-5 text-[#5AD19A]" />
                  ) : hasCards ? (
                    <Clock className="w-5 h-5 text-[#FFC24B]" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-[#E6E9F2]/30" />
                  )}
                </div>
                <div className="text-xs font-medium mb-0.5">
                  Etapa {stage.stage_number}
                </div>
                <div
                  className={`text-xs ${
                    isComplete
                      ? 'text-[#5AD19A]'
                      : hasCards
                        ? 'text-[#FFC24B]'
                        : 'text-[#E6E9F2]/40'
                  }`}
                >
                  {completed}/{total}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
