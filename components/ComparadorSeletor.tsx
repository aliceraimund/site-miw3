'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { ImovelVistoria, Vistoria } from '@/types/vistoria'
import { formatDate } from '@/lib/utils'

const selectClass = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-slate-50 disabled:text-slate-400'

interface Props {
  imoveis: ImovelVistoria[]
  vistoriasDoImovel: Vistoria[]
}

export default function ComparadorSeletor({ imoveis, vistoriasDoImovel }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const imovelId = searchParams.get('imovel') ?? ''

  const entradas = vistoriasDoImovel.filter((v) => v.tipo_vistoria === 'entrada')
  const saidas = vistoriasDoImovel.filter((v) => v.tipo_vistoria === 'saida')

  const setImovel = (id: string) => {
    const params = new URLSearchParams()
    if (id) params.set('imovel', id)
    router.push(`/admin/vistorias/comparar?${params.toString()}`)
  }

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/admin/vistorias/comparar?${params.toString()}`)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Imóvel</label>
        <select value={imovelId} onChange={(e) => setImovel(e.target.value)} className={selectClass}>
          <option value="">Selecione...</option>
          {imoveis.map((i) => (
            <option key={i.id} value={i.id}>{i.nome}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Vistoria de entrada</label>
        <select value={searchParams.get('entrada') ?? ''} onChange={(e) => setParam('entrada', e.target.value)} disabled={!imovelId} className={selectClass}>
          <option value="">Selecione...</option>
          {entradas.map((v) => (
            <option key={v.id} value={v.id}>{formatDate(v.data)}</option>
          ))}
        </select>
        {imovelId && entradas.length === 0 && <p className="text-xs text-slate-400 mt-1">Nenhuma vistoria de entrada para este imóvel.</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Vistoria de saída</label>
        <select value={searchParams.get('saida') ?? ''} onChange={(e) => setParam('saida', e.target.value)} disabled={!imovelId} className={selectClass}>
          <option value="">Selecione...</option>
          {saidas.map((v) => (
            <option key={v.id} value={v.id}>{formatDate(v.data)}</option>
          ))}
        </select>
        {imovelId && saidas.length === 0 && <p className="text-xs text-slate-400 mt-1">Nenhuma vistoria de saída para este imóvel.</p>}
      </div>
    </div>
  )
}
