'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MessageContentProps {
  content: string
  isAssistant?: boolean
}

/**
 * MessageContent - Renderiza conteúdo de mensagens com suporte a Markdown
 *
 * Suporta:
 * - Emojis nativos
 * - **Negrito**
 * - *Itálico*
 * - # Títulos (H1-H6)
 * - Listas (ordenadas e não ordenadas)
 * - Links
 * - Code blocks
 * - Citações
 */
export function MessageContent({ content, isAssistant = false }: MessageContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Títulos
        h1: ({ node, ...props }) => (
          <h1 className="text-lg font-bold mb-2 mt-4 text-[#E6E9F2] border-b border-white/10 pb-2" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-base font-bold mb-2 mt-3 text-[#E6E9F2]" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-sm font-bold mb-2 mt-2 text-[#E6E9F2]" {...props} />
        ),
        h4: ({ node, ...props }) => (
          <h4 className="text-sm font-semibold mb-1 mt-2" {...props} />
        ),
        h5: ({ node, ...props }) => (
          <h5 className="text-xs font-semibold mb-1 mt-2" {...props} />
        ),
        h6: ({ node, ...props }) => (
          <h6 className="text-xs font-semibold mb-1 mt-1" {...props} />
        ),

        // Texto formatado
        strong: ({ node, ...props }) => (
          <strong className="font-bold text-[#E6E9F2]" {...props} />
        ),
        em: ({ node, ...props }) => (
          <em className="italic" {...props} />
        ),

        // Listas
        ul: ({ node, ...props }) => (
          <ul className="list-disc list-inside space-y-1 my-2" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal list-inside space-y-1 my-2" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="text-sm leading-relaxed" {...props} />
        ),

        // Links
        a: ({ node, ...props }) => (
          <a
            className="text-[#7AA2FF] hover:text-[#6690E8] underline"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),

        // Code blocks
        code: ({ node, inline, ...props }: any) =>
          inline ? (
            <code
              className="px-1.5 py-0.5 rounded text-xs font-mono bg-white/10 text-[#5AD19A]"
              {...props}
            />
          ) : (
            <code
              className="block p-3 rounded-lg text-xs font-mono bg-[#0A0B0E] border border-white/10 overflow-x-auto my-2"
              {...props}
            />
          ),
        pre: ({ node, ...props }) => (
          <pre className="overflow-x-auto" {...props} />
        ),

        // Citações
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-2 border-[#7AA2FF]/50 pl-3 py-1 my-2 text-[#E6E9F2]/70 italic"
            {...props}
          />
        ),

        // Parágrafos
        p: ({ node, ...props }) => (
          <p className="leading-relaxed mb-2 last:mb-0" {...props} />
        ),

        // Quebras de linha
        br: ({ node, ...props }) => <br {...props} />,

        // Linha horizontal
        hr: ({ node, ...props }) => (
          <hr className="my-3 border-white/10" {...props} />
        ),

        // Tabelas
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto my-3">
            <table className="min-w-full border border-white/10 rounded-lg" {...props} />
          </div>
        ),
        thead: ({ node, ...props }) => (
          <thead className="bg-white/5" {...props} />
        ),
        tbody: ({ node, ...props }) => (
          <tbody {...props} />
        ),
        tr: ({ node, ...props }) => (
          <tr className="border-b border-white/10" {...props} />
        ),
        th: ({ node, ...props }) => (
          <th className="px-3 py-2 text-left text-xs font-semibold text-[#E6E9F2]" {...props} />
        ),
        td: ({ node, ...props }) => (
          <td className="px-3 py-2 text-xs" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
