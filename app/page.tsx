import { Suspense } from 'react'
import { createServerClient } from '@/lib/supabase/server'
import ImovelCard from '@/components/ImovelCard'
import FilterBar from '@/components/FilterBar'
import type { Imovel } from '@/types/imovel'

interface SearchParams {
  status?: string
  disponivel_para?: string
  tipo?: string
}

async function ImovelGrid({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createServerClient()

  let query = supabase
    .from('imoveis')
    .select('*')
    .order('destaque', { ascending: false })
    .order('criado_em', { ascending: false })

  if (searchParams.status) {
    query = query.eq('status', searchParams.status)
  }
  if (searchParams.disponivel_para) {
    query = query.eq('disponivel_para', searchParams.disponivel_para)
  }
  if (searchParams.tipo) {
    query = query.eq('tipo', searchParams.tipo)
  }

  const { data: imoveis } = await query

  if (!imoveis || imoveis.length === 0) {
    return (
      <div className="text-center py-20">
        <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <p className="text-slate-500 text-lg">Nenhum imóvel encontrado com os filtros selecionados.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {imoveis.map((imovel: Imovel) => (
        <ImovelCard key={imovel.id} imovel={imovel} />
      ))}
    </div>
  )
}

async function TiposLoader({ children }: { children: (tipos: string[]) => React.ReactNode }) {
  const supabase = await createServerClient()
  const { data } = await supabase.from('imoveis').select('tipo')
  const tipos = [...new Set((data ?? []).map((d: { tipo: string }) => d.tipo))].sort()
  return <>{children(tipos)}</>
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams

  return (
    <div>
      {/* Hero */}
      <div className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-slate-900 to-slate-900" />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3">Portfólio MIW3</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight max-w-2xl">
            Encontre o Imóvel Certo para o Seu Negócio
          </h1>
          <p className="mt-4 text-slate-400 text-lg max-w-xl leading-relaxed">
            Apartamentos, galpões, salas, lojas e terrenos para venda e locação.
          </p>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              Imóveis selecionados
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              Atendimento personalizado
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              Venda e locação
            </span>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Suspense fallback={<div className="h-20 bg-white rounded-xl animate-pulse mb-8" />}>
          <TiposLoader>
            {(tipos) => (
              <Suspense>
                <FilterBar tipos={tipos} />
              </Suspense>
            )}
          </TiposLoader>
        </Suspense>

        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-80 animate-pulse shadow-sm" />
              ))}
            </div>
          }
        >
          <ImovelGrid searchParams={sp} />
        </Suspense>
      </div>
    </div>
  )
}
