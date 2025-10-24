import { Sparkles } from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string | null
}

interface Progress {
  total: number
  completed: number
  percentage: number
}

interface OverviewHeaderProps {
  project: Project
  progress: Progress
}

export function OverviewHeader({ project, progress }: OverviewHeaderProps) {
  return (
    <div className="text-center mb-16 animate-fade-in-up">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#7AA2FF]/10 to-[#5AD19A]/10 border border-[#7AA2FF]/20 rounded-full mb-6">
        <Sparkles className="w-3.5 h-3.5 text-[#7AA2FF]" />
        <span className="text-xs font-medium text-[#7AA2FF]">
          Overview Completo do Projeto
        </span>
      </div>
      <h1 className="text-5xl font-semibold tracking-tight mb-4">
        {project.name}
      </h1>
      {project.description && (
        <p className="text-xl text-[#E6E9F2]/60 max-w-2xl mx-auto leading-relaxed">
          {project.description}
        </p>
      )}
    </div>
  )
}
