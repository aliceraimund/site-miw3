'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const CATEGORIAS = [
  { tabKey: 'residencial', label: 'Residencial' },
  { tabKey: 'comercial', label: 'Comercial / Industrial' },
]

const ORIGENS = [
  { key: '', label: 'Todos', title: 'Todos os imóveis do site' },
  { key: 'propria', label: 'Carteira própria', title: 'Imóveis de propriedade da MIW3' },
  { key: 'parceiro', label: 'Parceiros', title: 'Imóveis de corretores parceiros' },
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

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Busca + seletor de carteira (mesma linha, sem criar nova faixa de filtros) */}
        <div className="pt-5 pb-3 flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="relative flex-1">
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
              placeholder="Buscar por nome, cidade, bairro ou tipo de imóvel..."
              className="w-full border border-slate-300 rounded-xl pl-11 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          {/* Carteira própria x corretores parceiros */}
          <div className="flex bg-slate-100 rounded-xl p-1 shrink-0 self-start sm:self-auto">
            {ORIGENS.map((o) => (
              <Link
                key={o.key}
                href={buildUrl({ categoria: activeCat, disponivel_para: activeDisp, cidade: activeCidade, origem: o.key, q })}
                scroll={false}
                title={o.title}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeOrigem === o.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {o.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Row 1: Categoria */}
        <div className="flex gap-2 overflow-x-auto py-3 border-b border-slate-100">
          <Link
            href={buildUrl({ disponivel_para: activeDisp, cidade: activeCidade, origem: activeOrigem, q })}
            scroll={false}
            className={`shrink-0 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${!activeCat ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Todos
          </Link>
          {CATEGORIAS.map((c) => (
            <Link
              key={c.tabKey}
              href={buildUrl({ categoria: c.tabKey, disponivel_para: activeDisp, cidade: activeCidade, origem: activeOrigem, q })}
              scroll={false}
              className={`shrink-0 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeCat === c.tabKey ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {c.label}
            </Link>
          ))}
        </div>

        {/* Row 2: Disponibilidade */}
        <div className="flex gap-2 overflow-x-auto py-3">
          {DISPONIVEL_TABS.map((t) => (
            <Link
              key={t.key}
              href={buildUrl({ categoria: activeCat, disponivel_para: t.key, cidade: activeCidade, origem: activeOrigem, q })}
              scroll={false}
              className={`shrink-0 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeDisp === t.key ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {/* Row 3: Cidades (geradas automaticamente dos anúncios publicados) */}
        {cidades.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pt-3 pb-5 items-center border-t border-slate-100">
            <span className="shrink-0 text-xs font-semibold text-slate-400 pr-1 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Cidade:
            </span>
            <Link
              href={buildUrl({ categoria: activeCat, disponivel_para: activeDisp, origem: activeOrigem, q })}
              scroll={false}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors border ${!activeCidade ? 'bg-blue-600 text-white border-blue-600' : 'text-slate-600 border-slate-200 hover:bg-slate-100'}`}
            >
              Todas
            </Link>
            {cidades.map((cidade) => (
              <Link
                key={cidade}
                href={buildUrl({ categoria: activeCat, disponivel_para: activeDisp, cidade, origem: activeOrigem, q })}
                scroll={false}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors border ${activeCidade === cidade ? 'bg-blue-600 text-white border-blue-600' : 'text-slate-600 border-slate-200 hover:bg-slate-100'}`}
              >
                {cidade}
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
