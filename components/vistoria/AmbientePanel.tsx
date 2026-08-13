'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { comprimirImagem } from '@/lib/imagem'
import type { VistoriaAmbiente, VistoriaFoto } from '@/types/vistoria'

interface Props {
  ambiente: VistoriaAmbiente
  onRenomear: (id: string, nome: string) => void
  onRemover: (id: string) => void
}

interface FotoRow extends VistoriaFoto {
  signedUrl?: string
}

// Foto geral do cômodo — visão do ambiente, separada das fotos de cada item.
export default function AmbientePanel({ ambiente, onRenomear, onRemover }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [fotos, setFotos] = useState<FotoRow[]>((ambiente.vistoria_fotos ?? []) as FotoRow[])
  const [observacao, setObservacao] = useState(ambiente.observacao ?? '')
  const [nome, setNome] = useState(ambiente.nome)
  const [editandoNome, setEditandoNome] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [confirmando, setConfirmando] = useState(false)

  useEffect(() => {
    setNome(ambiente.nome)
    setObservacao(ambiente.observacao ?? '')
    setFotos((ambiente.vistoria_fotos ?? []) as FotoRow[])
  }, [ambiente.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (fotos.length === 0) return
    const supabase = createClient()
    let ativo = true
    Promise.all(
      fotos.map(async (f) => {
        if (f.signedUrl) return f
        const { data } = await supabase.storage.from('vistorias').createSignedUrl(f.storage_path, 3600)
        return { ...f, signedUrl: data?.signedUrl }
      })
    ).then((r) => { if (ativo) setFotos(r) })
    return () => { ativo = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fotos.length, ambiente.id])

  const enviarFotos = async (files: FileList) => {
    setEnviando(true)
    const supabase = createClient()
    for (let i = 0; i < files.length; i++) {
      const file = await comprimirImagem(files[i])
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const path = `ambiente/${ambiente.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('vistorias').upload(path, file, { cacheControl: '3600', upsert: false })
      if (error) continue
      const { data: foto } = await supabase
        .from('vistoria_fotos')
        .insert({ vistoria_ambiente_id: ambiente.id, storage_path: path })
        .select('*')
        .single()
      if (foto) setFotos((prev) => [...prev, foto as FotoRow])
    }
    setEnviando(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const removerFoto = async (foto: FotoRow) => {
    const supabase = createClient()
    await supabase.storage.from('vistorias').remove([foto.storage_path])
    await supabase.from('vistoria_fotos').delete().eq('id', foto.id)
    setFotos((prev) => prev.filter((f) => f.id !== foto.id))
  }

  const salvarObservacao = (texto: string) => {
    setObservacao(texto)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      const supabase = createClient()
      await supabase.from('vistoria_ambientes').update({ observacao: texto || null }).eq('id', ambiente.id)
    }, 800)
  }

  const confirmarNome = async () => {
    setEditandoNome(false)
    const limpo = nome.trim()
    if (!limpo || limpo === ambiente.nome) { setNome(ambiente.nome); return }
    const supabase = createClient()
    await supabase.from('vistoria_ambientes').update({ nome: limpo }).eq('id', ambiente.id)
    // Mantém o rótulo do item em sincronia (é o que aparece no laudo).
    await supabase.from('vistoria_itens').update({ secao: limpo }).eq('ambiente_id', ambiente.id)
    onRenomear(ambiente.id, limpo)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      <div className="flex items-center gap-2">
        {editandoNome ? (
          <input
            autoFocus
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onBlur={confirmarNome}
            onKeyDown={(e) => { if (e.key === 'Enter') confirmarNome(); if (e.key === 'Escape') { setNome(ambiente.nome); setEditandoNome(false) } }}
            className="flex-1 border border-blue-400 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
          />
        ) : (
          <>
            <h2 className="font-semibold text-slate-900 text-sm uppercase tracking-wide flex-1">{ambiente.nome}</h2>
            <button type="button" onClick={() => setEditandoNome(true)} title="Renomear ambiente" className="text-slate-400 hover:text-slate-700 text-xs px-2">
              renomear
            </button>
          </>
        )}
        {confirmando ? (
          <span className="flex items-center gap-1">
            <button type="button" onClick={() => onRemover(ambiente.id)} className="text-xs text-white bg-red-600 rounded px-2 py-1 hover:bg-red-700">Excluir</button>
            <button type="button" onClick={() => setConfirmando(false)} className="text-xs text-slate-500 px-1">cancelar</button>
          </span>
        ) : (
          <button type="button" onClick={() => setConfirmando(true)} title="Remover ambiente" className="text-slate-300 hover:text-red-600 px-1">✕</button>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-slate-500 mb-1.5">Fotos do ambiente</p>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {fotos.map((foto) => (
            <div key={foto.id} className="relative shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
              {foto.signedUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={foto.signedUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full animate-pulse bg-slate-200" />
              )}
              <button type="button" onClick={() => removerFoto(foto)} className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full p-1" title="Remover foto">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={enviando}
            className="shrink-0 w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-400 flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[10px] mt-0.5">{enviando ? '...' : 'Foto'}</span>
          </button>
          <input ref={inputRef} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={(e) => { if (e.target.files?.length) enviarFotos(e.target.files) }} />
        </div>
      </div>

      <textarea
        value={observacao}
        onChange={(e) => salvarObservacao(e.target.value)}
        rows={2}
        placeholder="Observações gerais deste ambiente..."
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}
