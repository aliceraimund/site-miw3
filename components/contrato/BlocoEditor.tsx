'use client'

import { useState } from 'react'
import {
  type Bloco,
  type BlocoTipo,
  type Run,
  isRunPlaceholder,
  blocoVazio,
  BLOCO_TIPO_LABELS,
} from '@/lib/contrato/blocos'

const inputSm = 'w-full border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500'

interface Props {
  blocos: Bloco[]
  variaveis: string[] // chaves declaradas, para o datalist de placeholders
  onChange: (blocos: Bloco[]) => void
}

export default function BlocoEditor({ blocos, variaveis, onChange }: Props) {
  const setAt = (i: number, novo: Bloco) => onChange(blocos.map((b, j) => (j === i ? novo : b)))
  const remove = (i: number) => onChange(blocos.filter((_, j) => j !== i))
  const move = (i: number, dir: -1 | 1) => {
    const to = i + dir
    if (to < 0 || to >= blocos.length) return
    const next = [...blocos]
    ;[next[i], next[to]] = [next[to], next[i]]
    onChange(next)
  }
  const add = (tipo: BlocoTipo) => onChange([...blocos, blocoVazio(tipo)])

  return (
    <div className="space-y-2">
      {blocos.map((bloco, i) => (
        <div key={i} className="border border-slate-200 rounded-lg p-2 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">
              {BLOCO_TIPO_LABELS[bloco.tipo]}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-slate-400 hover:text-slate-700 disabled:opacity-30 p-1" title="Subir">▲</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === blocos.length - 1} className="text-slate-400 hover:text-slate-700 disabled:opacity-30 p-1" title="Descer">▼</button>
              <button type="button" onClick={() => remove(i)} className="text-slate-400 hover:text-red-600 p-1" title="Remover">✕</button>
            </div>
          </div>

          {(bloco.tipo === 'titulo' || bloco.tipo === 'paragrafo') && (
            <RunsEditor runs={bloco.runs} variaveis={variaveis} onChange={(runs) => setAt(i, { ...bloco, runs })} />
          )}

          {bloco.tipo === 'condicional' && (
            <div className="space-y-2">
              <label className="block text-[11px] text-slate-500">
                Quando (flag/variável verdadeira):
                <input list="vars-list" value={bloco.quando} onChange={(e) => setAt(i, { ...bloco, quando: e.target.value })} className={inputSm} placeholder="ex: imovel.temSacadaEnvidracada" />
              </label>
              <div className="pl-3 border-l-2 border-slate-100">
                <BlocoEditor blocos={bloco.blocos} variaveis={variaveis} onChange={(bs) => setAt(i, { ...bloco, blocos: bs })} />
              </div>
            </div>
          )}

          {bloco.tipo === 'repeticao' && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-[11px] text-slate-500">
                  Sobre (lista):
                  <input list="vars-list" value={bloco.sobre} onChange={(e) => setAt(i, { ...bloco, sobre: e.target.value })} className={inputSm} placeholder="ex: locatarios" />
                </label>
                <label className="block text-[11px] text-slate-500">
                  Como (alias):
                  <input value={bloco.como} onChange={(e) => setAt(i, { ...bloco, como: e.target.value })} className={inputSm} placeholder="ex: l" />
                </label>
              </div>
              <div className="pl-3 border-l-2 border-slate-100">
                <BlocoEditor blocos={bloco.blocos} variaveis={variaveis} onChange={(bs) => setAt(i, { ...bloco, blocos: bs })} />
              </div>
            </div>
          )}

          {bloco.tipo === 'alternativa' && (
            <AlternativaEditor
              sobre={bloco.sobre}
              casos={bloco.casos}
              variaveis={variaveis}
              onSobre={(sobre) => setAt(i, { ...bloco, sobre })}
              onCasos={(casos) => setAt(i, { ...bloco, casos })}
            />
          )}
        </div>
      ))}

      <div className="flex flex-wrap gap-1 pt-1">
        {(Object.keys(BLOCO_TIPO_LABELS) as BlocoTipo[]).map((t) => (
          <button key={t} type="button" onClick={() => add(t)} className="text-[11px] text-blue-600 border border-blue-200 rounded px-2 py-1 hover:bg-blue-50">
            + {BLOCO_TIPO_LABELS[t]}
          </button>
        ))}
      </div>
    </div>
  )
}

