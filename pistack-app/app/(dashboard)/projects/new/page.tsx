'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react'

export default function NewProjectPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create project')
      }

      const data = await response.json()

      // Redirect to the new project's canvas
      router.push(`/canvas/${data.project.id}`)
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Erro ao criar projeto. Por favor, tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#E6E9F2]">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0F1115]/80 backdrop-blur-xl">
        <nav className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="text-lg font-semibold tracking-tight">PIStack</div>
          <Link
            href="/projects"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#E6E9F2]/80 hover:text-[#E6E9F2] hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#7AA2FF]/10 to-[#5AD19A]/10 border border-[#7AA2FF]/20 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-[#7AA2FF]" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            Criar Novo Projeto
          </h1>
          <p className="text-[#E6E9F2]/60">
            Comece estruturando sua ideia com a ajuda da IA
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-2"
            >
              Nome do Projeto *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ex: App de Finanças Pessoais"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm placeholder:text-[#E6E9F2]/40 focus:outline-none focus:border-[#7AA2FF]/50 transition-colors"
            />
          </div>

          {/* Project Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-2"
            >
              Descrição (opcional)
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Descreva brevemente sua ideia..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm placeholder:text-[#E6E9F2]/40 focus:outline-none focus:border-[#7AA2FF]/50 transition-colors resize-none"
            />
          </div>

          {/* Info Box */}
          <div className="bg-[#7AA2FF]/5 border border-[#7AA2FF]/20 rounded-lg p-4">
            <div className="flex gap-3">
              <Sparkles className="w-5 h-5 text-[#7AA2FF] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-[#E6E9F2]/80">
                <p className="font-medium mb-1">O que acontece depois?</p>
                <p className="text-[#E6E9F2]/60">
                  Você será levado para o canvas do projeto com 6 etapas
                  estruturadas. A IA estará pronta para te ajudar a preencher
                  cada card e expandir suas ideias.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-6">
            <Link
              href="/projects"
              className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-[#E6E9F2] rounded-lg font-medium transition-colors text-center"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="flex-1 px-6 py-3 bg-[#7AA2FF] hover:bg-[#6690E8] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Projeto'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
