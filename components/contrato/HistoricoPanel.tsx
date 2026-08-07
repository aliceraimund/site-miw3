'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { type ContratoHistorico, TIPO_EVENTO_LABELS, TIPO_EVENTO_COLORS } from '@/types/contrato'

export default function HistoricoPanel({ contratoId, iniciais }: { contratoId: string; iniciais: ContratoHistorico[] }) {
  const [eventos, setEventos] = useState(iniciais)
  const [exibirSistema, setExibirSistema] = useState(true)
  const [texto, setTexto] = useState('')
  const [salvando, setSalvando] = useState(false)

  const visiveis = useMemo(
    () => (exibirSistema ? eventos : eventos.filter((e) => e.tipo_evento === 'anotacao_manual')),
    [eventos, exibirSistema]
  )

  const anotar = async () => {
    if (!texto.trim()) return
    setSalvando(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('contrato_historico')
      .insert({ contrato_id: contratoId, tipo_evento: 'anotacao_manual', descricao: texto.trim() })
      .select('*')
      .single()
    setSalvando(false)
    if (data) {
      setEventos((prev) => [data as ContratoHistorico, ...prev])
      setTexto('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-900 text-base">Históricos</h2>
        <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
          <input type="checkbox" checked={exibirSistema} onChange={(e) => setExibirSistema(e.target.checked)} />
          Exibir comentários do sistema
        </label>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={2}
          placeholder="Anotação (ex.: decisão sobre renovação, contato com o inquilino...)"
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={anotar} disabled={salvando || !texto.trim()} className="text-sm font-semibold text-white bg-blue-600 rounded-lg px-4 py-1.5 hover:bg-blue-700 disabled:opacity-50">
          {salvando ? 'Salvando...' : 'Adicionar anotação'}
        </button>
      </div>

      {visiveis.length === 0 ? (
        <p className="text-sm text-slate-400">Nenhum registro.</p>
      ) : (
        <ol className="space-y-3">
          {visiveis.map((ev) => (
            <li key={ev.id} className="flex items-start gap-3">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${TIPO_EVENTO_COLORS[ev.tipo_evento]}`}>
                {TIPO_EVENTO_LABELS[ev.tipo_evento]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-700 whitespace-pre-line">{ev.descricao}</p>
                {ev.tipo_evento === 'reajuste' && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {ev.valor_anterior != null ? formatCurrency(ev.valor_anterior) : '—'} → {ev.valor_novo != null ? formatCurrency(ev.valor_novo) : '—'}
                  </p>
                )}
              </div>
              <span className="text-xs text-slate-400 shrink-0">{formatDate(ev.criado_em)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
