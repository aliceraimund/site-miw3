'use client'

import { renderizarBlocos } from '@/lib/contrato/merge'
import type { Bloco } from '@/lib/contrato/blocos'

interface Props {
  blocos: Bloco[]
  valores: Record<string, unknown>
}

export default function ContratoPreview({ blocos, valores }: Props) {
  const resolvidos = renderizarBlocos(blocos, valores)

  if (resolvidos.length === 0) {
    return <p className="text-sm text-slate-400">Nenhum conteúdo para pré-visualizar.</p>
  }

  return (
    <div className="bg-white text-slate-800 leading-relaxed">
      {resolvidos.map((bloco, i) => {
        const conteudo = bloco.runs.map((run, j) => (
          <span key={j} className={run.negrito ? 'font-bold' : undefined}>{run.texto}</span>
        ))
        return bloco.tipo === 'titulo' ? (
          <h3 key={i} className="text-center font-bold text-sm my-3 uppercase">{conteudo}</h3>
        ) : (
          <p key={i} className="text-justify text-sm my-2">{conteudo}</p>
        )
      })}
    </div>
  )
}
