'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AnexosPanel, { type ContratoDocumento } from './AnexosPanel'
import { verificarPendencias } from '@/lib/contrato/tags-sistema'
import type { Contrato, ContratoStatus } from '@/types/contrato'
import { CONTRATO_STATUS_LABELS, CONTRATO_STATUS_COLORS } from '@/types/contrato'

interface Props {
  contrato: Contrato
  documentos: ContratoDocumento[]
  chavesTags: string[]
}

export default function AssinaturasPanel({ contrato, documentos, chavesTags }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<ContratoStatus>(contrato.status)
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState('')
  const [pend, setPend] = useState<{ preencher: string[]; desconhecidas: string[] } | null>(null)

  const ehRascunho = status === 'rascunho'

  const mudarStatus = async (novo: ContratoStatus) => {
    setMsg('')
    setPend(null)

    // Verificação pré-voo: só bloqueia a ida para "vigente".
    if (novo === 'vigente') {
      const html = contrato.corpo_gerado_html ?? ''
      if (!html.trim()) {
        setMsg('Este contrato não tem documento gerado. Gere o documento antes de torná-lo vigente.')
        return
      }
      const p = verificarPendencias(html, chavesTags)
      if (p.preencher.length > 0 || p.desconhecidas.length > 0) {
        setPend(p)
        setMsg('O documento ainda tem campos pendentes. Resolva-os na aba Documento antes de tornar o contrato vigente.')
        return
      }
    }

    setSalvando(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('contratos')
      .update({ status: novo, atualizado_em: new Date().toISOString() })
      .eq('id', contrato.id)

    if (error) { setMsg(error.message); setSalvando(false); return }

    // Situação do imóvel acompanha o contrato.
    if (novo === 'vigente') {
      await supabase.from('imoveis').update({ gerido: true }).eq('id', contrato.imovel_id)
      await supabase.from('imovel_gestao').upsert({ imovel_id: contrato.imovel_id, situacao_gestao: 'alugado' }, { onConflict: 'imovel_id' })
    } else if (novo === 'rescindido') {
      await supabase.from('imovel_gestao').upsert({ imovel_id: contrato.imovel_id, situacao_gestao: 'disponivel' }, { onConflict: 'imovel_id' })
    }

    await supabase.from('contrato_historico').insert({
      contrato_id: contrato.id,
      tipo_evento: novo === 'rescindido' ? 'encerramento' : 'alteracao',
      descricao: `Situação alterada para ${CONTRATO_STATUS_LABELS[novo]}`,
    })

    setStatus(novo)
    setSalvando(false)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-slate-900 text-base mb-1">Situação do contrato</h2>
        <p className="text-xs text-slate-400 mb-3">
          A assinatura eletrônica não é feita pelo sistema — assine por fora e anexe o PDF assinado abaixo.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CONTRATO_STATUS_COLORS[status]}`}>
            {CONTRATO_STATUS_LABELS[status]}
          </span>
          {ehRascunho && (
            <button onClick={() => mudarStatus('vigente')} disabled={salvando} className="text-sm font-semibold text-white bg-green-600 rounded-lg px-4 py-2 hover:bg-green-700 disabled:opacity-50">
              Tornar vigente
            </button>
          )}
          {status !== 'rescindido' && (
            <button onClick={() => mudarStatus('rescindido')} disabled={salvando} className="text-sm font-semibold text-red-600 border border-red-200 rounded-lg px-4 py-2 hover:bg-red-50 disabled:opacity-50">
              Rescindir
            </button>
          )}
          {status === 'rescindido' && (
            <button onClick={() => mudarStatus('rascunho')} disabled={salvando} className="text-sm text-slate-600 border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-50 disabled:opacity-50">
              Voltar para rascunho
            </button>
          )}
        </div>

        {msg && <p className="text-sm text-red-600 mt-3">{msg}</p>}

        {pend && (pend.preencher.length > 0 || pend.desconhecidas.length > 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 mt-3 space-y-2">
            {pend.preencher.length > 0 && (
              <div>
                <p className="font-semibold">Campos manuais pendentes ({pend.preencher.length}):</p>
                <p className="text-xs">{pend.preencher.join('  ·  ')}</p>
              </div>
            )}
            {pend.desconhecidas.length > 0 && (
              <div>
                <p className="font-semibold">Tags não reconhecidas ({pend.desconhecidas.length}):</p>
                <p className="text-xs">{pend.desconhecidas.join('  ·  ')}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 pt-5">
        <AnexosPanel
          contratoId={contrato.id}
          iniciais={documentos}
          titulo="Contrato assinado"
          descricao="Anexe aqui o PDF assinado pelas partes. A data do anexo fica registrada."
          prefixoNome="Assinado — "
        />
      </div>
    </div>
  )
}
