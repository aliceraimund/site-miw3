'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  type Contrato,
  CONTRATO_STATUS_LABELS,
  CONTRATO_STATUS_COLORS,
} from '@/types/contrato'
import { proximoAniversarioReajuste, formatarMesAno, diasAte, codigoContrato } from '@/lib/contrato/datas'

export type ContratoComRelacoes = Contrato & {
  imovel: { nome: string; endereco_completo: string } | null
  inquilino: { nome: string } | null
}

interface Props {
  contratos: ContratoComRelacoes[]
}

const FILTROS = [
  { key: '', label: 'Todos' },
  { key: 'rascunho', label: 'Rascunho' },
  { key: 'vigente', label: 'Vigentes' },
  { key: 'rescindido', label: 'Rescindidos' },
]

export default function AdminContratoList({ contratos }: Props) {
  const [filtro, setFiltro] = useState('')
  const [busca, setBusca] = useState('')

  // 'ativo'/'renovado' legados contam como vigentes; 'encerrado' como rescindido.
  const normalizar = (s: string) =>
    s === 'ativo' || s === 'renovado' ? 'vigente' : s === 'encerrado' ? 'rescindido' : s

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return contratos
      .filter((c) => !filtro || normalizar(c.status) === filtro)
      .filter((c) =>
        !termo ||
        (c.inquilino?.nome ?? '').toLowerCase().includes(termo) ||
        (c.imovel?.nome ?? '').toLowerCase().includes(termo) ||
        codigoContrato(c.id).toLowerCase().includes(termo)
      )
  }, [contratos, filtro, busca])

  if (contratos.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <p className="text-slate-500">Nenhum contrato cadastrado.</p>
        <Link href="/admin/gestao/contratos/novo" className="mt-4 inline-block text-blue-600 hover:underline text-sm">
          Criar primeiro contrato
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1">
          {FILTROS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filtro === f.key ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por código, inquilino ou imóvel..."
          className="sm:ml-auto w-full sm:w-72 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs">
            <tr>
              <th className="text-left px-3 py-2">Código</th>
              <th className="text-left px-3 py-2">Inquilino</th>
              <th className="text-left px-3 py-2">Imóvel</th>
              <th className="text-center px-3 py-2">Dia da cobrança</th>
              <th className="text-left px-3 py-2">Próximo aniversário</th>
              <th className="text-left px-3 py-2">Vencimento</th>
              <th className="text-left px-3 py-2">Situação</th>
              <th className="text-right px-3 py-2">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtrados.map((c) => {
              const dias = diasAte(c.data_fim)
              const vencendo = dias != null && dias >= 0 && dias <= 90
              const vencido = dias != null && dias < 0
              return (
                <tr key={c.id} className="text-slate-700 hover:bg-slate-50">
                  <td className="px-3 py-2 font-mono text-xs text-slate-500">{codigoContrato(c.id)}</td>
                  <td className="px-3 py-2 font-medium text-slate-900">{c.inquilino?.nome ?? '—'}</td>
                  <td className="px-3 py-2 max-w-[220px] truncate" title={c.imovel?.endereco_completo}>{c.imovel?.nome ?? '—'}</td>
                  <td className="px-3 py-2 text-center">{c.dia_vencimento ?? '—'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{formatarMesAno(proximoAniversarioReajuste(c))}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {c.data_fim ? (
                      <span className={vencido ? 'text-red-600 font-medium' : vencendo ? 'text-amber-700 font-medium' : ''}>
                        {formatDate(c.data_fim)}
                        {vencendo && <span className="text-xs"> · {dias}d</span>}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CONTRATO_STATUS_COLORS[c.status]}`}>
                      {CONTRATO_STATUS_LABELS[c.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    {c.valor_aluguel != null && <span className="text-xs text-slate-400 mr-3">{formatCurrency(c.valor_aluguel)}</span>}
                    <Link href={`/admin/gestao/contratos/${c.id}`} className="text-xs text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50">
                      Abrir
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtrados.length === 0 && <p className="text-sm text-slate-400 p-6 text-center">Nenhum contrato para este filtro.</p>}
      </div>
    </div>
  )
}
