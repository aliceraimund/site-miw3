'use client'

import { useRef, useState } from 'react'
import RichTextArea from './RichTextArea'
import type { Bloco } from '@/lib/contrato/blocos'
import { type Regiao, type BlocoTexto, agruparRegioes, regioesParaBlocos } from '@/lib/contrato/documento'

interface VarOpt { chave: string; label: string }

interface Props {
  blocos: Bloco[]
  variaveis: VarOpt[]
  onChange: (blocos: Bloco[]) => void
}

interface Item { id: number; r: Regiao }
const inputSm = 'border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500'

export default function DocumentoEditor({ blocos, variaveis, onChange }: Props) {
  const contador = useRef(0)
  const [itens, setItens] = useState<Item[]>(() => agruparRegioes(blocos).map((r) => ({ id: contador.current++, r })))

  const propagar = (novos: Item[]) => {
    setItens(novos)
    onChange(regioesParaBlocos(novos.map((i) => i.r)))
  }
  const setItem = (id: number, r: Regiao) => propagar(itens.map((i) => (i.id === id ? { ...i, r } : i)))
  const remover = (id: number) => propagar(itens.filter((i) => i.id !== id))
  const mover = (idx: number, dir: -1 | 1) => {
    const to = idx + dir
    if (to < 0 || to >= itens.length) return
    const next = [...itens]
    ;[next[idx], next[to]] = [next[to], next[idx]]
    propagar(next)
  }
  const inserir = (idx: number, r: Regiao) => {
    const next = [...itens]
    next.splice(idx, 0, { id: contador.current++, r })
    propagar(next)
  }

  const Inserir = ({ idx }: { idx: number }) => (
    <div className="flex flex-wrap items-center gap-1 py-1">
      <span className="text-[10px] text-slate-300">inserir:</span>
      <button type="button" onClick={() => inserir(idx, { tipo: 'texto', blocos: [{ tipo: 'paragrafo', runs: [{ texto: '' }] }] })} className="text-[11px] text-slate-600 border border-slate-200 rounded px-2 py-0.5 hover:bg-slate-50">+ Texto</button>
      <button type="button" onClick={() => inserir(idx, { tipo: 'especial', bloco: { tipo: 'condicional', quando: '', blocos: [] } })} className="text-[11px] text-amber-700 border border-amber-200 rounded px-2 py-0.5 hover:bg-amber-50">+ Condicional</button>
      <button type="button" onClick={() => inserir(idx, { tipo: 'especial', bloco: { tipo: 'repeticao', sobre: '', como: 'item', blocos: [] } })} className="text-[11px] text-blue-700 border border-blue-200 rounded px-2 py-0.5 hover:bg-blue-50">+ Repetição</button>
      <button type="button" onClick={() => inserir(idx, { tipo: 'especial', bloco: { tipo: 'alternativa', sobre: '', casos: {} } })} className="text-[11px] text-purple-700 border border-purple-200 rounded px-2 py-0.5 hover:bg-purple-50">+ Alternativa</button>
    </div>
  )

  return (
    <div>
      {itens.map((item, idx) => (
        <div key={item.id}>
          <Inserir idx={idx} />
          <div className="relative group">
            <div className="absolute -right-1 -top-1 z-10 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button type="button" onClick={() => mover(idx, -1)} disabled={idx === 0} className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-400 hover:text-slate-700 disabled:opacity-30 text-xs">▲</button>
              <button type="button" onClick={() => mover(idx, 1)} disabled={idx === itens.length - 1} className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-400 hover:text-slate-700 disabled:opacity-30 text-xs">▼</button>
              <button type="button" onClick={() => remover(item.id)} className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-400 hover:text-red-600 text-xs">✕</button>
            </div>

            {item.r.tipo === 'texto' ? (
              <RichTextArea
                initialBlocos={item.r.blocos}
                variaveis={variaveis}
                onChange={(b) => setItem(item.id, { tipo: 'texto', blocos: b })}
              />
            ) : (
              <EspecialEditor item={item} variaveis={variaveis} onChange={(r) => setItem(item.id, r)} />
            )}
          </div>
        </div>
      ))}
      <Inserir idx={itens.length} />
      {itens.length === 0 && <p className="text-sm text-slate-400 py-4 text-center">Documento vazio. Use &ldquo;+ Texto&rdquo; para começar a redigir.</p>}
    </div>
  )
}

