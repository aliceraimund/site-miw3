'use client'

import { useEffect, useRef, useState } from 'react'

export interface OpcaoFiltro {
  key: string
  label: string
}

interface Props {
  label: string // rótulo fixo, ex: "Cidade"
  opcoes: OpcaoFiltro[] // a primeira é sempre a opção "todas"
  valor: string
  onSelect: (key: string) => void
  icone: React.ReactNode
}

// Filtro em dropdown: botão "Rótulo: valor" que abre a lista de opções.
export default function FiltroDropdown({ label, opcoes, valor, onSelect, icone }: Props) {
  const [aberto, setAberto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!aberto) return
    const clique = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false)
    }
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAberto(false)
    }
    document.addEventListener('mousedown', clique)
    document.addEventListener('keydown', tecla)
    return () => {
      document.removeEventListener('mousedown', clique)
      document.removeEventListener('keydown', tecla)
    }
  }, [aberto])

  const selecionada = opcoes.find((o) => o.key === valor) ?? opcoes[0]
  const ativo = valor !== ''

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-haspopup="listbox"
        className={`flex items-center gap-1.5 sm:gap-2 rounded-xl border px-3 sm:px-3.5 py-2.5 text-sm transition-colors ${
          ativo
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
        }`}
      >
        <span className={ativo ? 'text-blue-600' : 'text-slate-400'}>{icone}</span>
        <span className="text-slate-500">{label}:</span>
        <span className="font-semibold whitespace-nowrap">{selecionada.label}</span>
        <svg className={`w-4 h-4 shrink-0 transition-transform ${aberto ? 'rotate-180' : ''} ${ativo ? 'text-blue-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {aberto && (
        <ul
          role="listbox"
          className="absolute left-0 top-full mt-2 z-40 min-w-[220px] max-h-72 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg py-1"
        >
          {opcoes.map((o) => {
            const escolhida = o.key === valor
            return (
              <li key={o.key || 'todas'}>
                <button
                  type="button"
                  role="option"
                  aria-selected={escolhida}
                  onClick={() => {
                    setAberto(false)
                    onSelect(o.key)
                  }}
                  className={`w-full text-left px-3.5 py-2 text-sm flex items-center justify-between gap-3 hover:bg-slate-50 ${
                    escolhida ? 'text-blue-600 font-semibold' : 'text-slate-700'
                  }`}
                >
                  <span>{o.label}</span>
                  {escolhida && (
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
