'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import RetryImage from '@/components/RetryImage'
import type { Imovel } from '@/types/imovel'

interface Props {
  imoveis: Imovel[]
}

const CATEGORIA_LABELS: Record<string, string> = {
  residencial: 'Residencial',
  comercial: 'Comercial',
  industrial: 'Industrial',
}

export default function AdminOrdenarList({ imoveis: initialImoveis }: Props) {
  const [imoveis, setImoveis] = useState(initialImoveis)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const persist = async (next: Imovel[]) => {
    setSaving(true)
    setSaved(false)
    const supabase = createClient()
    await Promise.all(
      next
        .map((imovel, i) =>
          imovel.ordem === i ? null : supabase.from('imoveis').update({ ordem: i }).eq('id', imovel.id)
        )
        .filter(Boolean)
    )
    setImoveis(next.map((imovel, i) => ({ ...imovel, ordem: i })))
    setSaving(false)
    setSaved(true)
  }

  const move = (from: number, to: number) => {
    if (saving || to < 0 || to >= imoveis.length || from === to) return
    const next = [...imoveis]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setImoveis(next)
    void persist(next)
  }

  if (imoveis.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <p className="text-slate-500">Nenhum imóvel cadastrado.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Arraste os anúncios para a posição desejada — no celular, use as setas. A ordem é salva automaticamente.
        </p>
        <span className={`text-xs font-medium shrink-0 ml-4 ${saving ? 'text-blue-600' : saved ? 'text-green-600' : 'text-transparent'}`}>
          {saving ? 'Salvando...' : 'Ordem salva ✓'}
        </span>
      </div>

      {imoveis.map((imovel, i) => (
        <div
          key={imovel.id}
          draggable
          onDragStart={() => setDragIndex(i)}
          onDragOver={(e) => {
            e.preventDefault()
            if (overIndex !== i) setOverIndex(i)
          }}
          onDrop={(e) => {
            e.preventDefault()
            if (dragIndex !== null && dragIndex !== i) move(dragIndex, i)
            setDragIndex(null)
            setOverIndex(null)
          }}
          onDragEnd={() => {
            setDragIndex(null)
            setOverIndex(null)
          }}
          className={`bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-3 cursor-grab active:cursor-grabbing transition-opacity ${
            dragIndex === i ? 'opacity-40' : ''
          } ${overIndex === i && dragIndex !== null && dragIndex !== i ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
        >
          <span className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">
            {i + 1}
          </span>

          <div className="relative w-16 h-12 shrink-0 rounded-lg overflow-hidden bg-slate-100">
            {imovel.fotos?.[0] && (
              <RetryImage
                src={imovel.fotos[0]}
                alt={imovel.nome}
                fill
                unoptimized
                draggable={false}
                className="object-cover"
                sizes="64px"
                fallback={
                  <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                }
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 text-sm truncate">{imovel.nome}</p>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-500">{CATEGORIA_LABELS[imovel.categoria] ?? imovel.categoria}</span>
              {imovel.destaque && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">Destaque</span>
              )}
              {!imovel.publicado && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">Não publicado</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1 shrink-0">
            <button
              type="button"
              onClick={() => move(i, i - 1)}
              disabled={i === 0 || saving}
              title="Mover para cima"
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => move(i, i + 1)}
              disabled={i === imoveis.length - 1 || saving}
              title="Mover para baixo"
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
