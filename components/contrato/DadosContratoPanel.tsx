'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  type Contrato, type ContratoTipo, type IndiceReajuste,
  type ModalidadeCobranca, type TituloCobranca,
  CONTRATO_TIPO_LABELS, INDICE_REAJUSTE_LABELS,
  MODALIDADE_COBRANCA_LABELS, TITULO_COBRANCA_LABELS,
} from '@/types/contrato'

const inputClass = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const numOuNull = (s: string) => (s.trim() === '' ? null : Number(s))

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-xs text-slate-500">{label}{children}</label>
}

interface Props {
  contrato: Contrato
  aba: 'geral' | 'valores'
  imovelNome: string
  inquilinoNome: string
}

export default function DadosContratoPanel({ contrato, aba, imovelNome, inquilinoNome }: Props) {
  const router = useRouter()
  const [tipo, setTipo] = useState<ContratoTipo>(contrato.tipo)
  const [dataInicio, setDataInicio] = useState(contrato.data_inicio ?? '')
  const [dataFim, setDataFim] = useState(contrato.data_fim ?? '')
  const [observacoes, setObservacoes] = useState(contrato.observacoes ?? '')

  const [valorAluguel, setValorAluguel] = useState(contrato.valor_aluguel?.toString() ?? '')
  const [diaVencimento, setDiaVencimento] = useState(contrato.dia_vencimento?.toString() ?? '')
  const [indice, setIndice] = useState<IndiceReajuste>(contrato.indice_reajuste ?? 'igpm')
  const [mesReajuste, setMesReajuste] = useState(contrato.mes_reajuste?.toString() ?? '')
  const [periodicidade, setPeriodicidade] = useState(contrato.periodicidade_reajuste_meses?.toString() ?? '12')
  const [percMin, setPercMin] = useState(contrato.percentual_minimo_reajuste?.toString() ?? '')
  const [percMax, setPercMax] = useState(contrato.percentual_maximo_reajuste?.toString() ?? '')
  const [multaMora, setMultaMora] = useState(contrato.multa_mora_percentual?.toString() ?? '')
  const [jurosMensal, setJurosMensal] = useState(contrato.juros_mensal_percentual?.toString() ?? '')
  const [modalidade, setModalidade] = useState<ModalidadeCobranca>(contrato.modalidade_cobranca ?? 'pre_paga')
  const [tituloCobranca, setTituloCobranca] = useState<TituloCobranca>(contrato.titulo_cobranca ?? 'aluguel')
  const [renovacaoAuto, setRenovacaoAuto] = useState(contrato.renovacao_automatica ?? true)

  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [erro, setErro] = useState('')

  const salvar = async () => {
    setSalvando(true); setSalvo(false); setErro('')
    const supabase = createClient()

    const payload: Record<string, unknown> = aba === 'geral'
      ? { tipo, data_inicio: dataInicio, data_fim: dataFim || null, observacoes: observacoes.trim() || null, atualizado_em: new Date().toISOString() }
      : {
          valor_aluguel: numOuNull(valorAluguel),
          dia_vencimento: numOuNull(diaVencimento),
          indice_reajuste: indice,
          mes_reajuste: numOuNull(mesReajuste),
          periodicidade_reajuste_meses: numOuNull(periodicidade),
          percentual_minimo_reajuste: numOuNull(percMin),
          percentual_maximo_reajuste: numOuNull(percMax),
          multa_mora_percentual: numOuNull(multaMora),
          juros_mensal_percentual: numOuNull(jurosMensal),
          modalidade_cobranca: modalidade,
          titulo_cobranca: tituloCobranca,
          renovacao_automatica: renovacaoAuto,
          atualizado_em: new Date().toISOString(),
        }

    const { error } = await supabase.from('contratos').update(payload).eq('id', contrato.id)
    if (error) { setErro(error.message); setSalvando(false); return }

    // O valor do aluguel aqui é o CACHE — o histórico vive em contrato_vigencias_valor.
    if (aba === 'valores' && numOuNull(valorAluguel) !== contrato.valor_aluguel) {
      await supabase.from('contrato_historico').insert({
        contrato_id: contrato.id,
        tipo_evento: 'alteracao',
        descricao: 'Valor do aluguel alterado manualmente (sem reajuste)',
        valor_anterior: contrato.valor_aluguel,
        valor_novo: numOuNull(valorAluguel),
      })
    }

    setSalvando(false); setSalvo(true)
    router.refresh()
  }

  return (
    <div className="space-y-5">
      {aba === 'geral' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-400">Imóvel</p>
              <p className="text-sm font-medium text-slate-800">{imovelNome}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-400">Locatário principal</p>
              <p className="text-sm font-medium text-slate-800">{inquilinoNome}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Campo label="Tipo">
              <select value={tipo} onChange={(e) => setTipo(e.target.value as ContratoTipo)} className={inputClass}>
                {(Object.keys(CONTRATO_TIPO_LABELS) as ContratoTipo[]).map((t) => <option key={t} value={t}>{CONTRATO_TIPO_LABELS[t]}</option>)}
              </select>
            </Campo>
            <Campo label="Início da vigência">
              <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className={inputClass} />
            </Campo>
            <Campo label="Fim da vigência">
              <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className={inputClass} />
            </Campo>
          </div>
          <Campo label="Observações">
            <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} className={inputClass} />
          </Campo>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Campo label="Valor do aluguel (R$)">
              <input type="number" inputMode="decimal" value={valorAluguel} onChange={(e) => setValorAluguel(e.target.value)} className={inputClass} />
            </Campo>
            <Campo label="Dia de vencimento">
              <input type="number" min={1} max={31} value={diaVencimento} onChange={(e) => setDiaVencimento(e.target.value)} className={inputClass} />
            </Campo>
            <Campo label="Título da cobrança">
              <select value={tituloCobranca} onChange={(e) => setTituloCobranca(e.target.value as TituloCobranca)} className={inputClass}>
                {(Object.keys(TITULO_COBRANCA_LABELS) as TituloCobranca[]).map((t) => <option key={t} value={t}>{TITULO_COBRANCA_LABELS[t]}</option>)}
              </select>
            </Campo>
            <Campo label="Modalidade de cobrança">
              <select value={modalidade} onChange={(e) => setModalidade(e.target.value as ModalidadeCobranca)} className={inputClass}>
                {(Object.keys(MODALIDADE_COBRANCA_LABELS) as ModalidadeCobranca[]).map((m) => <option key={m} value={m}>{MODALIDADE_COBRANCA_LABELS[m]}</option>)}
              </select>
            </Campo>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer pb-2">
                <input type="checkbox" checked={renovacaoAuto} onChange={(e) => setRenovacaoAuto(e.target.checked)} className="w-4 h-4 rounded border-slate-300" />
                Renovação automática
              </label>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Reajuste</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Campo label="Índice">
                <select value={indice} onChange={(e) => setIndice(e.target.value as IndiceReajuste)} className={inputClass}>
                  {(Object.keys(INDICE_REAJUSTE_LABELS) as IndiceReajuste[]).map((i) => <option key={i} value={i}>{INDICE_REAJUSTE_LABELS[i]}</option>)}
                </select>
              </Campo>
              <Campo label="Mês do reajuste">
                <select value={mesReajuste} onChange={(e) => setMesReajuste(e.target.value)} className={inputClass}>
                  <option value="">—</option>
                  {MESES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
              </Campo>
              <Campo label="Periodicidade (meses)">
                <input type="number" value={periodicidade} onChange={(e) => setPeriodicidade(e.target.value)} className={inputClass} />
              </Campo>
              <Campo label="Piso (%)">
                <input type="number" inputMode="decimal" value={percMin} onChange={(e) => setPercMin(e.target.value)} className={inputClass} placeholder="ex: 5" />
              </Campo>
              <Campo label="Teto (%)">
                <input type="number" inputMode="decimal" value={percMax} onChange={(e) => setPercMax(e.target.value)} className={inputClass} />
              </Campo>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Mora</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Campo label="Multa de mora (%)">
                <input type="number" inputMode="decimal" value={multaMora} onChange={(e) => setMultaMora(e.target.value)} className={inputClass} />
              </Campo>
              <Campo label="Juros mensais (%)">
                <input type="number" inputMode="decimal" value={jurosMensal} onChange={(e) => setJurosMensal(e.target.value)} className={inputClass} />
              </Campo>
            </div>
          </div>
        </>
      )}

      {erro && <p className="text-sm text-red-600">{erro}</p>}
      <div className="flex items-center gap-3">
        <button onClick={salvar} disabled={salvando} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
        {salvo && <span className="text-sm text-green-600 font-medium">Salvo ✓</span>}
      </div>
    </div>
  )
}