function EspecialEditor({ item, variaveis, onChange }: { item: Item; variaveis: VarOpt[]; onChange: (r: Regiao) => void }) {
  if (item.r.tipo !== 'especial') return null
  const bloco = item.r.bloco

  if (bloco.tipo === 'condicional') {
    return (
      <div className="border-2 border-amber-200 rounded-lg p-3 bg-amber-50/40">
        <label className="text-[11px] font-semibold text-amber-800 flex items-center gap-2 mb-2">
          Só aparece quando esta variável for verdadeira:
          <input list="vars-list" value={bloco.quando} onChange={(e) => onChange({ tipo: 'especial', bloco: { ...bloco, quando: e.target.value } })} className={inputSm} placeholder="ex: imovel.temSacadaEnvidracada" />
        </label>
        <RichTextArea initialBlocos={bloco.blocos as BlocoTexto[]} variaveis={variaveis} onChange={(b) => onChange({ tipo: 'especial', bloco: { ...bloco, blocos: b } })} />
      </div>
    )
  }

  if (bloco.tipo === 'repeticao') {
    return (
      <div className="border-2 border-blue-200 rounded-lg p-3 bg-blue-50/40">
        <div className="flex flex-wrap items-center gap-2 mb-2 text-[11px] font-semibold text-blue-800">
          Repete para cada item de
          <input list="vars-list" value={bloco.sobre} onChange={(e) => onChange({ tipo: 'especial', bloco: { ...bloco, sobre: e.target.value } })} className={inputSm} placeholder="ex: locatarios" />
          chamando cada item de
          <input value={bloco.como} onChange={(e) => onChange({ tipo: 'especial', bloco: { ...bloco, como: e.target.value } })} className={`${inputSm} w-20`} placeholder="ex: l" />
        </div>
        <RichTextArea initialBlocos={bloco.blocos as BlocoTexto[]} variaveis={variaveis} onChange={(b) => onChange({ tipo: 'especial', bloco: { ...bloco, blocos: b } })} />
      </div>
    )
  }

  // alternativa
  const casos = bloco.casos
  const setCasoBody = (chave: string, b: BlocoTexto[]) => onChange({ tipo: 'especial', bloco: { ...bloco, casos: { ...casos, [chave]: b } } })
  const removerCaso = (chave: string) => { const c = { ...casos }; delete c[chave]; onChange({ tipo: 'especial', bloco: { ...bloco, casos: c } }) }
  return (
    <div className="border-2 border-purple-200 rounded-lg p-3 bg-purple-50/40">
      <label className="text-[11px] font-semibold text-purple-800 flex items-center gap-2 mb-2">
        Escolhe o trecho conforme o valor de:
        <input list="vars-list" value={bloco.sobre} onChange={(e) => onChange({ tipo: 'especial', bloco: { ...bloco, sobre: e.target.value } })} className={inputSm} placeholder="ex: garantia.tipo" />
      </label>
      {Object.keys(casos).map((chave) => (
        <div key={chave} className="mb-3 pl-2 border-l-2 border-purple-200">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-purple-700">quando valer: {chave}</span>
            <button type="button" onClick={() => removerCaso(chave)} className="text-slate-400 hover:text-red-600 text-xs">✕</button>
          </div>
          <RichTextArea initialBlocos={casos[chave] as BlocoTexto[]} variaveis={variaveis} onChange={(b) => setCasoBody(chave, b)} />
        </div>
      ))}
      <AdicionarCaso onAdd={(chave) => onChange({ tipo: 'especial', bloco: { ...bloco, casos: { ...casos, [chave]: [{ tipo: 'paragrafo', runs: [{ texto: '' }] }] } } })} existentes={Object.keys(casos)} />
    </div>
  )
}

function AdicionarCaso({ onAdd, existentes }: { onAdd: (chave: string) => void; existentes: string[] }) {
  const [v, setV] = useState('')
  return (
    <div className="flex items-center gap-1">
      <input value={v} onChange={(e) => setV(e.target.value)} className={inputSm} placeholder="valor do caso (ex: fiador)" />
      <button type="button" onClick={() => { const c = v.trim(); if (c && !existentes.includes(c)) { onAdd(c); setV('') } }} className="text-[11px] text-purple-700 border border-purple-200 rounded px-2 py-1 hover:bg-purple-100">+ caso</button>
    </div>
  )
}
