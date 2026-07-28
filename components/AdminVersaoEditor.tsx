'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import BlocoEditor from '@/components/contrato/BlocoEditor'
import VariaveisPanel from '@/components/contrato/VariaveisPanel'
import ContratoPreview from '@/components/contrato/ContratoPreview'
import type { ModeloContratoVersao, ModeloVariavel } from '@/types/modelo-contrato'
import { MODELO_VERSAO_STATUS_LABELS } from '@/types/modelo-contrato'
import type { Bloco } from '@/lib/contrato/blocos'
import { validarVersao, type ErroValidacao } from '@/lib/contrato/validar-versao'
import { PREVIEW_VALORES } from '@/lib/contrato/preview-fixtures'

interface Props {
  modeloId: string
  versao: ModeloContratoVersao
  variaveisIniciais: ModeloVariavel[]
}

export default function AdminVersaoEditor({ modeloId, versao, variaveisIniciais }: Props) {
  const router = useRouter()
  const editavel = versao.status === 'rascunho'

  const [blocos, setBlocos] = useState<Bloco[]>((versao.corpo_blocos?.blocos as Bloco[]) ?? [])
  const [variaveis, setVariaveis] = useState<ModeloVariavel[]>(variaveisIniciais)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [erros, setErros] = useState<ErroValidacao[]>([])
  const [msg, setMsg] = useState('')

  const chaves = useMemo(() => variaveis.map((v) => v.chave), [variaveis])

  const salvarRascunho = async () => {
    setSaving(true)
    setSaved(false)
    const supabase = createClient()
    await supabase.from('modelo_contrato_versoes').update({ corpo_blocos: { blocos } }).eq('id', versao.id)
    setSaving(false)
    setSaved(true)
  }

  const publicar = async () => {
    setMsg('')
    const problemas = validarVersao(blocos, variaveis)
    setErros(problemas)
    if (problemas.length > 0) {
      setMsg('Corrija os problemas abaixo antes de publicar.')
      return
    }
    setSaving(true)
    const supabase = createClient()
    // Salva o corpo e publica (versões publicadas são imutáveis).
    await supabase.from('modelo_contrato_versoes').update({ corpo_blocos: { blocos } }).eq('id', versao.id)
    const { error } = await supabase
      .from('modelo_contrato_versoes')
      .update({ status: 'publicada', publicado_em: new Date().toISOString() })
      .eq('id', versao.id)
    setSaving(false)
    if (error) {
      setMsg(error.message)
      return
    }
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

      {/* datalist compartilhado para inserir placeholders */}
      <datalist id="vars-list">
        {chaves.map((c) => <option key={c} value={c} />)}
      </datalist>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Editor de blocos */}
        <div className="lg:col-span-2 bg-slate-50 rounded-xl border border-slate-200 p-3">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Corpo do contrato</h3>
          {editavel ? (
            <BlocoEditor blocos={blocos} variaveis={chaves} onChange={setBlocos} />
          ) : (
            <p className="text-xs text-slate-400">Somente leitura.</p>
          )}
        </div>

        {/* Variáveis */}
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <VariaveisPanel versaoId={versao.id} variaveis={variaveis} disabled={!editavel} onChange={setVariaveis} />
        </div>
      </div>

      {erros.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          <p className="font-semibold mb-1">Problemas que impedem a publicação:</p>
          <ul className="list-disc pl-5 space-y-0.5">
            {erros.map((e, i) => <li key={i}>{e.detalhe}</li>)}
          </ul>
        </div>
      )}
      {msg && erros.length === 0 && <p className="text-sm text-red-600">{msg}</p>}

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

      {/* Preview */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2 mb-4">Pré-visualização (dados fictícios)</h3>
        <ContratoPreview blocos={blocos} valores={PREVIEW_VALORES} />
      </div>
    </div>
  )
}
