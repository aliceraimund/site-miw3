'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { MANUTENCAO_STATUS_LABELS, type ManutencaoStatus } from '@/types/manutencao'

interface ImovelOpt { id: string; nome: string }
interface Linha {
  data_abertura: string
  titulo: string
  status: string
  custo_estimado: number | null
  custo_real: number | null
  data_inicio: string | null
  data_conclusao_estimada: string | null
  data_conclusao_real: string | null
}

const inputClass = 'border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
const dataBR = (s: string | null) => (s ? formatDate(s) : '—')
const moeda = (v: number | null) => (v == null ? '—' : formatCurrency(v))

export default function AdminManutencaoRelatorio({ imoveis }: { imoveis: ImovelOpt[] }) {
  const [imovelId, setImovelId] = useState('')
  const [de, setDe] = useState('')
  const [ate, setAte] = useState('')
  const [status, setStatus] = useState('')
  const [linhas, setLinhas] = useState<Linha[] | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  const gerar = async () => {
    if (!imovelId) { setErro('Selecione um imóvel.'); return }
    setErro('')
    setCarregando(true)
    const supabase = createClient()
    let query = supabase
      .from('manutencoes')
      .select('data_abertura, titulo, status, custo_estimado, custo_real, data_inicio, data_conclusao_estimada, data_conclusao_real')
      .eq('imovel_id', imovelId)
      .order('data_abertura', { ascending: false })
    if (de) query = query.gte('data_abertura', de)
    if (ate) query = query.lte('data_abertura', ate)
    if (status) query = query.eq('status', status)
    const { data } = await query
    setLinhas((data as Linha[]) ?? [])
    setCarregando(false)
  }

  const totalEstimado = (linhas ?? []).reduce((s, l) => s + (l.custo_estimado ?? 0), 0)
  const totalReal = (linhas ?? []).reduce((s, l) => s + (l.custo_real ?? 0), 0)

  const params = new URLSearchParams({ imovel: imovelId, de, ate, status })
  const pdfHref = `/admin/manutencoes/relatorio/pdf?${params.toString()}`

  const baixarCsv = () => {
    if (!linhas) return
    const sep = ';'
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
    const num = (v: number | null) => (v == null ? '' : v.toFixed(2).replace('.', ','))
    const d = (s: string | null) => (s ? s.split('-').reverse().join('/') : '')
    const cab = ['Abertura', 'Chamado', 'Status', 'Custo estimado', 'Custo real', 'Início', 'Conclusão estimada', 'Conclusão real']
    const linhasCsv = linhas.map((l) => [
      d(l.data_abertura), esc(l.titulo), MANUTENCAO_STATUS_LABELS[l.status as ManutencaoStatus] ?? l.status,
      num(l.custo_estimado), num(l.custo_real), d(l.data_inicio), d(l.data_conclusao_estimada), d(l.data_conclusao_real),
    ].join(sep))
    const totalLinha = ['', 'TOTAIS', '', num(totalEstimado), num(totalReal), '', '', ''].join(sep)
    const conteudo = '﻿' + [cab.join(sep), ...linhasCsv, totalLinha].join('\r\n')
    const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'relatorio-manutencao.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <label className="text-xs text-slate-500 sm:col-span-2">
            Imóvel *
            <select value={imovelId} onChange={(e) => setImovelId(e.target.value)} className={`${inputClass} w-full mt-0.5`}>
              <option value="">Selecione...</option>
              {imoveis.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}
            </select>
          </label>
          <label className="text-xs text-slate-500">
            Abertura de
            <input type="date" value={de} onChange={(e) => setDe(e.target.value)} className={`${inputClass} w-full mt-0.5`} />
          </label>
          <label className="text-xs text-slate-500">
            Abertura até
            <input type="date" value={ate} onChange={(e) => setAte(e.target.value)} className={`${inputClass} w-full mt-0.5`} />
          </label>
          <label className="text-xs text-slate-500">
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputClass} w-full mt-0.5`}>
              <option value="">Todos</option>
              {(Object.keys(MANUTENCAO_STATUS_LABELS) as ManutencaoStatus[]).map((s) => <option key={s} value={s}>{MANUTENCAO_STATUS_LABELS[s]}</option>)}
            </select>
          </label>
        </div>
        {erro && <p className="text-sm text-red-600 mt-3">{erro}</p>}
        <div className="flex items-center gap-3 mt-4">
          <button onClick={gerar} disabled={carregando} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
            {carregando ? 'Gerando...' : 'Gerar relatório'}
          </button>
          {linhas && (
            <>
              <a href={pdfHref} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-50">Baixar PDF</a>
              <button onClick={baixarCsv} className="text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-50">Baixar CSV</button>
            </>
          )}
        </div>
      </div>

      {linhas && (
        linhas.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-sm text-slate-500">
            Nenhum chamado encontrado para este filtro. O PDF/CSV também sairá vazio.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs">
                <tr>
                  <th className="text-left px-3 py-2">Abertura</th>
                  <th className="text-left px-3 py-2">Chamado</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-right px-3 py-2">Estimado</th>
                  <th className="text-right px-3 py-2">Real</th>
                  <th className="text-left px-3 py-2">Início</th>
                  <th className="text-left px-3 py-2">Concl. est.</th>
                  <th className="text-left px-3 py-2">Concl. real</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {linhas.map((l, i) => (
                  <tr key={i} className="text-slate-700">
                    <td className="px-3 py-2 whitespace-nowrap">{dataBR(l.data_abertura)}</td>
                    <td className="px-3 py-2">{l.titulo}</td>
                    <td className="px-3 py-2">{MANUTENCAO_STATUS_LABELS[l.status as ManutencaoStatus] ?? l.status}</td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">{moeda(l.custo_estimado)}</td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">{moeda(l.custo_real)}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{dataBR(l.data_inicio)}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{dataBR(l.data_conclusao_estimada)}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{dataBR(l.data_conclusao_real)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-semibold text-slate-900">
                <tr>
                  <td className="px-3 py-2" colSpan={3}>Totais</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(totalEstimado)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(totalReal)}</td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </div>
        )
      )}
    </div>
  )
}
