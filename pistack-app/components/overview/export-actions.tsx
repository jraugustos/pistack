import { Presentation, FileText, Code2, ArrowRight } from 'lucide-react'

interface ExportActionsProps {
  projectId: string
}

export function ExportActions({ projectId }: ExportActionsProps) {
  return (
    <div className="mb-12 animate-fade-in-up animate-delay-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-semibold tracking-tight mb-3">
          Próximos Passos
        </h2>
        <p className="text-[#E6E9F2]/60">
          Exporte seu projeto em diferentes formatos
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Generate Presentation */}
        <button
          onClick={() => {
            // TODO: Implement presentation generation
            console.log('Generate presentation for project:', projectId)
          }}
          className="bg-[#151821] rounded-xl border border-white/5 p-6 hover:border-[#7AA2FF]/30 transition-all text-left group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#7AA2FF]/10 border border-[#7AA2FF]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Presentation className="w-6 h-6 text-[#7AA2FF]" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Gerar Apresentação</h3>
          <p className="text-sm text-[#E6E9F2]/60 mb-4">
            Crie uma apresentação profissional em slides prontos para
            investidores e stakeholders
          </p>
          <div className="flex items-center gap-2 text-sm text-[#7AA2FF] font-medium">
            <span>Gerar agora</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>

        {/* Export PRD */}
        <button
          onClick={() => {
            // TODO: Implement PRD export
            console.log('Export PRD for project:', projectId)
          }}
          className="bg-[#151821] rounded-xl border border-white/5 p-6 hover:border-[#5AD19A]/30 transition-all text-left group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#5AD19A]/10 border border-[#5AD19A]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6 text-[#5AD19A]" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Exportar PRD</h3>
          <p className="text-sm text-[#E6E9F2]/60 mb-4">
            Documento técnico completo com todas as especificações do produto
            para o time de desenvolvimento
          </p>
          <div className="flex items-center gap-2 text-sm text-[#5AD19A] font-medium">
            <span>Baixar PRD</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>

        {/* Copy Prompts */}
        <button
          onClick={() => {
            // TODO: Implement prompt copy
            console.log('Copy prompts for project:', projectId)
          }}
          className="bg-[#151821] rounded-xl border border-white/5 p-6 hover:border-[#9B8AFB]/30 transition-all text-left group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#9B8AFB]/10 border border-[#9B8AFB]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Code2 className="w-6 h-6 text-[#9B8AFB]" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Copiar Prompts</h3>
          <p className="text-sm text-[#E6E9F2]/60 mb-4">
            Prompts otimizados para ferramentas de vibe coding como v0,
            bolt.new e Cursor
          </p>
          <div className="flex items-center gap-2 text-sm text-[#9B8AFB] font-medium">
            <span>Ver prompts</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>
    </div>
  )
}
