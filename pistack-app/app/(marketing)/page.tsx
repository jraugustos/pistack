import { ArrowRight, Sparkles, PlayCircle, LayoutGrid, Brain, FileText, GitBranch, History, Zap, Twitter, Github, Linkedin } from 'lucide-react'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const { userId } = await auth()

  // Redirect authenticated users to projects page
  if (userId) {
    redirect('/projects')
  }

  return (
    <div className="bg-[#0F1115] text-[#E6E9F2] min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0F1115]/80 backdrop-blur-xl">
        <nav className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="text-lg font-semibold tracking-tight">PIStack</div>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <a href="#features" className="text-[#E6E9F2]/60 hover:text-[#E6E9F2] transition-colors">Funcionalidades</a>
              <a href="#canvas" className="text-[#E6E9F2]/60 hover:text-[#E6E9F2] transition-colors">Canvas</a>
              <a href="#outputs" className="text-[#E6E9F2]/60 hover:text-[#E6E9F2] transition-colors">Outputs</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="hidden sm:block px-4 py-2 text-sm font-medium text-[#E6E9F2]/80 hover:text-[#E6E9F2] transition-colors">
              Entrar
            </Link>
            <Link href="/sign-up" className="px-4 py-2 text-sm font-medium bg-[#7AA2FF] hover:bg-[#6690E8] text-white rounded-lg transition-colors">
              Começar Grátis
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7AA2FF]/10 border border-[#7AA2FF]/20 text-[#7AA2FF] text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Estruturação Colaborativa com IA
            </div>
            <h1 className="text-5xl lg:text-6xl font-semibold tracking-tight mb-6">
              Transforme ideias em<br/>planos executáveis
            </h1>
            <p className="text-lg text-[#E6E9F2]/60 mb-8 max-w-2xl mx-auto">
              Canvas modular alimentado por IA que organiza seu processo criativo. Da ideação à execução, com documentação estruturada e outputs automáticos.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/sign-up" className="px-6 py-3 bg-[#7AA2FF] hover:bg-[#6690E8] text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                Iniciar Projeto
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#canvas" className="px-6 py-3 bg-white/5 hover:bg-white/10 text-[#E6E9F2] rounded-lg font-medium transition-colors border border-white/10">
                Ver Demo
              </a>
            </div>
          </div>

          {/* Canvas Preview */}
          <div className="relative max-w-6xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-[#7AA2FF]/20 via-[#5AD19A]/20 to-[#FFC24B]/20 blur-3xl opacity-30"></div>
            <div className="relative bg-[#151821] rounded-2xl border border-white/10 p-8 shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-[#FF6B6B]"></div>
                <div className="w-3 h-3 rounded-full bg-[#FFC24B]"></div>
                <div className="w-3 h-3 rounded-full bg-[#5AD19A]"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Preview Card 1 */}
                <div className="bg-[#0F1115] rounded-xl border border-[#7AA2FF]/30 p-5 hover:border-[#7AA2FF]/50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#7AA2FF]"></div>
                      <span className="text-xs font-medium text-[#7AA2FF]">Ideia Base</span>
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">App de Finanças</h3>
                  <p className="text-sm text-[#E6E9F2]/60 mb-4">Simplificar controle de gastos pessoais com categorização automática...</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-4/5 bg-[#7AA2FF] rounded-full"></div>
                    </div>
                    <span className="text-xs text-[#E6E9F2]/40">80%</span>
                  </div>
                </div>

                {/* Preview Card 2 */}
                <div className="bg-[#0F1115] rounded-xl border border-[#5AD19A]/30 p-5 hover:border-[#5AD19A]/50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#5AD19A]"></div>
                      <span className="text-xs font-medium text-[#5AD19A]">Entendimento</span>
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">Personas & Proposta</h3>
                  <p className="text-sm text-[#E6E9F2]/60 mb-4">Jovens profissionais 25-35 anos, buscam autonomia financeira...</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-3/5 bg-[#5AD19A] rounded-full"></div>
                    </div>
                    <span className="text-xs text-[#E6E9F2]/40">60%</span>
                  </div>
                </div>

                {/* Preview Card 3 */}
                <div className="bg-[#0F1115] rounded-xl border border-[#FFC24B]/30 p-5 hover:border-[#FFC24B]/50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#FFC24B]"></div>
                      <span className="text-xs font-medium text-[#FFC24B]">Escopo</span>
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">Funcionalidades</h3>
                  <p className="text-sm text-[#E6E9F2]/60 mb-4">Dashboard, categorização automática, metas mensais...</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-2/5 bg-[#FFC24B] rounded-full"></div>
                    </div>
                    <span className="text-xs text-[#E6E9F2]/40">40%</span>
                  </div>
                </div>
              </div>

              {/* AI Panel Preview */}
              <div className="mt-6 bg-gradient-to-br from-[#7AA2FF]/5 to-[#5AD19A]/5 rounded-lg border border-white/5 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#7AA2FF]/10 border border-[#7AA2FF]/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#7AA2FF]" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">AI Assistant</div>
                    <div className="text-xs text-[#E6E9F2]/40">Pronto para expandir seu projeto</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium transition-colors border border-white/5">
                    Generate
                  </button>
                  <button className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium transition-colors border border-white/5">
                    Expand
                  </button>
                  <button className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium transition-colors border border-white/5">
                    Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-lg text-[#E6E9F2]/60 max-w-2xl mx-auto">
              Canvas modular, IA contextual e outputs automáticos para acelerar seu processo de criação.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-[#151821] rounded-xl border border-white/5 p-6 hover:border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#7AA2FF]/10 border border-[#7AA2FF]/20 flex items-center justify-center mb-4">
                <LayoutGrid className="w-6 h-6 text-[#7AA2FF]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Canvas Modular</h3>
              <p className="text-[#E6E9F2]/60 text-sm">
                Cards inteligentes conectados que organizam cada etapa do seu projeto de forma visual e intuitiva.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#151821] rounded-xl border border-white/5 p-6 hover:border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#5AD19A]/10 border border-[#5AD19A]/20 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-[#5AD19A]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">IA Contextual</h3>
              <p className="text-[#E6E9F2]/60 text-sm">
                Sugestões inteligentes, expansão de conteúdo e revisão automática baseada no contexto do projeto.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#151821] rounded-xl border border-white/5 p-6 hover:border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#FFC24B]/10 border border-[#FFC24B]/20 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-[#FFC24B]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Outputs Automáticos</h3>
              <p className="text-[#E6E9F2]/60 text-sm">
                Gere PRD, Work Plan e Prompt Pack prontos em minutos, diretamente do seu canvas.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#151821] rounded-xl border border-white/5 p-6 hover:border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 flex items-center justify-center mb-4">
                <GitBranch className="w-6 h-6 text-[#FF6B6B]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Conexões Visuais</h3>
              <p className="text-[#E6E9F2]/60 text-sm">
                Conecte cards para mostrar dependências e garantir consistência em todo o projeto.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#151821] rounded-xl border border-white/5 p-6 hover:border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#9B8AFB]/10 border border-[#9B8AFB]/20 flex items-center justify-center mb-4">
                <History className="w-6 h-6 text-[#9B8AFB]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Versionamento</h3>
              <p className="text-[#E6E9F2]/60 text-sm">
                Autosave automático e snapshots de versões para nunca perder seu trabalho.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[#151821] rounded-xl border border-white/5 p-6 hover:border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#7AA2FF]/10 border border-[#7AA2FF]/20 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-[#7AA2FF]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Atalhos de Teclado</h3>
              <p className="text-[#E6E9F2]/60 text-sm">
                Navegação rápida com comandos intuitivos para acelerar seu fluxo de trabalho.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Canvas Workflow */}
      <section id="canvas" className="py-20 px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-4">
              Do conceito à execução
            </h2>
            <p className="text-lg text-[#E6E9F2]/60 max-w-2xl mx-auto">
              Estruture seu projeto em etapas claras, cada uma com cards específicos e suporte de IA.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Stage 1 */}
            <div className="bg-gradient-to-br from-[#7AA2FF]/5 to-transparent rounded-xl border border-[#7AA2FF]/20 p-6">
              <div className="w-10 h-10 rounded-lg bg-[#7AA2FF]/10 border border-[#7AA2FF]/20 flex items-center justify-center mb-4">
                <span className="text-lg font-semibold text-[#7AA2FF]">1</span>
              </div>
              <h3 className="font-semibold mb-2">Ideia Base</h3>
              <p className="text-sm text-[#E6E9F2]/60">Nome, pitch, problema, público e KPIs iniciais.</p>
            </div>

            {/* Stage 2 */}
            <div className="bg-gradient-to-br from-[#5AD19A]/5 to-transparent rounded-xl border border-[#5AD19A]/20 p-6">
              <div className="w-10 h-10 rounded-lg bg-[#5AD19A]/10 border border-[#5AD19A]/20 flex items-center justify-center mb-4">
                <span className="text-lg font-semibold text-[#5AD19A]">2</span>
              </div>
              <h3 className="font-semibold mb-2">Entendimento</h3>
              <p className="text-sm text-[#E6E9F2]/60">Hipóteses, personas e proposta de valor.</p>
            </div>

            {/* Stage 3 */}
            <div className="bg-gradient-to-br from-[#FFC24B]/5 to-transparent rounded-xl border border-[#FFC24B]/20 p-6">
              <div className="w-10 h-10 rounded-lg bg-[#FFC24B]/10 border border-[#FFC24B]/20 flex items-center justify-center mb-4">
                <span className="text-lg font-semibold text-[#FFC24B]">3</span>
              </div>
              <h3 className="font-semibold mb-2">Escopo</h3>
              <p className="text-sm text-[#E6E9F2]/60">Funcionalidades e requisitos estruturados.</p>
            </div>

            {/* Stage 4 */}
            <div className="bg-gradient-to-br from-[#FF6B6B]/5 to-transparent rounded-xl border border-[#FF6B6B]/20 p-6">
              <div className="w-10 h-10 rounded-lg bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 flex items-center justify-center mb-4">
                <span className="text-lg font-semibold text-[#FF6B6B]">4</span>
              </div>
              <h3 className="font-semibold mb-2">Design & Tech</h3>
              <p className="text-sm text-[#E6E9F2]/60">Fluxos, stack técnica e integrações.</p>
            </div>

            {/* Stage 5 */}
            <div className="bg-gradient-to-br from-[#9B8AFB]/5 to-transparent rounded-xl border border-[#9B8AFB]/20 p-6">
              <div className="w-10 h-10 rounded-lg bg-[#9B8AFB]/10 border border-[#9B8AFB]/20 flex items-center justify-center mb-4">
                <span className="text-lg font-semibold text-[#9B8AFB]">5</span>
              </div>
              <h3 className="font-semibold mb-2">Planejamento</h3>
              <p className="text-sm text-[#E6E9F2]/60">Roadmap, métricas e critérios de lançamento.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-4">
            Pronto para estruturar sua próxima ideia?
          </h2>
          <p className="text-lg text-[#E6E9F2]/60 mb-8">
            Comece gratuitamente e transforme conceitos em projetos executáveis com suporte de IA.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/sign-up" className="px-6 py-3 bg-[#7AA2FF] hover:bg-[#6690E8] text-white rounded-lg font-medium transition-colors flex items-center gap-2">
              Criar Primeiro Projeto
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#canvas" className="px-6 py-3 bg-white/5 hover:bg-white/10 text-[#E6E9F2] rounded-lg font-medium transition-colors border border-white/10 flex items-center gap-2">
              <PlayCircle className="w-4 h-4" />
              Assistir Demo
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-3">Produto</h4>
              <ul className="space-y-2 text-sm text-[#E6E9F2]/60">
                <li><a href="#" className="hover:text-[#E6E9F2] transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-[#E6E9F2] transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-[#E6E9F2] transition-colors">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Recursos</h4>
              <ul className="space-y-2 text-sm text-[#E6E9F2]/60">
                <li><a href="#" className="hover:text-[#E6E9F2] transition-colors">Documentação</a></li>
                <li><a href="#" className="hover:text-[#E6E9F2] transition-colors">Guias</a></li>
                <li><a href="#" className="hover:text-[#E6E9F2] transition-colors">Templates</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Empresa</h4>
              <ul className="space-y-2 text-sm text-[#E6E9F2]/60">
                <li><a href="#" className="hover:text-[#E6E9F2] transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-[#E6E9F2] transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-[#E6E9F2] transition-colors">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-[#E6E9F2]/60">
                <li><a href="#" className="hover:text-[#E6E9F2] transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-[#E6E9F2] transition-colors">Termos</a></li>
                <li><a href="#" className="hover:text-[#E6E9F2] transition-colors">Segurança</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-[#E6E9F2]/40">
              © 2024 PIStack. Todos os direitos reservados.
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="text-[#E6E9F2]/40 hover:text-[#E6E9F2] transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-[#E6E9F2]/40 hover:text-[#E6E9F2] transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-[#E6E9F2]/40 hover:text-[#E6E9F2] transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
