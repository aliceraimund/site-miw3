'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  type Manutencao,
  type ManutencaoFoto,
  type ManutencaoStatus,
  MANUTENCAO_STATUS_LABELS,
} from '@/types/manutencao'

interface OpcaoImovel {
  id: string
  nome: string
  endereco_completo: string
}

interface Props {
  manutencao?: Manutencao
  imoveis: OpcaoImovel[]
  fotosIniciais?: ManutencaoFoto[]
}

interface FotoRow extends ManutencaoFoto {
  signedUrl?: string
}

const inputClass = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const numOuNull = (s: string) => (s.trim() === '' ? null : Number(s))

export default function AdminManutencaoForm({ manutencao, imoveis, fotosIniciais = [] }: Props) {
  const router = useRouter()
  const isEditing = !!manutencao
  const fotoInputRef = useRef<HTMLInputElement>(null)

  const [imovelId, setImovelId] = useState(manutencao?.imovel_id ?? '')
  const [titulo, setTitulo] = useState(manutencao?.titulo ?? '')
  const [descricao, setDescricao] = useState(manutencao?.descricao ?? '')
  const [prestador, setPrestador] = useState(manutencao?.prestador ?? '')
  const [solicitante, setSolicitante] = useState(manutencao?.solicitante ?? '')
  const [status, setStatus] = useState<ManutencaoStatus>(manutencao?.status ?? 'aberto')
  const [custo, setCusto] = useState(manutencao?.custo_estimado?.toString() ?? '')
  const [dataAbertura, setDataAbertura] = useState(manutencao?.data_abertura ?? '')
  const [dataConclusao, setDataConclusao] = useState(manutencao?.data_conclusao_real ?? '')

  const [fotos, setFotos] = useState<FotoRow[]>(fotosIniciais)
  const [uploading, setUploading] = useState(false)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (fotos.length === 0) return
    const supabase = createClient()
    let ativo = true
    Promise.all(
      fotos.map(async (f) => {
        if (f.signedUrl) return f
        const { data } = await supabase.storage.from('gestao').createSignedUrl(f.storage_path, 3600)
        return { ...f, signedUrl: data?.signedUrl }
      })
    ).then((comUrls) => {
      if (ativo) setFotos(comUrls)
    })
    return () => {
      ativo = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUploadFotos = async (files: FileList) => {
    if (!manutencao) return
    setUploading(true)
    setError('')
    const supabase = createClient()
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const path = `manutencao/${manutencao.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage.from('gestao').upload(path, file, { cacheControl: '3600', upsert: false })
      if (uploadError) {
        setError(`Erro ao enviar ${file.name}: ${uploadError.message}`)
        continue
      }
      const { data: foto, error: insertError } = await supabase
        .from('manutencao_fotos')
        .insert({ manutencao_id: manutencao.id, storage_path: path })
        .select('*')
        .single()
      if (insertError || !foto) {
        setError(`Erro ao registrar ${file.name}.`)
        continue
      }
      const { data: signed } = await supabase.storage.from('gestao').createSignedUrl(path, 3600)
      setFotos((prev) => [...prev, { ...(foto as ManutencaoFoto), signedUrl: signed?.signedUrl }])
    }
    setUploading(false)
    if (fotoInputRef.current) fotoInputRef.current.value = ''
  }

  const removeFoto = async (foto: FotoRow) => {
    const supabase = createClient()
    await supabase.storage.from('gestao').remove([foto.storage_path])
    await supabase.from('manutencao_fotos').delete().eq('id', foto.id)
    setFotos((prev) => prev.filter((f) => f.id !== foto.id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imovelId || !titulo.trim()) {
      setError('Selecione o imóvel e informe o título do chamado.')
      return
    }
    setSaving(true)
    setSaved(false)
    setError('')
    const supabase = createClient()

    const payload = {
      imovel_id: imovelId,
      titulo: titulo.trim(),
      descricao: descricao.trim() || null,
      prestador: prestador.trim() || null,
      solicitante: solicitante.trim() || null,
      status,
      custo_estimado: numOuNull(custo),
      data_abertura: dataAbertura || new Date().toISOString().slice(0, 10),
      data_conclusao_real: dataConclusao || null,
      atualizado_em: new Date().toISOString(),
    }

    if (isEditing) {
      const { error: updateError } = await supabase.from('manutencoes').update(payload).eq('id', manutencao.id)
      if (updateError) {
        setError(updateError.message)
        setSaving(false)
        return
      }
      setSaving(false)
      setSaved(true)
      router.refresh()
    } else {
      const { data, error: insertError } = await supabase.from('manutencoes').insert(payload).select('id').single()
      if (insertError || !data) {
        setError(insertError?.message ?? 'Erro ao abrir o chamado.')
        setSaving(false)
        return
      }
      router.push(`/admin/manutencoes/${data.id}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h2 className="font-semibold text-slate-900 text-base border-b border-slate-100 pb-3">Chamado</h2>

        <Field label="Imóvel" required>
          <select value={imovelId} onChange={(e) => setImovelId(e.target.value)} className={inputClass}>
            <option value="">Selecione...</option>
            {imoveis.map((i) => (
              <option key={i.id} value={i.id}>{i.nome} — {i.endereco_completo}</option>
            ))}
          </select>
        </Field>

        <Field label="Título" required>
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className={inputClass} placeholder="Ex: Vazamento na cozinha" />
        </Field>

        <Field label="Descrição">
          <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} className={inputClass} placeholder="Detalhes do problema ou serviço..." />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Prestador">
            <input value={prestador} onChange={(e) => setPrestador(e.target.value)} className={inputClass} placeholder="Empresa ou profissional" />
          </Field>
          <Field label="Solicitante">
            <input value={solicitante} onChange={(e) => setSolicitante(e.target.value)} className={inputClass} placeholder="Quem abriu o chamado" />
          </Field>
          <Field label="Situação">
            <select value={status} onChange={(e) => setStatus(e.target.value as ManutencaoStatus)} className={inputClass}>
              {(Object.keys(MANUTENCAO_STATUS_LABELS) as ManutencaoStatus[]).map((s) => (
                <option key={s} value={s}>{MANUTENCAO_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </Field>
          <Field label="Custo (R$)">
            <input type="number" inputMode="decimal" value={custo} onChange={(e) => setCusto(e.target.value)} className={inputClass} placeholder="0" />
          </Field>
          <Field label="Data de abertura">
            <input type="date" value={dataAbertura} onChange={(e) => setDataAbertura(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Data de conclusão">
            <input type="date" value={dataConclusao} onChange={(e) => setDataConclusao(e.target.value)} className={inputClass} />
          </Field>
        </div>
      </div>

      {/* Fotos */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-semibold text-slate-900 text-base">Fotos</h2>
            <p className="text-xs text-slate-400 mt-0.5">Registros do problema ou do serviço (arquivos privados)</p>
          </div>
          {isEditing && (
            <button type="button" onClick={() => fotoInputRef.current?.click()} disabled={uploading} className="shrink-0 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors disabled:opacity-50">
              {uploading ? 'Enviando...' : '+ Enviar foto'}
            </button>
          )}
          <input ref={fotoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && e.target.files.length > 0 && handleUploadFotos(e.target.files)} />
        </div>

        {!isEditing ? (
          <p className="text-sm text-slate-400 py-2">Salve o chamado para poder anexar fotos.</p>
        ) : fotos.length === 0 ? (
          <p className="text-sm text-slate-400 py-2">Nenhuma foto anexada.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {fotos.map((foto) => (
              <div key={foto.id} className="relative group aspect-square rounded-lg overflow-hidden bg-slate-100">
                {foto.signedUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={foto.signedUrl} alt="Foto da manutenção" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">...</div>
                )}
                <button type="button" onClick={() => removeFoto(foto)} className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" title="Remover foto">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
          {saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Abrir chamado'}
        </button>
        <button type="button" onClick={() => router.push('/admin/manutencoes')} className="px-5 py-2.5 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
          {isEditing ? 'Voltar' : 'Cancelar'}
        </button>
        {saved && <span className="text-sm text-green-600 font-medium">Salvo ✓</span>}
      </div>
    </form>
  )
}
