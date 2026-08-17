import { Suspense } from 'react'
import Image from 'next/image'
import { createServerClient } from '@/lib/supabase/server'
import ImovelCard from '@/components/ImovelCard'
import WhatsAppFloat from '@/components/WhatsAppFloat'
import FilterTabs from '@/components/FilterTabs'
import { formatTitulo } from '@/lib/utils'
import type { Imovel } from '@/types/imovel'
import { ORIGEM_LABELS } from '@/types/imovel'

interface SearchParams {
  categoria?: string
  disponivel_para?: string
  cidade?: string
  origem?: string
  q?: string
}

// Chave de agrupamento: ignora maiúsculas, acentos, vírgulas e o sufixo do estado (", SP").
function chaveCidade(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s+(sp|sao paulo)$/, '')
    .trim()
}

// Agrupa as cidades cadastradas (que podem estar escritas de formas diferentes) em
// grupos com um rótulo canônico e todas as variações que existem no banco.
async function getCidadeGrupos(): Promise<{ label: string; variants: string[] }[]> {
  const supabase = await createServerClient()
  const { data } = await supabase.from('imoveis').select('cidade').eq('publicado', true)
  const raw = (data ?? []).map((r) => r.cidade).filter(Boolean) as string[]

  const grupos = new Map<string, string[]>()
  for (const cidade of raw) {
    const chave = chaveCidade(cidade)
    if (!chave) continue
    if (!grupos.has(chave)) grupos.set(chave, [])
    const arr = grupos.get(chave)!
    if (!arr.includes(cidade)) arr.push(cidade)
  }

  const escolherRotulo = (variants: string[]): string => {
    const semVirgula = variants.filter((v) => !v.includes(','))
    const pool1 = semVirgula.length ? semVirgula : variants
    const naoMaiusculo = pool1.filter((v) => v !== v.toUpperCase())
    const pool2 = naoMaiusculo.length ? naoMaiusculo : pool1
    return [...pool2].sort((a, b) => a.length - b.length)[0]
  }

  return [...grupos.values()]
    // O rótulo é sempre normalizado: "SÃO CAETANO DO SUL" vira "São Caetano do Sul".
    .map((variants) => ({ label: formatTitulo(escolherRotulo(variants)), variants }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
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

async function Listings({
  activeCat,
  activeDisp,
  activeCidade,
  activeOrigem,
  activeQ,
}: {
  activeCat: string
  activeDisp: string
  activeCidade: string
  activeOrigem: string
  activeQ: string
}) {
  const categoria = CATEGORIAS.find((c) => c.tabKey === activeCat)

  const supabase = await createServerClient()

  let query = supabase
    .from('imoveis')
    .select('*')
    .eq('publicado', true)
    .order('ordem', { ascending: true, nullsFirst: false })
    .order('destaque', { ascending: false })
    .order('criado_em', { ascending: false })

  if (categoria) {
    query = query.in('categoria', categoria.keys)
  }

  if (activeOrigem === 'propria' || activeOrigem === 'parceiro') {
    query = query.eq('origem', activeOrigem)
  }

  if (activeCidade) {
    // activeCidade é o rótulo canônico; casa com todas as variações escritas no banco.
    const grupos = await getCidadeGrupos()
    const grupo = grupos.find((g) => g.label === activeCidade)
    const variants = grupo?.variants ?? [activeCidade]
    query = query.in('cidade', variants)
  }

  // Busca por texto em nome, cidade, bairro, tipo e endereço.
  const termo = activeQ.replace(/[,()%*\\]/g, ' ').trim()
  if (termo) {
    const like = `%${termo}%`
    query = query.or(
      `nome.ilike.${like},cidade.ilike.${like},bairro.ilike.${like},tipo.ilike.${like},endereco_completo.ilike.${like}`
    )
  }

  if (activeDisp === 'venda') {
    query = query.or('disponivel_para.eq.venda,disponivel_para.eq.ambos')
  } else if (activeDisp === 'locacao') {
    query = query.or('disponivel_para.eq.locacao,disponivel_para.eq.ambos')
  } else if (activeDisp === 'ambos') {
    query = query.eq('disponivel_para', 'ambos')
  }

  const { data: imoveis } = await query

  if (!imoveis || imoveis.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <p className="text-slate-500">
          {activeQ || activeCidade
            ? 'Nenhum imóvel encontrado para esta busca. Tente outros termos ou remova os filtros.'
            : 'Nenhum imóvel encontrado para este filtro.'}
        </p>
      </div>
    )
  }

  return (
    <section className="mb-14">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 shrink-0">
          {categoria ? categoria.icon : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {activeQ ? `Resultados para "${activeQ}"` : activeCidade ? `Imóveis em ${activeCidade}` : categoria ? categoria.label : 'Todos os imóveis'}
          </h2>
          <p className="text-sm text-slate-500">
            {activeOrigem === 'propria'
              ? ORIGEM_LABELS.propria
              : activeOrigem === 'parceiro'
                ? ORIGEM_LABELS.parceiro
                : categoria
                  ? categoria.desc
                  : 'Residenciais, comerciais e industriais para venda e locação'}
          </p>
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
  const activeCidade = sp.cidade ?? ''
  const activeOrigem = sp.origem ?? ''
  const activeQ = sp.q ?? ''
  const cidades = (await getCidadeGrupos()).map((g) => g.label)

  return (
    <div>
      {/* Hero */}
      <div className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/hero-bg.png" alt="" fill className="object-cover object-center" sizes="100vw" priority />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24 flex flex-col md:flex-row md:items-center gap-12">
          <div className="flex-1">
            <p className="text-blue-400 text-xs font-bold uppercase tracking-[0.2em] mb-5">Portfólio MIW3</p>
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-[1.1]">
              Encontre o<br />
              <span className="text-blue-500">Imóvel Ideal</span>
            </h1>
            <div className="w-14 h-0.5 bg-blue-500 mt-5 mb-6" />
            <p className="text-slate-400 text-lg leading-relaxed max-w-md">
              Apartamentos, galpões, salas, lojas e terrenos para venda e locação.
            </p>

            {/* Category icon strip */}
            <div className="mt-10 flex flex-wrap items-center gap-0">
              {[
                { label: 'Residencial', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
                { label: 'Comercial', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /> },
                { label: 'Industrial', icon: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 21h14a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2z" /></> },
                { label: 'Terrenos', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /> },
              ].map((cat, i, arr) => (
                <div key={cat.label} className="flex items-center">
                  <div className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-blue-400 transition-colors cursor-default">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {cat.icon}
                    </svg>
                    <span className="text-sm font-medium">{cat.label}</span>
                  </div>
                  {i < arr.length - 1 && <span className="text-slate-700 text-lg select-none">|</span>}
                </div>
              ))}
            </div>

            <div className="mt-6">
              <a
                href="/admin/login"
                className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-slate-200 hover:text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.105.895-2 2-2s2 .895 2 2v2H8v-2c0-1.105.895-2 2-2m2-6a4 4 0 100 8 4 4 0 000-8zM5 21h14a1 1 0 001-1v-5a2 2 0 00-2-2H6a2 2 0 00-2 2v5a1 1 0 001 1z" />
                </svg>
                Área administrativa
              </a>
            </div>
          </div>

          <div className="flex-shrink-0 flex items-center justify-start md:justify-end">
            <a href="/">
              <Image src="/logo-miw3.png" alt="MIW3" width={420} height={180} className="w-64 md:w-80 lg:w-[380px] h-auto drop-shadow-2xl" />
            </a>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <FilterTabs activeCat={activeCat} activeDisp={activeDisp} activeCidade={activeCidade} activeOrigem={activeOrigem} activeQ={activeQ} cidades={cidades} />

      {/* Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Suspense
          key={`${activeCat}|${activeDisp}|${activeCidade}|${activeOrigem}|${activeQ}`}
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-xl h-80 animate-pulse shadow-sm" />)}
            </div>
          }
        >
          <Listings activeCat={activeCat} activeDisp={activeDisp} activeCidade={activeCidade} activeOrigem={activeOrigem} activeQ={activeQ} />
        </Suspense>
      </div>

      <WhatsAppFloat message="Olá! Vi o portfólio da MIW3 e queria saber mais!" />
    </div>
  )
}
