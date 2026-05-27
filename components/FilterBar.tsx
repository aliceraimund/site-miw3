'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

interface Props {
  tipos: string[]
}

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'disponivel', label: 'Disponível' },
  { value: 'em_reforma', label: 'Em reforma' },
  { value: 'reservado', label: 'Reservado' },
]

const DISPONIVEL_OPTIONS = [
  { value: '', label: 'Venda e Locação' },
  { value: 'venda', label: 'Apenas Venda' },
  { value: 'locacao', label: 'Apenas Locação' },
  { value: 'ambos', label: 'Venda ou Locação' },
]

export default function FilterBar({ tipos }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  const handleChange = (name: string, value: string) => {
    router.push(`${pathname}?${createQueryString(name, value)}`)
  }

  const hasFilters = searchParams.toString() !== ''

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-8 shadow-sm">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Status
          </label>
          <select
            value={searchParams.get('status') ?? ''}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Modalidade
          </label>
          <select
            value={searchParams.get('disponivel_para') ?? ''}
            onChange={(e) => handleChange('disponivel_para', e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {DISPONIVEL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Tipo
          </label>
          <select
            value={searchParams.get('tipo') ?? ''}
            onChange={(e) => handleChange('tipo', e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os tipos</option>
            {tipos.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <button
            onClick={() => router.push(pathname)}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  )
}
