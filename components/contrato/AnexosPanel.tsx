'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'

export interface ContratoDocumento {
  id: string
  contrato_id: string
  storage_path: string
  nome: string
  criado_em: string
}

interface Props {
  contratoId: string
  iniciais: ContratoDocumento[]
  titulo?: string
  descricao?: string
  prefixoNome?: string // marca o tipo do anexo (ex.: 'Assinado — ')
}

interface DocRow extends ContratoDocumento {
  signedUrl?: string
}

export default function AnexosPanel({ contratoId, iniciais, titulo = 'Anexos', descricao, prefixoNome = '' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [docs, setDocs] = useState<DocRow[]>(iniciais)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

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
    ).then((r) => { if (ativo) setDocs(r) })
    return () => { ativo = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const enviar = async (files: FileList) => {
    setEnviando(true); setErro('')
    const supabase = createClient()
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'pdf'
      const path = `contrato/${contratoId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: upErr } = await supabase.storage.from('gestao').upload(path, file, { cacheControl: '3600', upsert: false })
      if (upErr) { setErro(`Erro ao enviar ${file.name}: ${upErr.message}`); continue }
      const { data: doc, error: insErr } = await supabase
        .from('contrato_documentos')
        .insert({ contrato_id: contratoId, storage_path: path, nome: `${prefixoNome}${file.name}` })
        .select('*')
        .single()
      if (insErr || !doc) { setErro(`Erro ao registrar ${file.name}.`); continue }
      const { data: signed } = await supabase.storage.from('gestao').createSignedUrl(path, 3600)
      setDocs((prev) => [...prev, { ...(doc as ContratoDocumento), signedUrl: signed?.signedUrl }])
    }
    setEnviando(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const remover = async (doc: DocRow) => {
    const supabase = createClient()
    await supabase.storage.from('gestao').remove([doc.storage_path])
    await supabase.from('contrato_documentos').delete().eq('id', doc.id)
    setDocs((prev) => prev.filter((d) => d.id !== doc.id))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-slate-900 text-base">{titulo}</h2>
          {descricao && <p className="text-xs text-slate-400 mt-0.5">{descricao}</p>}
        </div>
        <button onClick={() => inputRef.current?.click()} disabled={enviando} className="text-sm font-semibold text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 disabled:opacity-50">
          {enviando ? 'Enviando...' : '+ Enviar arquivo'}
        </button>
        <input ref={inputRef} type="file" accept="application/pdf,image/*" multiple className="hidden" onChange={(e) => e.target.files && e.target.files.length > 0 && enviar(e.target.files)} />
      </div>

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      {docs.length === 0 ? (
        <p className="text-sm text-slate-400">Nenhum arquivo.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {docs.map((doc) => (
            <li key={doc.id} className="flex items-center gap-3 py-2.5">
              <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 truncate">{doc.nome}</p>
                <p className="text-xs text-slate-400">{formatDate(doc.criado_em)}</p>
              </div>
              {doc.signedUrl ? (
                <a href={doc.signedUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 shrink-0">Abrir</a>
              ) : <span className="text-xs text-slate-400 shrink-0">carregando...</span>}
              <button onClick={() => remover(doc)} className="text-slate-400 hover:text-red-600 p-1.5 shrink-0" title="Remover">✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