function RunsEditor({ runs, variaveis, onChange }: { runs: Run[]; variaveis: string[]; onChange: (runs: Run[]) => void }) {
  void variaveis
  const setAt = (i: number, novo: Run) => onChange(runs.map((r, j) => (j === i ? novo : r)))
  const remove = (i: number) => onChange(runs.filter((_, j) => j !== i))

  return (
    <div className="space-y-1">
      {runs.map((run, i) => (
        <div key={i} className="flex items-center gap-1">
          <select
            value={isRunPlaceholder(run) ? 'ph' : 'txt'}
            onChange={(e) => setAt(i, e.target.value === 'ph' ? { placeholder: '', negrito: run.negrito } : { texto: '', negrito: run.negrito })}
            className="border border-slate-300 rounded px-1 py-1 text-xs shrink-0"
          >
            <option value="txt">Texto</option>
            <option value="ph">Variável</option>
          </select>
          {isRunPlaceholder(run) ? (
            <input list="vars-list" value={run.placeholder} onChange={(e) => setAt(i, { ...run, placeholder: e.target.value })} className={inputSm} placeholder="chave da variável" />
          ) : (
            <input value={run.texto} onChange={(e) => setAt(i, { ...run, texto: e.target.value })} className={inputSm} placeholder="texto" />
          )}
          <label className="flex items-center gap-0.5 text-[10px] text-slate-500 shrink-0">
            <input type="checkbox" checked={Boolean(run.negrito)} onChange={(e) => setAt(i, { ...run, negrito: e.target.checked })} />
            <span className="font-bold">N</span>
          </label>
          <button type="button" onClick={() => remove(i)} className="text-slate-400 hover:text-red-600 px-1 shrink-0" title="Remover trecho">✕</button>
        </div>
      ))}
      <div className="flex gap-1">
        <button type="button" onClick={() => onChange([...runs, { texto: '' }])} className="text-[11px] text-slate-600 border border-slate-200 rounded px-2 py-0.5 hover:bg-slate-50">+ texto</button>
        <button type="button" onClick={() => onChange([...runs, { placeholder: '' }])} className="text-[11px] text-slate-600 border border-slate-200 rounded px-2 py-0.5 hover:bg-slate-50">+ variável</button>
      </div>
    </div>
  )
}

function AlternativaEditor({
  sobre, casos, variaveis, onSobre, onCasos,
}: {
  sobre: string
  casos: Record<string, Bloco[]>
  variaveis: string[]
  onSobre: (s: string) => void
  onCasos: (c: Record<string, Bloco[]>) => void
}) {
  const [novoCaso, setNovoCaso] = useState('')
  const chaves = Object.keys(casos)

  return (
    <div className="space-y-2">
      <label className="block text-[11px] text-slate-500">
        Sobre (variável que decide o caso):
        <input list="vars-list" value={sobre} onChange={(e) => onSobre(e.target.value)} className={inputSm} placeholder="ex: garantia.tipo" />
      </label>
      {chaves.map((chave) => (
        <div key={chave} className="pl-3 border-l-2 border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-slate-600">caso: {chave}</span>
            <button type="button" onClick={() => { const c = { ...casos }; delete c[chave]; onCasos(c) }} className="text-slate-400 hover:text-red-600 text-xs" title="Remover caso">✕</button>
          </div>
          <BlocoEditor blocos={casos[chave]} variaveis={variaveis} onChange={(bs) => onCasos({ ...casos, [chave]: bs })} />
        </div>
      ))}
      <div className="flex gap-1">
        <input value={novoCaso} onChange={(e) => setNovoCaso(e.target.value)} className={inputSm} placeholder="valor do caso (ex: fiador)" />
        <button
          type="button"
          onClick={() => { if (novoCaso.trim() && !casos[novoCaso.trim()]) { onCasos({ ...casos, [novoCaso.trim()]: [] }); setNovoCaso('') } }}
          className="text-[11px] text-blue-600 border border-blue-200 rounded px-2 hover:bg-blue-50 shrink-0"
        >
          + caso
        </button>
      </div>
    </div>
  )
}
