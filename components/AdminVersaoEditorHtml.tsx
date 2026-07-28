'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import DocumentoHtmlEditor from '@/components/contrato/DocumentoHtmlEditor'
import type { ModeloContratoVersao } from '@/types/modelo-contrato'
import { MODELO_VERSAO_STATUS_LABELS } from '@/types/modelo-contrato'
import type { ContratoTagSistema } from '@/types/contrato-tag'
import { verificarPendencias } from '@/lib/contrato/tags-sistema'

interface Props {
  modeloId: string
  versao: ModeloContratoVersao
  tags: ContratoTagSistema[]
}

export default function AdminVersaoEditorHtml({ modeloId, versao, tags }: Props) {
  const router = useRouter()
  const editavel = versao.status === 'rascunho'

  const [html, setHtml] = useState(versao.corpo_html ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [msg, setMsg] = useState('')
  const [desconhecidas, setDesconhecidas] = useState<string[]>([])

  const chaves = useMemo(() => tags.map((t) => t.chave), [tags])

  const salvarRascunho = async () => {
    setSaving(true)
    setSaved(false)
    setMsg('')
    const supabase = createClient()
    const { error } = await supabase
      .from('modelo_contrato_versoes')
      .update({ corpo_html: html, formato: 'html' })
      .eq('id', versao.id)
    setSaving(false)
    if (error) setMsg(error.message)
    else setSaved(true)
  }

  const publicar = async () => {
    setMsg('')
    const { desconhecidas: nc } = verificarPendencias(html, chaves)
    setDesconhecidas(nc)
    if (nc.length > 0) {
      setMsg('Há tags que o sistema não reconhece. Corrija antes de publicar.')
      return
    }
    if (!html.replace(/<[^>]+>/g, '').trim()) {
      setMsg('O documento está vazio.')
      return
    }
    setSaving(true)
    const supabase = createClient()
    await supabase.from('modelo_contrato_versoes').update({ corpo_html: html, formato: 'html' }).eq('id', versao.id)
    const { error } = await supabase
      .from('modelo_contrato_versoes')
      .update({ status: 'publicada', publicado_em: new Date().toISOString() })
      .eq('id', versao.id)
    setSaving(false)
    if (error) { setMsg(error.message); return }
    router.push(`/admin/gestao/contratos/modelos/${modeloId}`)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-slate-500">Versão {versao.versao}</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${editavel ? 'bg-slate-100 text-slate-600' : 'bg-green-100 text-green-800'}`}>
          {MODELO_VERSAO_STATUS_LABELS[versao.status]}
        </span>
        {!editavel && <span className="text-xs text-slate-400">Versão publicada é somente leitura — crie uma nova versão para alterar.</span>}
      </div>

      <DocumentoHtmlEditor htmlInicial={versao.corpo_html ?? ''} tags={tags} disabled={!editavel} onChange={setHtml} />

      {desconhecidas.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          <p className="font-semibold mb-1">Tags não reconhecidas:</p>
          <ul className="list-disc pl-5 space-y-0.5">
            {desconhecidas.map((d) => <li key={d}><code>{d}</code></li>)}
          </ul>
          <p className="text-xs mt-1">Use uma tag do painel, ou escreva no formato <code>{'{PREENCHER ...}'}</code> se for preenchimento manual.</p>
        </div>
      )}
      {msg && <p className="text-sm text-red-600">{msg}</p>}

      {editavel && (
        <div className="flex items-center gap-3">
          <button onClick={salvarRascunho} disabled={saving} className="text-sm text-slate-700 border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-50 disabled:opacity-50">
            {saving ? 'Salvando...' : 'Salvar rascunho'}
          </button>
          <button onClick={publicar} disabled={saving} className="bg-blue-600 text-white text-sm font-semibold rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-50">
            Publicar versão
          </button>
          {saved && <span className="text-sm text-green-600 font-medium">Rascunho salvo ✓</span>}
        </div>
      )}
    </div>
  )
}
