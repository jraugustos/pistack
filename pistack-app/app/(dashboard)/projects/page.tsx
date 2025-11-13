import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import {
  ensureSupabaseUser,
  getServiceRoleClient,
} from '@/lib/supabase/admin'
import Link from 'next/link'
import { Plus, FolderOpen, LogOut } from 'lucide-react'
import { SignOutButton } from '@clerk/nextjs'
import { ProjectCard } from '@/components/projects/project-card'

async function getProjects(userId: string) {
  try {
    const supabase = getServiceRoleClient()
    const supabaseUserId = await ensureSupabaseUser(userId, supabase)

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', supabaseUserId)
      .order('last_opened_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      return { projects: [], error: error.message }
    }

    return { projects: projects || [], error: null }
  } catch (error) {
    console.error('Error fetching projects:', error)
    return {
      projects: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export default async function ProjectsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const { projects, error } = await getProjects(userId)

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#E6E9F2]">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0F1115]/80 backdrop-blur-xl">
        <nav className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="text-lg font-semibold tracking-tight">PIStack</div>
          <div className="flex items-center gap-3">
            <Link
              href="/projects"
              className="px-4 py-2 text-sm font-medium text-[#E6E9F2] bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              Meus Projetos
            </Link>
            <SignOutButton redirectUrl="/sign-in">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#E6E9F2]/80 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                aria-label="Sair da conta"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </SignOutButton>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            Meus Projetos
          </h1>
          <p className="text-[#E6E9F2]/60">
            Gerencie e organize suas ideias em projetos estruturados
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 rounded-lg">
            <h3 className="font-semibold text-[#FF6B6B] mb-2">
              Erro ao conectar com o banco de dados
            </h3>
            <p className="text-sm text-[#E6E9F2]/80 mb-3">
              Parece que o schema do Supabase ainda não foi aplicado. Por favor,
              siga as instruções em{' '}
              <code className="px-2 py-1 bg-white/5 rounded text-xs">
                docs/supabase-schema.sql
              </code>
            </p>
            <p className="text-xs text-[#E6E9F2]/60">
              Erro técnico: {error}
            </p>
          </div>
        )}

        {/* Projects Grid */}
        {projects.length === 0 && !error ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#7AA2FF]/10 to-[#5AD19A]/10 border border-[#7AA2FF]/20 flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-10 h-10 text-[#7AA2FF]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Nenhum projeto ainda
            </h3>
            <p className="text-[#E6E9F2]/60 mb-6 max-w-md mx-auto">
              Crie seu primeiro projeto e comece a estruturar suas ideias com a
              ajuda da IA
            </p>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#7AA2FF] hover:bg-[#6690E8] text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Criar Primeiro Projeto
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-end">
              <Link
                href="/projects/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#7AA2FF] hover:bg-[#6690E8] text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Novo Projeto
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
