'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { ImovelVistoria } from '@/types/vistoria'

const selectClass = 'border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white'

interface Props {
  imoveis: ImovelVistoria[]
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
      <select className={selectClass} value={searchParams.get('imovel') ?? ''} onChange={(e) => setParam('imovel', e.target.value)}>
        <option value="">Todos os imóveis</option>
        {imoveis.map((imovel) => (
          <option key={imovel.id} value={imovel.id}>{imovel.nome}</option>
        ))}
      </select>

      <select className={selectClass} value={searchParams.get('tipo') ?? ''} onChange={(e) => setParam('tipo', e.target.value)}>
        <option value="">Entrada e saída</option>
        <option value="entrada">Entrada</option>
        <option value="saida">Saída</option>
      </select>

      <select className={selectClass} value={searchParams.get('status') ?? ''} onChange={(e) => setParam('status', e.target.value)}>
        <option value="">Todos os status</option>
        <option value="rascunho">Rascunho</option>
        <option value="concluida">Concluída</option>
      </select>

      {(searchParams.get('imovel') || searchParams.get('tipo') || searchParams.get('status')) && (
        <button onClick={() => router.push('/admin/vistorias')} className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
          Limpar filtros
        </button>
      )}
    </div>
  )
}
