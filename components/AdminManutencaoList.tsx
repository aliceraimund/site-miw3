'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { type Manutencao, MANUTENCAO_STATUS_LABELS, MANUTENCAO_STATUS_COLORS, type ManutencaoStatus } from '@/types/manutencao'

export type ManutencaoComImovel = Manutencao & {
  imovel: { nome: string } | null
}

interface Props {
  manutencoes: ManutencaoComImovel[]
}

const FILTROS: { key: ManutencaoStatus | 'todos'; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'aberto', label: 'Abertos' },
  { key: 'em_andamento', label: 'Em andamento' },
  { key: 'concluido', label: 'Concluídos' },
  { key: 'cancelado', label: 'Cancelados' },
]

export default function AdminManutencaoList({ manutencoes }: Props) {
  const [filtro, setFiltro] = useState<ManutencaoStatus | 'todos'>('todos')

  const filtradas = useMemo(
    () => (filtro === 'todos' ? manutencoes : manutencoes.filter((m) => m.status === filtro)),
    [manutencoes, filtro]
  )

  if (manutencoes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <p className="text-slate-500">Nenhum chamado de manutenção.</p>
        <Link href="/admin/gestao/manutencoes/novo" className="mt-4 inline-block text-blue-600 hover:underline text-sm">
          Abrir primeiro chamado
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 overflow-x-auto">
        {FILTROS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filtro === f.key ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtradas.map((m) => (
          <Link
            key={m.id}
            href={`/admin/gestao/manutencoes/${m.id}`}
            className="block bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${MANUTENCAO_STATUS_COLORS[m.status]}`}>
                    {MANUTENCAO_STATUS_LABELS[m.status]}
                  </span>
                  <span className="text-xs text-slate-500">{m.imovel?.nome ?? 'Imóvel removido'}</span>
                </div>
                <p className="font-semibold text-slate-900 truncate">{m.titulo}</p>
                {m.prestador && <p className="text-sm text-slate-500 truncate">Prestador: {m.prestador}</p>}
              </div>
              <div className="flex flex-col sm:items-end shrink-0 text-sm">
                {m.custo_referencia != null && (
                  <span className="font-semibold text-slate-900">{formatCurrency(m.custo_referencia)}</span>
                )}
                <span className="text-xs text-slate-500">Aberto {formatDate(m.data_abertura)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
