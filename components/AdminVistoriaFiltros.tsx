'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { ImovelVistoria } from '@/types/vistoria'

const selectClass = 'appearance-none border border-slate-300 rounded-lg pl-3 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer'

interface Props {
  imoveis: ImovelVistoria[]
}

function SelectFiltro({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div className="relative">
      <select className={selectClass} value={value} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
      <svg className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}

export default function AdminVistoriaFiltros({ imoveis }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/admin/vistorias?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <SelectFiltro value={searchParams.get('imovel') ?? ''} onChange={(v) => setParam('imovel', v)}>
        <option value="">Todos os imóveis</option>
        {imoveis.map((imovel) => (
          <option key={imovel.id} value={imovel.id}>{imovel.nome}</option>
        ))}
      </SelectFiltro>

      <SelectFiltro value={searchParams.get('tipo') ?? ''} onChange={(v) => setParam('tipo', v)}>
        <option value="">Entrada e saída</option>
        <option value="entrada">Entrada</option>
        <option value="saida">Saída</option>
      </SelectFiltro>

      <SelectFiltro value={searchParams.get('status') ?? ''} onChange={(v) => setParam('status', v)}>
        <option value="">Todos os status</option>
        <option value="rascunho">Rascunho</option>
        <option value="concluida">Concluída</option>
      </SelectFiltro>

      {(searchParams.get('imovel') || searchParams.get('tipo') || searchParams.get('status')) && (
        <button onClick={() => router.push('/admin/vistorias')} className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
          Limpar filtros
        </button>
      )}
    </div>
  )
}
