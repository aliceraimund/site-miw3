'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FiltroDropdown, { type OpcaoFiltro } from '@/components/FiltroDropdown'

const CATEGORIAS: OpcaoFiltro[] = [
  { key: '', label: 'Todos' },
  { key: 'residencial', label: 'Residencial' },
  { key: 'comercial', label: 'Comercial / Industrial' },
]

const ORIGENS = [
  { key: '', label: 'Todos' },
  { key: 'propria', label: 'Carteira própria' },
  { key: 'parceiro', label: 'Parceiros' },
]

const ICONE_CARTEIRA = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const FINALIDADES: OpcaoFiltro[] = [
  { key: '', label: 'Todas' },
  { key: 'venda', label: 'Venda' },
  { key: 'locacao', label: 'Locação' },
  { key: 'ambos', label: 'Venda e Locação' },
]

const ICONE_TIPO = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
)

const ICONE_FINALIDADE = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 10V5a2 2 0 012-2z" />
  </svg>
)

const ICONE_CIDADE = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

function buildUrl(params: Record<string, string>) {
  const filtered = Object.entries(params).filter(([, v]) => v !== '')
  if (filtered.length === 0) return '/'
  return '/?' + filtered.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
}

interface Props {
  activeCat: string
  activeDisp: string
  activeCidade: string
  activeOrigem: string
  activeQ: string
  cidades: string[]
}

export default function FilterTabs({ activeCat, activeDisp, activeCidade, activeOrigem, activeQ, cidades }: Props) {
  const router = useRouter()
  const [q, setQ] = useState(activeQ)
  const isTyping = useRef(false)

  // Mantém o campo em sincronia quando a URL muda por outro caminho (ex: limpar filtros).
  useEffect(() => {
    if (!isTyping.current) setQ(activeQ)
  }, [activeQ])

  // Busca com debounce: navega 400ms após parar de digitar.
  useEffect(() => {
    if (!isTyping.current) return
    const id = setTimeout(() => {
      isTyping.current = false
      router.push(buildUrl({ categoria: activeCat, disponivel_para: activeDisp, cidade: activeCidade, origem: activeOrigem, q }), { scroll: false })
    }, 400)
    return () => clearTimeout(id)
  }, [q, activeCat, activeDisp, activeCidade, activeOrigem, router])

  const atual = { categoria: activeCat, disponivel_para: activeDisp, cidade: activeCidade, origem: activeOrigem, q }
  const irPara = (campo: string, valor: string) => {
    router.push(buildUrl({ ...atual, [campo]: valor }), { scroll: false })
  }

  const opcoesCidade: OpcaoFiltro[] = [{ key: '', label: 'Todas' }, ...cidades.map((c) => ({ key: c, label: c }))]
  const temFiltro = !!(activeCat || activeDisp || activeCidade || activeOrigem || activeQ)

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">

        {/* Linha 1: busca */}
        <div>
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
            <input
              type="search"
              value={q}
              onChange={(e) => {
                isTyping.current = true
                setQ(e.target.value)
              }}
              placeholder="Buscar por nome, cidade, bairro ou tipo..."
              className="w-full border border-slate-200 rounded-xl pl-11 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {q && (
              <button
                type="button"
                onClick={() => {
                  isTyping.current = true
                  setQ('')
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Limpar busca"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

        </div>

        {/* Linha 2: os quatro filtros, com a carteira em destaque */}
        <div className="flex flex-wrap gap-1.5 sm:gap-3 items-center">
          {/* Carteira: botões (e não dropdown), para ficar sempre à vista */}
          <div className="flex items-center gap-1 rounded-xl border border-blue-200 bg-blue-50 p-1">
            <span className="text-blue-600 pl-1.5 pr-0.5">{ICONE_CARTEIRA}</span>
            {ORIGENS.map((o) => (
              <Link
                key={o.key}
                href={buildUrl({ ...atual, origem: o.key })}
                scroll={false}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeOrigem === o.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-blue-700 hover:bg-blue-100'
                }`}
              >
                {o.label}
              </Link>
            ))}
          </div>
          <FiltroDropdown label="Tipo" icone={ICONE_TIPO} opcoes={CATEGORIAS} valor={activeCat} onSelect={(v) => irPara('categoria', v)} />
          <FiltroDropdown label="Finalidade" icone={ICONE_FINALIDADE} opcoes={FINALIDADES} valor={activeDisp} onSelect={(v) => irPara('disponivel_para', v)} />
          {cidades.length > 0 && (
            <FiltroDropdown label="Cidade" icone={ICONE_CIDADE} opcoes={opcoesCidade} valor={activeCidade} onSelect={(v) => irPara('cidade', v)} />
          )}
          {temFiltro && (
            <Link
              href="/"
              scroll={false}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 px-2 py-2.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpar filtros
            </Link>
          )}
        </div>

      </div>
    </div>
  )
}
