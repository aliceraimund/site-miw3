'use client'

import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  type Contrato,
  CONTRATO_TIPO_LABELS,
  CONTRATO_STATUS_LABELS,
  CONTRATO_STATUS_COLORS,
} from '@/types/contrato'

export type ContratoComRelacoes = Contrato & {
  imovel: { nome: string; endereco_completo: string } | null
  inquilino: { nome: string } | null
}

interface Props {
  contratos: ContratoComRelacoes[]
}

export default function AdminContratoList({ contratos }: Props) {
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
      {contratos.map((c) => (
        <Link
          key={c.id}
          href={`/admin/gestao/contratos/${c.id}`}
          className="block bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CONTRATO_STATUS_COLORS[c.status]}`}>
                  {CONTRATO_STATUS_LABELS[c.status]}
                </span>
                <span className="text-xs text-slate-500">{CONTRATO_TIPO_LABELS[c.tipo]}</span>
              </div>
              <p className="font-semibold text-slate-900 truncate">{c.imovel?.nome ?? 'Imóvel removido'}</p>
              <p className="text-sm text-slate-500 truncate">
                Inquilino: {c.inquilino?.nome ?? '—'}
              </p>
            </div>
            <div className="flex flex-col sm:items-end shrink-0 text-sm">
              {c.valor_aluguel != null && (
                <span className="font-semibold text-slate-900">{formatCurrency(c.valor_aluguel)}/mês</span>
              )}
              <span className="text-xs text-slate-500">
                Início {formatDate(c.data_inicio)}
                {c.data_fim ? ` · Fim ${formatDate(c.data_fim)}` : ''}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
