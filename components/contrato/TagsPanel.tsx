'use client'

import { useMemo, useState } from 'react'
import { type ContratoTagSistema, type GrupoTag, GRUPO_TAG_LABELS } from '@/types/contrato-tag'

interface Props {
  tags: ContratoTagSistema[]
  onInserir: (tag: ContratoTagSistema) => void
  disabled?: boolean
}

const ORDEM_GRUPOS: GrupoTag[] = ['proprietario', 'inquilino', 'imovel', 'contrato']

export default function TagsPanel({ tags, onInserir, disabled }: Props) {
  const [busca, setBusca] = useState('')

  const grupos = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const filtradas = termo
      ? tags.filter((t) => t.label.toLowerCase().includes(termo) || t.chave.toLowerCase().includes(termo))
      : tags
    return ORDEM_GRUPOS.map((g) => ({
      grupo: g,
      itens: filtradas.filter((t) => t.grupo === g).sort((a, b) => a.ordem - b.ordem),
    })).filter((x) => x.itens.length > 0)
  }, [tags, busca])

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-700">Tags disponíveis</h3>
        <p className="text-xs text-slate-400 mt-0.5">Clique para inserir no documento. Preenchem sozinhas ao gerar.</p>
      </div>

      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar tag..."
        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
        {grupos.map(({ grupo, itens }) => (
          <div key={grupo}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">{GRUPO_TAG_LABELS[grupo]}</p>
            <div className="flex flex-wrap gap-1">
              {itens.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  disabled={disabled}
                  onMouseDown={(e) => { e.preventDefault(); onInserir(t) }}
                  title={`{${t.chave}}`}
                  className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 rounded px-2 py-0.5 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        ))}
        {grupos.length === 0 && <p className="text-xs text-slate-400">Nenhuma tag encontrada.</p>}
      </div>

      <div className="border-t border-slate-100 pt-2">
        <p className="text-[11px] text-slate-500">
          Para o que o sistema não preenche, escreva <code className="bg-slate-100 rounded px-1">{'{PREENCHER algo}'}</code> no texto —
          fica como lembrete e é checado antes de tornar o contrato vigente.
        </p>
      </div>
    </div>
  )
}
