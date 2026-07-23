'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Imovel } from '@/types/imovel'
import {
  type ImovelGestao,
  type ImovelConta,
  type ImovelDocumento,
  type SituacaoGestao,
  type ContaTipo,
  type ContaResponsavel,
  CONTA_TIPO_LABELS,
  CONTA_RESPONSAVEL_LABELS,
  SITUACAO_GESTAO_LABELS,
} from '@/types/gestao'

interface Props {
  imovel: Imovel
  ficha: ImovelGestao | null
  contasIniciais: ImovelConta[]
  documentosIniciais: ImovelDocumento[]
}

interface ContaRow {
  key: string
  tipo: ContaTipo
  numero_identificacao: string
  responsavel: ContaResponsavel
  observacao: string
}

interface DocRow extends ImovelDocumento {
  signedUrl?: string
}

const inputClass = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const numOuNull = (s: string) => (s.trim() === '' ? null : Number(s))

export default function AdminGestaoFicha({ imovel, ficha, contasIniciais, documentosIniciais }: Props) {
  const router = useRouter()
  const keyCounter = useRef(0)
  const nextKey = () => `c${keyCounter.current++}`
  const docInputRef = useRef<HTMLInputElement>(null)

  const [situacao, setSituacao] = useState<SituacaoGestao>(ficha?.situacao_gestao ?? 'disponivel')
  const [matricula, setMatricula] = useState(ficha?.matricula ?? '')
  const [inscricao, setInscricao] = useState(ficha?.inscricao_municipal ?? '')
  const [areaConstruida, setAreaConstruida] = useState(ficha?.area_construida?.toString() ?? '')
  const [areaTerreno, setAreaTerreno] = useState(ficha?.area_terreno?.toString() ?? '')
  const [observacoes, setObservacoes] = useState(ficha?.observacoes ?? '')

  // Características físicas (colunas da tabela imoveis)
  const [quartos, setQuartos] = useState(imovel.quartos?.toString() ?? '')
  const [suites, setSuites] = useState(imovel.suites?.toString() ?? '')
  const [banheiros, setBanheiros] = useState(imovel.banheiros?.toString() ?? '')
  const [vagas, setVagas] = useState(imovel.vagas?.toString() ?? '')

  const [contas, setContas] = useState<ContaRow[]>(
    contasIniciais.map((c) => ({
      key: nextKey(),
      tipo: c.tipo,
      numero_identificacao: c.numero_identificacao ?? '',
      responsavel: c.responsavel,
      observacao: c.observacao ?? '',
    }))
  )

  const [docs, setDocs] = useState<DocRow[]>(documentosIniciais)
  const [uploadingDoc, setUploadingDoc] = useState(false)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Gera URLs assinadas (bucket privado) para os documentos existentes.
  useEffect(() => {
    if (docs.length === 0) return
    const supabase = createClient()
    let ativo = true
    Promise.all(
      docs.map(async (d) => {
        if (d.signedUrl) return d
        const { data } = await supabase.storage.from('gestao').createSignedUrl(d.storage_path, 3600)
        return { ...d, signedUrl: data?.signedUrl }
      })
    ).then((comUrls) => {
      if (ativo) setDocs(comUrls)
    })
    return () => {
      ativo = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addConta = () =>
    setContas((prev) => [...prev, { key: nextKey(), tipo: 'iptu', numero_identificacao: '', responsavel: 'proprietario', observacao: '' }])
  const removeConta = (key: string) => setContas((prev) => prev.filter((c) => c.key !== key))
  const setConta = (key: string, patch: Partial<ContaRow>) =>
    setContas((prev) => prev.map((c) => (c.key === key ? { ...c, ...patch } : c)))

  const handleUploadDoc = async (files: FileList) => {
    setUploadingDoc(true)
    setError('')
    const supabase = createClient()
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'pdf'
      const path = `imovel/${imovel.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage.from('gestao').upload(path, file, { cacheControl: '3600', upsert: false })
      if (uploadError) {
        setError(`Erro ao enviar ${file.name}: ${uploadError.message}`)
        continue
      }

      const { data: doc, error: insertError } = await supabase
        .from('imovel_documentos')
        .insert({ imovel_id: imovel.id, storage_path: path, nome: file.name })
        .select('*')
        .single()

      if (insertError || !doc) {
        setError(`Erro ao registrar ${file.name}.`)
        continue
      }

      const { data: signed } = await supabase.storage.from('gestao').createSignedUrl(path, 3600)
      setDocs((prev) => [...prev, { ...(doc as ImovelDocumento), signedUrl: signed?.signedUrl }])
    }
    setUploadingDoc(false)
    if (docInputRef.current) docInputRef.current.value = ''
  }

  const removeDoc = async (doc: DocRow) => {
    const supabase = createClient()
    await supabase.storage.from('gestao').remove([doc.storage_path])
    await supabase.from('imovel_documentos').delete().eq('id', doc.id)
    setDocs((prev) => prev.filter((d) => d.id !== doc.id))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    setError('')
    const supabase = createClient()

    // Características físicas → tabela imoveis
    const { error: imovelError } = await supabase
      .from('imoveis')
      .update({
        quartos: numOuNull(quartos),
        suites: numOuNull(suites),
        banheiros: numOuNull(banheiros),
        vagas: numOuNull(vagas),
      })
      .eq('id', imovel.id)

    if (imovelError) {
      setError(imovelError.message)
      setSaving(false)
      return
    }

    const { error: fichaError } = await supabase.from('imovel_gestao').upsert(
      {
        imovel_id: imovel.id,
        matricula: matricula || null,
        inscricao_municipal: inscricao || null,
        area_construida: numOuNull(areaConstruida),
        area_terreno: numOuNull(areaTerreno),
        situacao_gestao: situacao,
        observacoes: observacoes || null,
        atualizado_em: new Date().toISOString(),
      },
      { onConflict: 'imovel_id' }
    )

    if (fichaError) {
      setError(fichaError.message)
      setSaving(false)
      return
    }

    // Regrava as contas: remove as antigas e insere as atuais.
    await supabase.from('imovel_contas').delete().eq('imovel_id', imovel.id)
    if (contas.length > 0) {
      const { error: contasError } = await supabase.from('imovel_contas').insert(
        contas.map((c) => ({
          imovel_id: imovel.id,
          tipo: c.tipo,
          numero_identificacao: c.numero_identificacao || null,
          responsavel: c.responsavel,
          observacao: c.observacao || null,
        }))
      )
      if (contasError) {
        setError(contasError.message)
        setSaving(false)
        return
      }
    }

    setSaving(false)
    setSaved(true)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Dados de gestão */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h2 className="font-semibold text-slate-900 text-base border-b border-slate-100 pb-3">Dados de gestão</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Situação">
            <select value={situacao} onChange={(e) => setSituacao(e.target.value as SituacaoGestao)} className={inputClass}>
              {(Object.keys(SITUACAO_GESTAO_LABELS) as SituacaoGestao[]).map((s) => (
                <option key={s} value={s}>{SITUACAO_GESTAO_LABELS[s]}</option>
              ))}
            </select>
          </Field>
          <div />
          <Field label="Matrícula">
            <input value={matricula} onChange={(e) => setMatricula(e.target.value)} className={inputClass} placeholder="Nº da matrícula" />
          </Field>
          <Field label="Inscrição municipal">
            <input value={inscricao} onChange={(e) => setInscricao(e.target.value)} className={inputClass} placeholder="Nº da inscrição" />
          </Field>
          <Field label="Área construída (m²)">
            <input type="number" inputMode="decimal" value={areaConstruida} onChange={(e) => setAreaConstruida(e.target.value)} className={inputClass} placeholder="0" />
          </Field>
          <Field label="Área do terreno (m²)">
            <input type="number" inputMode="decimal" value={areaTerreno} onChange={(e) => setAreaTerreno(e.target.value)} className={inputClass} placeholder="0" />
          </Field>
        </div>

        <Field label="Observações">
          <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={4} className={inputClass} placeholder="Anotações internas sobre o imóvel..." />
        </Field>
      </div>

      {/* Características */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h2 className="font-semibold text-slate-900 text-base border-b border-slate-100 pb-3">Características</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          <Field label="Quartos">
            <input type="number" inputMode="numeric" value={quartos} onChange={(e) => setQuartos(e.target.value)} className={inputClass} placeholder="0" />
          </Field>
          <Field label="Suítes">
            <input type="number" inputMode="numeric" value={suites} onChange={(e) => setSuites(e.target.value)} className={inputClass} placeholder="0" />
          </Field>
          <Field label="Banheiros">
            <input type="number" inputMode="numeric" value={banheiros} onChange={(e) => setBanheiros(e.target.value)} className={inputClass} placeholder="0" />
          </Field>
          <Field label="Vagas">
            <input type="number" inputMode="numeric" value={vagas} onChange={(e) => setVagas(e.target.value)} className={inputClass} placeholder="0" />
          </Field>
        </div>
      </div>

      {/* Contas e taxas */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-semibold text-slate-900 text-base">Contas e taxas</h2>
            <p className="text-xs text-slate-400 mt-0.5">Quem é o responsável por cada conta (o controle de pagamentos segue no ERP)</p>
          </div>
          <button type="button" onClick={addConta} className="shrink-0 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors">
            + Adicionar conta
          </button>
        </div>

        {contas.length === 0 ? (
          <p className="text-sm text-slate-400 py-2">Nenhuma conta cadastrada.</p>
        ) : (
          <div className="space-y-3">
            {contas.map((c) => (
              <div key={c.key} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-start bg-slate-50 rounded-lg p-3">
                <div className="sm:col-span-3">
                  <select value={c.tipo} onChange={(e) => setConta(c.key, { tipo: e.target.value as ContaTipo })} className={inputClass}>
                    {(Object.keys(CONTA_TIPO_LABELS) as ContaTipo[]).map((t) => (
                      <option key={t} value={t}>{CONTA_TIPO_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <input value={c.numero_identificacao} onChange={(e) => setConta(c.key, { numero_identificacao: e.target.value })} className={inputClass} placeholder="Nº de identificação" />
                </div>
                <div className="sm:col-span-3">
                  <select value={c.responsavel} onChange={(e) => setConta(c.key, { responsavel: e.target.value as ContaResponsavel })} className={inputClass}>
                    {(Object.keys(CONTA_RESPONSAVEL_LABELS) as ContaResponsavel[]).map((r) => (
                      <option key={r} value={r}>{CONTA_RESPONSAVEL_LABELS[r]}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <input value={c.observacao} onChange={(e) => setConta(c.key, { observacao: e.target.value })} className={inputClass} placeholder="Obs." />
                </div>
                <div className="sm:col-span-1 flex sm:justify-center">
                  <button type="button" onClick={() => removeConta(c.key)} className="text-slate-400 hover:text-red-600 p-2" title="Remover conta">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documentos */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-semibold text-slate-900 text-base">Documentos</h2>
            <p className="text-xs text-slate-400 mt-0.5">Matrícula, escritura, IPTU, contratos — arquivos privados (PDF ou imagem)</p>
          </div>
          <button type="button" onClick={() => docInputRef.current?.click()} disabled={uploadingDoc} className="shrink-0 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors disabled:opacity-50">
            {uploadingDoc ? 'Enviando...' : '+ Enviar documento'}
          </button>
          <input
            ref={docInputRef}
            type="file"
            accept="application/pdf,image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && e.target.files.length > 0 && handleUploadDoc(e.target.files)}
          />
        </div>

        {docs.length === 0 ? (
          <p className="text-sm text-slate-400 py-2">Nenhum documento enviado.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {docs.map((doc) => (
              <li key={doc.id} className="flex items-center gap-3 py-2.5">
                <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="flex-1 min-w-0 text-sm text-slate-700 truncate">{doc.nome}</span>
                {doc.signedUrl ? (
                  <a href={doc.signedUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors shrink-0">
                    Abrir
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 shrink-0">carregando...</span>
                )}
                <button type="button" onClick={() => removeDoc(doc)} className="text-slate-400 hover:text-red-600 p-1.5 shrink-0" title="Remover documento">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar ficha'}
        </button>
        {saved && <span className="text-sm text-green-600 font-medium">Ficha salva ✓</span>}
      </div>
    </div>
  )
}
