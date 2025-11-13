'use client'

import { useState, MouseEvent, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Loader2, Trash2 } from 'lucide-react'

type Project = {
  id: string
  name: string
  description?: string | null
  updated_at?: string | null
}

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleNavigate = () => {
    if (isDeleting) return
    router.push(`/canvas/${project.id}`)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleNavigate()
    }
  }

  const handleDelete = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (isDeleting) return

    const confirmed = window.confirm(
      'Tem certeza que deseja deletar este projeto? Esta ação não pode ser desfeita.'
    )

    if (!confirmed) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/projects?projectId=${project.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || 'Falha ao deletar projeto')
      }

      router.refresh()
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Não foi possível deletar o projeto. Tente novamente.')
      setIsDeleting(false)
    }
  }

  const formattedDate = project.updated_at
    ? new Date(project.updated_at).toLocaleDateString('pt-BR')
    : 'Sem data'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      className="group relative bg-[#151821] rounded-xl border border-white/5 hover:border-[#7AA2FF]/30 p-6 transition-all hover:shadow-lg hover:shadow-[#7AA2FF]/5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7AA2FF]"
    >
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-lg border border-white/10 text-[#E6E9F2]/70 hover:border-[#FF6B6B]/40 hover:text-[#FF6B6B] disabled:opacity-60 disabled:cursor-not-allowed bg-[#0F1115]/80 backdrop-blur"
        aria-label={`Deletar projeto ${project.name}`}
      >
        {isDeleting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="sr-only">Excluindo...</span>
          </>
        ) : (
          <>
            <Trash2 className="w-4 h-4" />
            <span className="sr-only">Deletar</span>
          </>
        )}
      </button>

      <h3 className="font-semibold text-lg mb-2 pr-16 group-hover:text-[#7AA2FF] transition-colors">
        {project.name}
      </h3>
      {project.description && (
        <p className="text-sm text-[#E6E9F2]/60 mb-4 line-clamp-2">
          {project.description}
        </p>
      )}
      <div className="flex items-center gap-2 text-xs text-[#E6E9F2]/40">
        <Calendar className="w-3 h-3" />
        <span>Atualizado {formattedDate}</span>
      </div>
    </div>
  )
}
