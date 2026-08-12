'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  chave: string
  urlInicial: string | null
  rotulo?: string
}

export default function DriveAtalho({ chave, urlInicial, rotulo = 'Pasta no Drive' }: Props) {
  const router = useRouter()
  const [url, setUrl] = useState(urlInicial ?? '')
  const [editando, setEditando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const salvar = async () => {
    setSalvando(true); setErro('')
    const supabase = createClient()
    const { error } = await supabase
      .from('configuracoes')
      .upsert({ chave, valor: url.trim() || null, atualizado_em: new Date().toISOString() }, { onConflict: 'chave' })
    setSalvando(false)
    if (error) { setErro(error.message); return }
    setEditando(false)
    router.refresh()
  }

  if (editando) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <input
          autoFocus
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') salvar(); if (e.key === 'Escape') { setUrl(urlInicial ?? ''); setEditando(false) } }}
          placeholder="Cole aqui o link da pasta do Google Drive"
          className="w-full sm:w-80 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={salvar} disabled={salvando} className="text-sm font-semibold text-white bg-blue-600 rounded-lg px-3 py-2 hover:bg-blue-700 disabled:opacity-50">
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
        <button onClick={() => { setUrl(urlInicial ?? ''); setEditando(false) }} className="text-sm text-slate-500 hover:text-slate-700">
          Cancelar
        </button>
        {erro && <p className="text-sm text-red-600 w-full">{erro}</p>}
      </div>
    )
  }

  if (!urlInicial) {
    return (
      <button onClick={() => setEditando(true)} className="flex items-center gap-2 text-sm text-slate-500 border border-dashed border-slate-300 rounded-lg px-3 py-2 hover:bg-slate-50 hover:text-slate-700 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Definir {rotulo.toLowerCase()}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <a
        href={urlInicial}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors"
      >
        <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.4 3.2 1.6 15l3.4 5.8L11.8 9 8.4 3.2Z" opacity=".7" />
          <path d="M15.6 3.2H8.4L15.2 15h6.8L15.6 3.2Z" opacity=".85" />
          <path d="M5 20.8h13.6l3.4-5.8H8.4L5 20.8Z" />
        </svg>
        {rotulo}
      </a>
      <button onClick={() => setEditando(true)} title="Alterar link" className="text-slate-400 hover:text-slate-700 p-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
    </div>
  )
}
