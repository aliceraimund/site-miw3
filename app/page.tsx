import { Suspense } from 'react'
import Image from 'next/image'
import { createServerClient } from '@/lib/supabase/server'
import ImovelCard from '@/components/ImovelCard'
import WhatsAppFloat from '@/components/WhatsAppFloat'
import type { Imovel } from '@/types/imovel'

interface SearchParams {
  categoria?: string
  disponivel_para?: string
}

const CATEGORIAS = [
  {
    keys: ['residencial'],
    tabKey: 'residencial',
    label: 'Residencial',
    desc: 'Apartamentos, casas e imóveis para investimento',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    keys: ['comercial', 'industrial'],
    tabKey: 'comercial',
    label: 'Comercial / Industrial',
    desc: 'Salas, lojas, galpões, terrenos e áreas logísticas',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
]

const DISPONIVEL_TABS = [
  { key: '', label: 'Todos' },
  { key: 'venda', label: 'Venda' },
  { key: 'locacao', label: 'Locação' },
  { key: 'ambos', label: 'Venda e Locação' },
]

function buildUrl(params: Record<string, string>) {
  const filtered = Object.entries(params).filter(([, v]) => v !== '')
  if (filtered.length === 0) return '/'
  return '/?' + filtered.map(([k, v]) => `${k}=${v}`).join('&')
}

async function CategoriaSection({
  categoria,
  activeCat,
  activeDisp,
}: {
  categoria: typeof CATEGORIAS[0]
  activeCat: string
  activeDisp: string
}) {
  if (activeCat && activeCat !== categoria.tabKey) return null

  const supabase = await createServerClient()

  let query = supabase
    .from('imoveis')
    .select('*')
    .in('categoria', categoria.keys)
    .order('destaque', { ascending: false })
    .order('criado_em', { ascending: false })

  if (activeDisp) {
    query = query.eq('disponivel_para', activeDisp)
  }

  const { data: imoveis } = await query

  if (!imoveis || imoveis.length === 0) return null

  return (
    <section className="mb-14">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 shrink-0">
          {categoria.icon}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{categoria.label}</h2>
          <p className="text-sm text-slate-500">{categoria.desc}</p>
        </div>
        <span className="ml-auto text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
          {imoveis.length} {imoveis.length === 1 ? 'imóvel' : 'imóveis'}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {imoveis.map((imovel: Imovel) => (
          <ImovelCard key={imovel.id} imovel={imovel} />
        ))}
      </div>
    </section>
  )
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const activeCat = sp.categoria ?? ''
  const activeDisp = sp.disponivel_para ?? ''

  return (
    <div>
      {/* Hero */}
      <div className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-slate-900 to-slate-900" />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 flex flex-col md:flex-row md:items-center md:justify-between gap-10">
          <div className="flex-1">
            <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3">Portfólio MIW3</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Encontre o imóvel ideal para você
            </h1>
            <p className="mt-4 text-slate-400 text-lg leading-relaxed">
              Apartamentos, galpões, salas, lojas e terrenos para venda e locação.
            </p>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Imóveis selecionados</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Atendimento personalizado</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Venda e locação</span>
            </div>
          </div>
          <div className="flex-shrink-0 flex items-center justify-center">
            <a href="/">
              <Image src="/logo-miw3.png" alt="MIW3" width={420} height={180} className="w-72 md:w-96 lg:w-[420px] h-auto" />
            </a>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Row 1: Categoria */}
          <div className="flex gap-1 overflow-x-auto pt-3 pb-2 border-b border-slate-100">
            <a href={buildUrl({ disponivel_para: activeDisp })}
              className={`shrink-0 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${!activeCat ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              Todos
            </a>
            {CATEGORIAS.map((c) => (
              <a key={c.tabKey}
                href={buildUrl({ categoria: c.tabKey, disponivel_para: activeDisp })}
                className={`shrink-0 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeCat === c.tabKey ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                {c.label}
              </a>
            ))}
          </div>

          {/* Row 2: Disponibilidade */}
          <div className="flex gap-1 overflow-x-auto py-2">
            {DISPONIVEL_TABS.map((t) => (
              <a key={t.key}
                href={buildUrl({ categoria: activeCat, disponivel_para: t.key })}
                className={`shrink-0 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeDisp === t.key ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                {t.label}
              </a>
            ))}
          </div>

        </div>
      </div>

      {/* Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Suspense fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-xl h-80 animate-pulse shadow-sm" />)}
          </div>
        }>
          {CATEGORIAS.map((cat) => (
            <CategoriaSection key={cat.tabKey} categoria={cat} activeCat={activeCat} activeDisp={activeDisp} />
          ))}
        </Suspense>
      </div>

      <WhatsAppFloat message="Olá! Vi o portfólio da MIW3 e queria saber mais!" />
    </div>
  )
}
