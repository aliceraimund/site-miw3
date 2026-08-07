'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { IndiceEconomico, IndiceValorMensal } from '@/types/indice'

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

interface Props {
  indices: IndiceEconomico[]
  valores: IndiceValorMensal[]
}

export default function AdminIndicesPanel({ indices: indicesIniciais, valores: valoresIniciais }: Props) {
  const [indices, setIndices] = useState(indicesIniciais)
  const [valores, setValores] = useState(valoresIniciais)
  const [indiceId, setIndiceId] = useState(indicesIniciais[0]?.id ?? '')
  const anoAtual = new Date().getFullYear()
  const [ano, setAno] = useState(anoAtual)
  const [editando, setEditando] = useState<string | null>(null)
  const [rascunho, setRascunho] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [novoCodigo, setNovoCodigo] = useState('')
  const [novoNome, setNovoNome] = useState('')

  const porCompetencia = useMemo(() => {
    const m = new Map<string, IndiceValorMensal>()
    for (const v of valores) if (v.indice_id === indiceId) m.set(v.ano_mes, v)
    return m
  }, [valores, indiceId])

  const criarIndice = async () => {
    if (!novoCodigo.trim() || !novoNome.trim()) return
    const supabase = createClient()
    const { data } = await supabase
      .from('indices_economicos')
      .insert({ codigo: novoCodigo.trim().toUpperCase(), nome: novoNome.trim(), ativo: true })
      .select('*')
      .single()
    if (data) {
      setIndices((prev) => [...prev, data as IndiceEconomico])
      setIndiceId((data as IndiceEconomico).id)
      setNovoCodigo(''); setNovoNome('')
    }
  }

  const salvarValor = async (anoMes: string) => {
    const bruto = rascunho.replace(',', '.').trim()
    setEditando(null)
    if (bruto === '') return
    const variacao = Number(bruto)
    if (!Number.isFinite(variacao)) return

    setSalvando(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('indice_valores_mensais')
      .upsert({ indice_id: indiceId, ano_mes: anoMes, variacao_percentual: variacao }, { onConflict: 'indice_id,ano_mes' })
      .select('*')
      .single()
    setSalvando(false)
    if (data) {
      setValores((prev) => {
        const semAntigo = prev.filter((v) => !(v.indice_id === indiceId && v.ano_mes === anoMes))
        return [...semAntigo, data as IndiceValorMensal]
      })
    }
  }

  if (indices.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-4">
        <div>
          <h2 className="font-semibold text-slate-900">Nenhum índice cadastrado</h2>
          <p className="text-sm text-slate-500 mt-0.5">Cadastre os índices usados nos contratos (IGP-M, IPCA, INCC...).</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs text-slate-500">Código<input value={novoCodigo} onChange={(e) => setNovoCodigo(e.target.value)} placeholder="IPCA" className="block border border-slate-300 rounded-lg px-3 py-2 text-sm w-28" /></label>
          <label className="text-xs text-slate-500">Nome<input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="IPCA/IBGE" className="block border border-slate-300 rounded-lg px-3 py-2 text-sm w-64" /></label>
          <button onClick={criarIndice} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">Cadastrar</button>
        </div>
      </div>
    )
  }

  const lacunas = MESES.filter((_, i) => !porCompetencia.has(`${ano}-${String(i + 1).padStart(2, '0')}`)).length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs text-slate-500">
          Índice
          <select value={indiceId} onChange={(e) => setIndiceId(e.target.value)} className="block mt-0.5 border border-slate-300 rounded-lg px-3 py-2 text-sm">
            {indices.map((i) => <option key={i.id} value={i.id}>{i.codigo} — {i.nome}</option>)}
          </select>
        </label>
        <label className="text-xs text-slate-500">
          Ano
          <div className="flex items-center gap-1 mt-0.5">
            <button onClick={() => setAno((a) => a - 1)} className="w-8 h-9 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">‹</button>
            <span className="w-16 text-center text-sm font-semibold text-slate-800">{ano}</span>
            <button onClick={() => setAno((a) => a + 1)} disabled={ano >= anoAtual + 1} className="w-8 h-9 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40">›</button>
          </div>
        </label>
        <div className="ml-auto flex items-end gap-2">
          <label className="text-xs text-slate-500">Novo índice<input value={novoCodigo} onChange={(e) => setNovoCodigo(e.target.value)} placeholder="Código" className="block mt-0.5 border border-slate-300 rounded-lg px-2 py-2 text-sm w-24" /></label>
          <input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Nome" className="border border-slate-300 rounded-lg px-2 py-2 text-sm w-40" />
          <button onClick={criarIndice} className="text-sm text-blue-600 border border-blue-200 rounded-lg px-3 py-2 hover:bg-blue-50">+ Adicionar</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-slate-600">Variação mensal (%) — clique para editar</p>
          {lacunas > 0 ? (
            <span className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
              {lacunas} {lacunas === 1 ? 'mês faltando' : 'meses faltando'} em {ano}
            </span>
          ) : (
            <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">{ano} completo ✓</span>
          )}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {MESES.map((mes, i) => {
            const anoMes = `${ano}-${String(i + 1).padStart(2, '0')}`
            const registro = porCompetencia.get(anoMes)
            const vazio = !registro
            const emEdicao = editando === anoMes
            return (
              <div
                key={anoMes}
                onClick={() => { if (!emEdicao) { setEditando(anoMes); setRascunho(registro ? String(registro.variacao_percentual) : '') } }}
                className={`rounded-lg border p-2 cursor-pointer transition-colors ${vazio ? 'border-red-200 bg-red-50 hover:bg-red-100' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
              >
                <p className="text-[10px] uppercase tracking-wide text-slate-400">{mes}</p>
                {emEdicao ? (
                  <input
                    autoFocus
                    value={rascunho}
                    onChange={(e) => setRascunho(e.target.value)}
                    onBlur={() => salvarValor(anoMes)}
                    onKeyDown={(e) => { if (e.key === 'Enter') salvarValor(anoMes); if (e.key === 'Escape') setEditando(null) }}
                    placeholder="0,00"
                    className="w-full border border-blue-400 rounded px-1 py-0.5 text-sm focus:outline-none"
                  />
                ) : (
                  <p className={`text-sm font-semibold ${vazio ? 'text-red-400' : 'text-slate-800'}`}>
                    {registro ? `${registro.variacao_percentual}%` : '—'}
                  </p>
                )}
              </div>
            )
          })}
        </div>
        {salvando && <p className="text-xs text-slate-400 mt-2">Salvando...</p>}
        <p className="text-xs text-slate-400 mt-3">
          Meses em vermelho não têm índice informado. Reajustes cuja janela inclua um mês faltante ficam bloqueados como
          <strong> pendente de índice</strong> — o sistema nunca assume zero.
        </p>
      </div>
    </div>
  )
}
