'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import DocumentoHtmlEditor from './DocumentoHtmlEditor'
import { verificarPendencias } from '@/lib/contrato/tags-sistema'
import type { ContratoTagSistema } from '@/types/contrato-tag'
import type { Contrato } from '@/types/contrato'

interface Props {
  contrato: Contrato
  tags: ContratoTagSistema[]
}

export default function DocumentoPanel({ contrato, tags }: Props) {
  const router = useRouter()
  const [html, setHtml] = useState(contrato.corpo_gerado_html ?? '')
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [erro, setErro] = useState('')

  const chaves = useMemo(() => tags.map((t) => t.chave), [tags])
  const pend = useMemo(() => verificarPendencias(html, chaves), [html, chaves])
  const temLegado = !html.trim() && !!contrato.corpo_gerado

  const salvar = async () => {
    setSalvando(true); setSalvo(false); setErro('')
    const supabase = createClient()
    const { error } = await supabase
      .from('contratos')
      .update({ corpo_gerado_html: html, atualizado_em: new Date().toISOString() })
      .eq('id', contrato.id)
    setSalvando(false)
    if (error) { setErro(error.message); return }
    setSalvo(true)
    router.refresh()
  }

  if (temLegado) {
    return (
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          Este contrato foi gerado no formato antigo (blocos). O PDF continua funcionando pelo caminho legado.
          Para editar como documento, gere um novo contrato a partir de um modelo em formato de documento.
        </div>
        <a href={`/admin/gestao/contratos/${contrato.id}/pdf`} target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-50">
          Baixar PDF
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900 text-base">Documento do contrato</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            As tags já foram preenchidas na geração. Resolva os {'{PREENCHER ...}'} restantes aqui.
          </p>
        </div>
        <a href={`/admin/gestao/contratos/${contrato.id}/pdf`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-50">
          Baixar PDF
        </a>
      </div>

      {(pend.preencher.length > 0 || pend.desconhecidas.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 space-y-1">
          {pend.preencher.length > 0 && (
            <p><span className="font-semibold">Pendentes ({pend.preencher.length}):</span> <span className="text-xs">{pend.preencher.join('  ·  ')}</span></p>
          )}
          {pend.desconhecidas.length > 0 && (
            <p><span className="font-semibold">Tags não reconhecidas:</span> <span className="text-xs">{pend.desconhecidas.join('  ·  ')}</span></p>
          )}
          <p className="text-xs">Enquanto houver pendências, o contrato não pode ser tornado vigente.</p>
        </div>
      )}
      {pend.preencher.length === 0 && pend.desconhecidas.length === 0 && html.trim() && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-2">Documento sem pendências ✓</p>
      )}

      <DocumentoHtmlEditor htmlInicial={contrato.corpo_gerado_html ?? ''} tags={tags} onChange={setHtml} />

      {erro && <p className="text-sm text-red-600">{erro}</p>}
      <div className="flex items-center gap-3">
        <button onClick={salvar} disabled={salvando} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
          {salvando ? 'Salvando...' : 'Salvar documento'}
        </button>
        {salvo && <span className="text-sm text-green-600 font-medium">Salvo ✓</span>}
      </div>
    </div>
  )
}
