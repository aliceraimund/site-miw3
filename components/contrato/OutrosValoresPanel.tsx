'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import {
  type ContratoOutroValor,
  type OutroValorTipo,
  OUTRO_VALOR_TIPO_LABELS,
  OUTRO_VALOR_TIPO_COLORS,
} from '@/types/contrato-outros-valores'

const inputClass = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

export default function OutrosValoresPanel({ contratoId, iniciais }: { contratoId: string; iniciais: ContratoOutroValor[] }) {
  const [itens, setItens] = useState(iniciais)
  const [aberto, setAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const [titulo, setTitulo] = useState('')
  const [valor, setValor] = useState('')
  const [qtdParcelas, setQtdParcelas] = useState('0')
  const [competencia, setCompetencia] = useState('')
  const [tipo, setTipo] = useState<OutroValorTipo>('despesa')
  const [descricao, setDescricao] = useState('')
  const [nomeLink, setNomeLink] = useState('')
  const [urlLink, setUrlLink] = useState('')

  const limpar = () => {
    setTitulo(''); setValor(''); setQtdParcelas('0'); setCompetencia('')
    setTipo('despesa'); setDescricao(''); setNomeLink(''); setUrlLink('')
  }

  const adicionar = async () => {
    if (!titulo.trim() || !valor) { setErro('Informe título e valor.'); return }
    setSalvando(true); setErro('')
    const supabase = createClient()
    const { data, error } = await supabase
      .from('contrato_outros_valores')
      .insert({
        contrato_id: contratoId,
        titulo: titulo.trim(),
        valor: Number(valor),
        qtd_parcelas: Number(qtdParcelas) || 0,
        competencia_inicial: competencia || null,
        tipo,
        descricao: descricao.trim() || null,
        nome_link: nomeLink.trim() || null,
        url_link: urlLink.trim() || null,
      })
      .select('*')
      .single()
    setSalvando(false)
    if (error || !data) { setErro(error?.message ?? 'Erro ao adicionar.'); return }
    setItens((prev) => [...prev, data as ContratoOutroValor])
    limpar(); setAberto(false)
  }

  const remover = async (id: string) => {
    const supabase = createClient()
    await supabase.from('contrato_outros_valores').delete().eq('id', id)
    setItens((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-slate-900 text-base">Outros valores na fatura</h2>
          <p className="text-xs text-slate-400 mt-0.5">Itens que compõem a cobrança. A emissão da fatura em si fica fora do sistema.</p>
        </div>
        <button onClick={() => setAberto((a) => !a)} className="text-sm font-semibold text-white bg-blue-600 rounded-lg px-3 py-1.5 hover:bg-blue-700">
          {aberto ? 'Cancelar' : '+ Adicionar'}
        </button>
      </div>

      {aberto && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="text-xs text-slate-500 sm:col-span-2">Título<input value={titulo} onChange={(e) => setTitulo(e.target.value)} className={inputClass} placeholder="Ex: Taxa de limpeza" /></label>
            <label className="text-xs text-slate-500">Valor (R$)<input type="number" inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} className={inputClass} placeholder="0" /></label>
            <label className="text-xs text-slate-500">Nº de parcelas<input type="number" min={0} value={qtdParcelas} onChange={(e) => setQtdParcelas(e.target.value)} className={inputClass} /><span className="text-[10px] text-slate-400">0 = recorrente até o fim</span></label>
            <label className="text-xs text-slate-500">Competência inicial<input type="month" value={competencia} onChange={(e) => setCompetencia(e.target.value)} className={inputClass} /></label>
            <label className="text-xs text-slate-500">Tipo
              <select value={tipo} onChange={(e) => setTipo(e.target.value as OutroValorTipo)} className={inputClass}>
                {(Object.keys(OUTRO_VALOR_TIPO_LABELS) as OutroValorTipo[]).map((t) => <option key={t} value={t}>{OUTRO_VALOR_TIPO_LABELS[t]}</option>)}
              </select>
            </label>
          </div>
          <label className="text-xs text-slate-500 block">Descrição<textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={2} className={inputClass} /></label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-xs text-slate-500">Nome do link<input value={nomeLink} onChange={(e) => setNomeLink(e.target.value)} className={inputClass} placeholder="Ex: Nota fiscal" /></label>
            <label className="text-xs text-slate-500">URL<input value={urlLink} onChange={(e) => setUrlLink(e.target.value)} className={inputClass} placeholder="https://..." /></label>
          </div>
          {erro && <p className="text-sm text-red-600">{erro}</p>}
          <button onClick={adicionar} disabled={salvando} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
            {salvando ? 'Salvando...' : 'Adicionar'}
          </button>
        </div>
      )}

      {itens.length === 0 ? (
        <p className="text-sm text-slate-400">Nenhum valor adicional cadastrado.</p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs">
              <tr>
                <th className="text-left px-3 py-2">Título</th>
                <th className="text-left px-3 py-2">Tipo</th>
                <th className="text-right px-3 py-2">Valor</th>
                <th className="text-center px-3 py-2">Parcelas</th>
                <th className="text-left px-3 py-2">Competência</th>
                <th className="text-right px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {itens.map((i) => (
                <tr key={i.id} className="text-slate-700">
                  <td className="px-3 py-2">
                    <p className="font-medium text-slate-900">{i.titulo}</p>
                    {i.descricao && <p className="text-xs text-slate-400">{i.descricao}</p>}
                    {i.url_link && <a href={i.url_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">{i.nome_link || 'link'}</a>}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${OUTRO_VALOR_TIPO_COLORS[i.tipo]}`}>{OUTRO_VALOR_TIPO_LABELS[i.tipo]}</span>
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">{formatCurrency(i.valor)}</td>
                  <td className="px-3 py-2 text-center">{i.qtd_parcelas === 0 || i.qtd_parcelas == null ? 'recorrente' : i.qtd_parcelas}</td>
                  <td className="px-3 py-2">{i.competencia_inicial ?? '—'}</td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => remover(i.id)} className="text-slate-400 hover:text-red-600" title="Remover">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
