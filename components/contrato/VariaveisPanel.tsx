'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ModeloVariavel } from '@/types/modelo-contrato'
import { CATALOGO_RESIDENCIAL } from '@/lib/contrato/catalogo-variaveis'

interface Props {
  versaoId: string
  variaveis: ModeloVariavel[]
  disabled?: boolean
  onChange: (variaveis: ModeloVariavel[]) => void
}

const inputSm = 'w-full border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500'

export default function VariaveisPanel({ versaoId, variaveis, disabled, onChange }: Props) {
  const [busy, setBusy] = useState(false)
  const [chave, setChave] = useState('')
  const [label, setLabel] = useState('')
  const [obrig, setObrig] = useState(false)

  const grupos = useMemo(() => {
    const mapa = new Map<string, ModeloVariavel[]>()
    for (const v of variaveis) {
      const g = v.grupo ?? 'Outros'
      if (!mapa.has(g)) mapa.set(g, [])
      mapa.get(g)!.push(v)
    }
    return [...mapa.entries()]
  }, [variaveis])

  const recarregar = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('modelo_variaveis').select('*').eq('versao_id', versaoId).order('ordem', { ascending: true })
    onChange((data as ModeloVariavel[]) ?? [])
  }

  const semearCatalogo = async () => {
    setBusy(true)
    const supabase = createClient()
    const existentes = new Set(variaveis.map((v) => v.chave))
    const novas = CATALOGO_RESIDENCIAL.filter((c) => !existentes.has(c.chave)).map((c, i) => ({
      versao_id: versaoId,
      chave: c.chave,
      label: c.label,
      tipo: c.tipo,
      origem: c.origem,
      caminho_origem: c.caminho_origem ?? null,
      obrigatoria: c.obrigatoria ?? true,
      grupo: c.grupo,
      ordem: variaveis.length + i,
    }))
    if (novas.length > 0) await supabase.from('modelo_variaveis').insert(novas)
    await recarregar()
    setBusy(false)
  }

  const adicionar = async () => {
    if (!chave.trim() || !label.trim()) return
    setBusy(true)
    const supabase = createClient()
    await supabase.from('modelo_variaveis').insert({
      versao_id: versaoId, chave: chave.trim(), label: label.trim(),
      tipo: 'texto', origem: 'MAN', obrigatoria: obrig, grupo: 'Outros', ordem: variaveis.length,
    })
    setChave(''); setLabel(''); setObrig(false)
    await recarregar()
    setBusy(false)
  }

  const remover = async (id: string) => {
    setBusy(true)
    const supabase = createClient()
    await supabase.from('modelo_variaveis').delete().eq('id', id)
    await recarregar()
    setBusy(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Variáveis <span className="text-slate-400 font-normal">({variaveis.length})</span></h3>
        {!disabled && (
          <button type="button" onClick={semearCatalogo} disabled={busy} className="text-[11px] text-blue-600 border border-blue-200 rounded px-2 py-1 hover:bg-blue-50 disabled:opacity-50">
            Semear catálogo residencial
          </button>
        )}
      </div>

      {variaveis.length === 0 && <p className="text-xs text-slate-400">Nenhuma variável. Use &ldquo;Semear catálogo&rdquo; ou adicione abaixo.</p>}

      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {grupos.map(([grupo, lista]) => (
          <div key={grupo}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">{grupo}</p>
            <ul className="space-y-0.5">
              {lista.map((v) => (
                <li key={v.id} className="flex items-center gap-2 text-xs">
                  <code className="text-slate-700 bg-slate-100 rounded px-1 py-0.5 truncate">{v.chave}</code>
                  {v.obrigatoria && <span className="text-[9px] text-amber-700 shrink-0">obrig.</span>}
                  <span className="text-slate-400 truncate hidden sm:inline">{v.label}</span>
                  {!disabled && (
                    <button type="button" onClick={() => remover(v.id)} disabled={busy} className="ml-auto text-slate-300 hover:text-red-600 shrink-0" title="Remover">✕</button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {!disabled && (
        <div className="border-t border-slate-100 pt-2 space-y-1">
          <input value={chave} onChange={(e) => setChave(e.target.value)} className={inputSm} placeholder="chave (ex: imovel.finalidade)" />
          <input value={label} onChange={(e) => setLabel(e.target.value)} className={inputSm} placeholder="rótulo" />
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-[11px] text-slate-500">
              <input type="checkbox" checked={obrig} onChange={(e) => setObrig(e.target.checked)} /> obrigatória
            </label>
            <button type="button" onClick={adicionar} disabled={busy} className="ml-auto text-[11px] text-blue-600 border border-blue-200 rounded px-2 py-1 hover:bg-blue-50 disabled:opacity-50">
              + adicionar variável
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
