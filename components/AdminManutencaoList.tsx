'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { type Manutencao, type ManutencaoStatus, MANUTENCAO_STATUS_LABELS } from '@/types/manutencao'

export type ManutencaoComImovel = Manutencao & {
  imovel: { nome: string } | null
}

interface Props {
  manutencoes: ManutencaoComImovel[]
}

const COLUNAS: { key: ManutencaoStatus; header: string; dot: string }[] = [
  { key: 'aberto', header: 'Aberto', dot: 'bg-amber-500' },
  { key: 'em_andamento', header: 'Em andamento', dot: 'bg-blue-500' },
  { key: 'concluido', header: 'Concluído', dot: 'bg-green-500' },
  { key: 'cancelado', header: 'Cancelado', dot: 'bg-slate-400' },
]

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function mesCorrente() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function AdminManutencaoList({ manutencoes: initial }: Props) {
  const router = useRouter()
  const [manutencoes, setManutencoes] = useState(initial)
  const [dragId, setDragId] = useState<string | null>(null)
  const [overCol, setOverCol] = useState<ManutencaoStatus | null>(null)
  const [filtroImovel, setFiltroImovel] = useState('')
  const [mes, setMes] = useState(mesCorrente())

  // Imóveis distintos presentes nos chamados (para o filtro).
  const imoveisOpts = useMemo(() => {
    const m = new Map<string, string>()
    for (const c of manutencoes) if (c.imovel?.nome) m.set(c.imovel_id, c.imovel.nome)
    return [...m.entries()].map(([id, nome]) => ({ id, nome })).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  }, [manutencoes])

  const filtradas = useMemo(
    () => (filtroImovel ? manutencoes.filter((m) => m.imovel_id === filtroImovel) : manutencoes),
    [manutencoes, filtroImovel]
  )

  const porStatus = useMemo(() => {
    const mapa: Record<ManutencaoStatus, ManutencaoComImovel[]> = { aberto: [], em_andamento: [], concluido: [], cancelado: [] }
    for (const m of filtradas) mapa[m.status].push(m)
    return mapa
  }, [filtradas])

  // Totais do mês selecionado (recalculados no cliente conforme os filtros).
  const totais = useMemo(() => {
    let estimado = 0
    let real = 0
    for (const m of filtradas) {
      if (m.data_inicio?.startsWith(mes) && m.custo_estimado != null) estimado += m.custo_estimado
      // custo_real ausente NÃO entra no total real
      if (m.data_conclusao_real?.startsWith(mes) && m.custo_real != null) real += m.custo_real
    }
    return { estimado, real }
  }, [filtradas, mes])

  const mover = async (id: string, novo: ManutencaoStatus) => {
    const atual = manutencoes.find((m) => m.id === id)
    if (!atual || atual.status === novo) return

    setManutencoes((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: novo, data_conclusao_real: novo === 'concluido' ? (m.data_conclusao_real ?? todayISO()) : m.data_conclusao_real }
          : m
      )
    )

    const supabase = createClient()
    const patch: { status: ManutencaoStatus; atualizado_em: string; data_conclusao_real?: string } = {
      status: novo,
      atualizado_em: new Date().toISOString(),
    }
    if (novo === 'concluido' && !atual.data_conclusao_real) patch.data_conclusao_real = todayISO()
    await supabase.from('manutencoes').update(patch).eq('id', id)
  }

  if (manutencoes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <p className="text-slate-500">Nenhum chamado de manutenção.</p>
        <Link href="/admin/manutencoes/novo" className="mt-4 inline-block text-blue-600 hover:underline text-sm">
          Abrir primeiro chamado
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3 mb-3">
        <label className="text-xs text-slate-500">
          Imóvel
          <select value={filtroImovel} onChange={(e) => setFiltroImovel(e.target.value)} className="block mt-0.5 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Todos</option>
            {imoveisOpts.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}
          </select>
        </label>
        <label className="text-xs text-slate-500">
          Mês (para os totais)
          <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} className="block mt-0.5 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </label>
        <p className="text-xs text-slate-400 ml-auto self-center">Arraste os cards entre as colunas para mudar o status — no celular, use o seletor no rodapé de cada card.</p>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {COLUNAS.map((col) => {
          const cards = porStatus[col.key]
          return (
            <div
              key={col.key}
              onDragOver={(e) => {
                e.preventDefault()
                if (overCol !== col.key) setOverCol(col.key)
              }}
              onDrop={(e) => {
                e.preventDefault()
                if (dragId) mover(dragId, col.key)
                setDragId(null)
                setOverCol(null)
              }}
              className={`shrink-0 w-72 rounded-xl p-3 transition-colors ${
                overCol === col.key && dragId ? 'bg-blue-50 ring-2 ring-blue-300' : 'bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2 px-1 mb-3">
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                <h2 className="text-sm font-semibold text-slate-700">{col.header}</h2>
                <span className="ml-auto text-xs font-medium text-slate-400">{cards.length}</span>
              </div>

              <div className="space-y-2 min-h-[40px]">
                {cards.map((m) => (
                  <div
                    key={m.id}
                    draggable
                    onDragStart={() => setDragId(m.id)}
                    onDragEnd={() => {
                      setDragId(null)
                      setOverCol(null)
                    }}
                    onClick={() => router.push(`/admin/manutencoes/${m.id}`)}
                    className={`bg-white rounded-lg border border-slate-200 p-3 cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all ${
                      dragId === m.id ? 'opacity-40' : ''
                    }`}
                  >
                    <p className="font-semibold text-slate-900 text-sm leading-snug mb-1">{m.titulo}</p>
                    <p className="text-xs text-slate-500 truncate">{m.imovel?.nome ?? 'Imóvel removido'}</p>
                    {m.prestador && <p className="text-xs text-slate-400 truncate mt-0.5">{m.prestador}</p>}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-400">{formatDate(m.data_abertura)}</span>
                      {m.custo_estimado != null && (
                        <span className="text-xs font-semibold text-slate-700">{formatCurrency(m.custo_estimado)}</span>
                      )}
                    </div>
                    <select
                      value={m.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => mover(m.id, e.target.value as ManutencaoStatus)}
                      className="mt-2 w-full text-xs border border-slate-200 rounded-md px-2 py-1 text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:hidden"
                    >
                      {COLUNAS.map((c) => (
                        <option key={c.key} value={c.key}>{MANUTENCAO_STATUS_LABELS[c.key]}</option>
                      ))}
                    </select>
                  </div>
                ))}
                {cards.length === 0 && <p className="text-xs text-slate-400 px-1 py-2">Nenhum chamado</p>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Rodapé de totais do mês selecionado */}
      <div className="mt-4 bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
        <div>
          <p className="text-xs text-slate-500">Custo Total Estimado desse mês</p>
          <p className="text-lg font-bold text-slate-900">{formatCurrency(totais.estimado)}</p>
          <p className="text-[11px] text-slate-400">chamados com início em {mes}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Custo Total Real desse mês</p>
          <p className="text-lg font-bold text-slate-900">{formatCurrency(totais.real)}</p>
          <p className="text-[11px] text-slate-400">chamados concluídos em {mes} (só com custo real preenchido)</p>
        </div>
      </div>
    </div>
  )
}
