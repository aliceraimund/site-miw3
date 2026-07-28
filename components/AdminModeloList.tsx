'use client'

import Link from 'next/link'
import type { ModeloContrato } from '@/types/modelo-contrato'

const CATEGORIA_LABELS: Record<string, string> = { residencial: 'Residencial', comercial: 'Comercial', industrial: 'Industrial' }

export default function AdminModeloList({ modelos }: { modelos: ModeloContrato[] }) {
  if (modelos.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <p className="text-slate-500">Nenhum modelo de contrato.</p>
        <Link href="/admin/gestao/contratos/modelos/novo" className="mt-4 inline-block text-blue-600 hover:underline text-sm">
          Criar primeiro modelo
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {modelos.map((m) => (
        <Link key={m.id} href={`/admin/gestao/contratos/modelos/${m.id}`} className="block bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <code className="text-xs text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">{m.codigo}</code>
                {m.categoria && <span className="text-xs text-slate-500">{CATEGORIA_LABELS[m.categoria] ?? m.categoria}</span>}
                {!m.ativo && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Inativo</span>}
              </div>
              <p className="font-semibold text-slate-900 truncate">{m.nome}</p>
              {m.descricao && <p className="text-sm text-slate-500 truncate">{m.descricao}</p>}
            </div>
            <svg className="w-5 h-5 text-slate-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </div>
        </Link>
      ))}
    </div>
  )
}
