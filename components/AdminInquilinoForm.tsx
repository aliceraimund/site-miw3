'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { type Inquilino, type InquilinoDocumento, type TipoPessoa, TIPO_PESSOA_LABELS } from '@/types/inquilino'

interface Props {
  inquilino?: Inquilino
  documentosIniciais?: InquilinoDocumento[]
}

interface DocRow extends InquilinoDocumento {
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

export default function AdminInquilinoForm({ inquilino, documentosIniciais = [] }: Props) {
  const router = useRouter()
  const isEditing = !!inquilino
  const docInputRef = useRef<HTMLInputElement>(null)

  const [nome, setNome] = useState(inquilino?.nome ?? '')
  const [tipoPessoa, setTipoPessoa] = useState<TipoPessoa>(inquilino?.tipo_pessoa ?? 'fisica')
  const [cpfCnpj, setCpfCnpj] = useState(inquilino?.cpf_cnpj ?? '')
  const [rg, setRg] = useState(inquilino?.rg ?? '')
  const [telefones, setTelefones] = useState(inquilino?.telefones ?? '')
  const [email, setEmail] = useState(inquilino?.email ?? '')
  const [endereco, setEndereco] = useState(inquilino?.endereco ?? '')
  const [observacoes, setObservacoes] = useState(inquilino?.observacoes ?? '')

  const [docs, setDocs] = useState<DocRow[]>(documentosIniciais)
  const [uploadingDoc, setUploadingDoc] = useState(false)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

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

  const handleUploadDoc = async (files: FileList) => {
    if (!inquilino) return
    setUploadingDoc(true)
    setError('')
    const supabase = createClient()
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'pdf'
      const path = `inquilino/${inquilino.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage.from('gestao').upload(path, file, { cacheControl: '3600', upsert: false })
      if (uploadError) {
        setError(`Erro ao enviar ${file.name}: ${uploadError.message}`)
        continue
      }

      const { data: doc, error: insertError } = await supabase
        .from('inquilino_documentos')
        .insert({ inquilino_id: inquilino.id, storage_path: path, nome: file.name })
        .select('*')
        .single()

      if (insertError || !doc) {
        setError(`Erro ao registrar ${file.name}.`)
        continue
      }

      const { data: signed } = await supabase.storage.from('gestao').createSignedUrl(path, 3600)
      setDocs((prev) => [...prev, { ...(doc as InquilinoDocumento), signedUrl: signed?.signedUrl }])
    }
    setUploadingDoc(false)
    if (docInputRef.current) docInputRef.current.value = ''
  }

  const removeDoc = async (doc: DocRow) => {
    const supabase = createClient()
    await supabase.storage.from('gestao').remove([doc.storage_path])
    await supabase.from('inquilino_documentos').delete().eq('id', doc.id)
    setDocs((prev) => prev.filter((d) => d.id !== doc.id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim()) {
      setError('O nome é obrigatório.')
      return
    }
    setSaving(true)
    setSaved(false)
    setError('')
    const supabase = createClient()

    const payload = {
      nome: nome.trim(),
      tipo_pessoa: tipoPessoa,
      cpf_cnpj: cpfCnpj.trim() || null,
      rg: rg.trim() || null,
      telefones: telefones.trim() || null,
      email: email.trim() || null,
      endereco: endereco.trim() || null,
      observacoes: observacoes.trim() || null,
    }

    if (isEditing) {
      const { error: updateError } = await supabase.from('inquilinos').update(payload).eq('id', inquilino.id)
      if (updateError) {
        setError(updateError.message)
        setSaving(false)
        return
      }
      setSaving(false)
      setSaved(true)
      router.refresh()
    } else {
      const { data, error: insertError } = await supabase.from('inquilinos').insert(payload).select('id').single()
      if (insertError || !data) {
        setError(insertError?.message ?? 'Erro ao cadastrar.')
        setSaving(false)
        return
      }
      router.push(`/admin/gestao/inquilinos/${data.id}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h2 className="font-semibold text-slate-900 text-base border-b border-slate-100 pb-3">Dados cadastrais</h2>

        <Field label="Nome / Razão social" required>
          <input value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} placeholder="Nome completo ou razão social" />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Tipo">
            <select value={tipoPessoa} onChange={(e) => setTipoPessoa(e.target.value as TipoPessoa)} className={inputClass}>
              {(Object.keys(TIPO_PESSOA_LABELS) as TipoPessoa[]).map((t) => (
                <option key={t} value={t}>{TIPO_PESSOA_LABELS[t]}</option>
              ))}
            </select>
          </Field>
          <Field label={tipoPessoa === 'juridica' ? 'CNPJ' : 'CPF'}>
            <input value={cpfCnpj} onChange={(e) => setCpfCnpj(e.target.value)} className={inputClass} placeholder={tipoPessoa === 'juridica' ? '00.000.000/0000-00' : '000.000.000-00'} />
          </Field>
          <Field label={tipoPessoa === 'juridica' ? 'Inscrição estadual' : 'RG'}>
            <input value={rg} onChange={(e) => setRg(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Telefones">
            <input value={telefones} onChange={(e) => setTelefones(e.target.value)} className={inputClass} placeholder="(11) 90000-0000" />
          </Field>
          <Field label="E-mail">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="email@exemplo.com" />
          </Field>
        </div>

        <Field label="Endereço">
          <input value={endereco} onChange={(e) => setEndereco(e.target.value)} className={inputClass} placeholder="Endereço completo" />
        </Field>

        <Field label="Observações">
          <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} className={inputClass} placeholder="Anotações internas..." />
        </Field>
      </div>

      {/* Documentos (só na edição, pois precisa do id) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-semibold text-slate-900 text-base">Documentos</h2>
            <p className="text-xs text-slate-400 mt-0.5">RG, CPF, comprovantes — arquivos privados (PDF ou imagem)</p>
          </div>
          {isEditing && (
            <button type="button" onClick={() => docInputRef.current?.click()} disabled={uploadingDoc} className="shrink-0 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors disabled:opacity-50">
              {uploadingDoc ? 'Enviando...' : '+ Enviar documento'}
            </button>
          )}
          <input ref={docInputRef} type="file" accept="application/pdf,image/*" multiple className="hidden" onChange={(e) => e.target.files && e.target.files.length > 0 && handleUploadDoc(e.target.files)} />
        </div>

        {!isEditing ? (
          <p className="text-sm text-slate-400 py-2">Salve o cadastro para poder anexar documentos.</p>
        ) : docs.length === 0 ? (
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
        <button type="submit" disabled={saving} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
          {saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Cadastrar'}
        </button>
        <button type="button" onClick={() => router.push('/admin/gestao/inquilinos')} className="px-5 py-2.5 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
          {isEditing ? 'Voltar' : 'Cancelar'}
        </button>
        {saved && <span className="text-sm text-green-600 font-medium">Salvo ✓</span>}
      </div>
    </form>
  )
}
