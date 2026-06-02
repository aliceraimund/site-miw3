'use client'

import Link from 'next/link'

const CATEGORIAS = [
  { tabKey: 'residencial', label: 'Residencial' },
  { tabKey: 'comercial', label: 'Comercial / Industrial' },
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

interface Props {
  activeCat: string
  activeDisp: string
}

export default function FilterTabs({ activeCat, activeDisp }: Props) {
  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Row 1: Categoria */}
        <div className="flex gap-1 overflow-x-auto pt-3 pb-2 border-b border-slate-100">
          <Link
            href={buildUrl({ disponivel_para: activeDisp })}
            scroll={false}
            className={`shrink-0 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${!activeCat ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Todos
          </Link>
          {CATEGORIAS.map((c) => (
            <Link
              key={c.tabKey}
              href={buildUrl({ categoria: c.tabKey, disponivel_para: activeDisp })}
              scroll={false}
              className={`shrink-0 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeCat === c.tabKey ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {c.label}
            </Link>
          ))}
        </div>

        {/* Row 2: Disponibilidade */}
        <div className="flex gap-1 overflow-x-auto py-2">
          {DISPONIVEL_TABS.map((t) => (
            <Link
              key={t.key}
              href={buildUrl({ categoria: activeCat, disponivel_para: t.key })}
              scroll={false}
              className={`shrink-0 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeDisp === t.key ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              {t.label}
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
