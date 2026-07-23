'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  type Contrato,
  type ContratoTipo,
  type ContratoStatus,
  type IndiceReajuste,
  type ContratoHistorico,
  type TipoEvento,
  CONTRATO_TIPO_LABELS,
  CONTRATO_STATUS_LABELS,
  INDICE_REAJUSTE_LABELS,
  TIPO_EVENTO_LABELS,
  TIPO_EVENTO_COLORS,
} from '@/types/contrato'

interface OpcaoImovel {
  id: string
  nome: string
  endereco_completo: string
}
interface OpcaoInquilino {
  id: string
  nome: string
}

interface Props {
  contrato?: Contrato
  imoveis: OpcaoImovel[]
  inquilinos: OpcaoInquilino[]
  historicoInicial?: ContratoHistorico[]
}

type NovoEvento = {
  contrato_id: string
  tipo_evento: TipoEvento
  descricao: string
  valor_anterior?: number | null
  valor_novo?: number | null
}

const inputClass = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const numOuNull = (s: string) => (s.trim() === '' ? null : Number(s))

export default function AdminContratoForm({ contrato, imoveis, inquilinos, historicoInicial = [] }: Props) {
  const router = useRouter()
  const isEditing = !!contrato

  const [imovelId, setImovelId] = useState(contrato?.imovel_id ?? '')
  const [inquilinoId, setInquilinoId] = useState(contrato?.inquilino_id ?? '')
  const [tipo, setTipo] = useState<ContratoTipo>(contrato?.tipo ?? 'residencial')
  const [dataInicio, setDataInicio] = useState(contrato?.data_inicio ?? '')
  const [dataFim, setDataFim] = useState(contrato?.data_fim ?? '')
  const [valorAluguel, setValorAluguel] = useState(contrato?.valor_aluguel?.toString() ?? '')
  const [diaVencimento, setDiaVencimento] = useState(contrato?.dia_vencimento?.toString() ?? '')
  const [indice, setIndice] = useState<IndiceReajuste>(contrato?.indice_reajuste ?? 'igpm')
  const [mesReajuste, setMesReajuste] = useState(contrato?.mes_reajuste?.toString() ?? '')
  const [status, setStatus] = useState<ContratoStatus>(contrato?.status ?? 'ativo')
  const [observacoes, setObservacoes] = useState(contrato?.observacoes ?? '')

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Mantém a situação do imóvel coerente com o contrato (alugado / disponível).
  const sincronizarSituacaoImovel = async (supabase: ReturnType<typeof createClient>, idImovel: string, statusContrato: ContratoStatus) => {
    if (statusContrato === 'encerrado') {
      await supabase.from('imovel_gestao').upsert({ imovel_id: idImovel, situacao_gestao: 'disponivel' }, { onConflict: 'imovel_id' })
    } else {
      // ativo ou renovado → imóvel gerido e alugado
      await supabase.from('imoveis').update({ gerido: true }).eq('id', idImovel)
      await supabase.from('imovel_gestao').upsert({ imovel_id: idImovel, situacao_gestao: 'alugado' }, { onConflict: 'imovel_id' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imovelId || !inquilinoId || !dataInicio) {
      setError('Selecione o imóvel, o inquilino e a data de início.')
      return
    }
    setSaving(true)
    setSaved(false)
    setError('')
    const supabase = createClient()

    const payload = {
      imovel_id: imovelId,
      inquilino_id: inquilinoId,
      tipo,
      data_inicio: dataInicio,
      data_fim: dataFim || null,
      valor_aluguel: numOuNull(valorAluguel),
      dia_vencimento: numOuNull(diaVencimento),
      indice_reajuste: indice,
      mes_reajuste: numOuNull(mesReajuste),
      status,
      observacoes: observacoes.trim() || null,
      atualizado_em: new Date().toISOString(),
    }

    if (isEditing) {
      const { error: updateError } = await supabase.from('contratos').update(payload).eq('id', contrato.id)
      if (updateError) {
        setError(updateError.message)
        setSaving(false)
        return
      }

      // Registra automaticamente os eventos relevantes no histórico.
      const eventos: NovoEvento[] = []
      const valorAntigo = contrato.valor_aluguel
      const valorNovo = payload.valor_aluguel
      if (valorAntigo !== valorNovo) {
        eventos.push({ contrato_id: contrato.id, tipo_evento: 'reajuste', descricao: 'Valor do aluguel alterado', valor_anterior: valorAntigo, valor_novo: valorNovo })
      }
      if (contrato.status !== status) {
        if (status === 'encerrado') eventos.push({ contrato_id: contrato.id, tipo_evento: 'encerramento', descricao: 'Contrato encerrado' })
        else if (status === 'renovado') eventos.push({ contrato_id: contrato.id, tipo_evento: 'renovacao', descricao: 'Contrato renovado' })
        else eventos.push({ contrato_id: contrato.id, tipo_evento: 'alteracao', descricao: `Situação alterada para ${CONTRATO_STATUS_LABELS[status]}` })
      }
      const outrosMudaram =
        contrato.tipo !== tipo ||
        contrato.data_inicio !== (dataInicio || null) ||
        (contrato.data_fim ?? null) !== (dataFim || null) ||
        (contrato.dia_vencimento ?? null) !== numOuNull(diaVencimento) ||
        (contrato.indice_reajuste ?? null) !== indice ||
        (contrato.mes_reajuste ?? null) !== numOuNull(mesReajuste)
      if (outrosMudaram) {
        eventos.push({ contrato_id: contrato.id, tipo_evento: 'alteracao', descricao: 'Termos do contrato atualizados' })
      }
      if (eventos.length > 0) {
        await supabase.from('contrato_historico').insert(eventos)
      }

      await sincronizarSituacaoImovel(supabase, imovelId, status)
      setSaving(false)
      setSaved(true)
      router.refresh()
    } else {
      const { data, error: insertError } = await supabase.from('contratos').insert(payload).select('id').single()
      if (insertError || !data) {
        setError(insertError?.message ?? 'Erro ao criar o contrato.')
        setSaving(false)
        return
      }
      await supabase.from('contrato_historico').insert({ contrato_id: data.id, tipo_evento: 'criacao', descricao: 'Contrato criado' })
      await sincronizarSituacaoImovel(supabase, imovelId, status)
      router.push('/admin/gestao/contratos')
    }
  }

  if (imoveis.length === 0 || inquilinos.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-500 space-y-2">
        <p>Para criar um contrato você precisa ter ao menos um imóvel e um inquilino cadastrados.</p>
        <div className="flex items-center justify-center gap-3">
          {imoveis.length === 0 && <Link href="/admin/gestao" className="text-blue-600 hover:underline">Cadastrar imóvel</Link>}
          {inquilinos.length === 0 && <Link href="/admin/gestao/inquilinos/novo" className="text-blue-600 hover:underline">Cadastrar inquilino</Link>}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Associação */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h2 className="font-semibold text-slate-900 text-base border-b border-slate-100 pb-3">Imóvel e inquilino</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Imóvel" required>
            <select value={imovelId} onChange={(e) => setImovelId(e.target.value)} className={inputClass}>
              <option value="">Selecione...</option>
              {imoveis.map((i) => (
                <option key={i.id} value={i.id}>{i.nome} — {i.endereco_completo}</option>
              ))}
            </select>
          </Field>
          <Field label="Inquilino" required>
            <select value={inquilinoId} onChange={(e) => setInquilinoId(e.target.value)} className={inputClass}>
              <option value="">Selecione...</option>
              {inquilinos.map((i) => (
                <option key={i.id} value={i.id}>{i.nome}</option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      {/* Termos */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h2 className="font-semibold text-slate-900 text-base border-b border-slate-100 pb-3">Termos do contrato</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Tipo">
            <select value={tipo} onChange={(e) => setTipo(e.target.value as ContratoTipo)} className={inputClass}>
              {(Object.keys(CONTRATO_TIPO_LABELS) as ContratoTipo[]).map((t) => (
                <option key={t} value={t}>{CONTRATO_TIPO_LABELS[t]}</option>
              ))}
            </select>
          </Field>
          <Field label="Situação">
            <select value={status} onChange={(e) => setStatus(e.target.value as ContratoStatus)} className={inputClass}>
              {(Object.keys(CONTRATO_STATUS_LABELS) as ContratoStatus[]).map((s) => (
                <option key={s} value={s}>{CONTRATO_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </Field>
          <Field label="Início da vigência" required>
            <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Fim da vigência">
            <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Valor do aluguel (R$)">
            <input type="number" inputMode="decimal" value={valorAluguel} onChange={(e) => setValorAluguel(e.target.value)} className={inputClass} placeholder="0" />
          </Field>
          <Field label="Dia de vencimento">
            <input type="number" inputMode="numeric" min={1} max={31} value={diaVencimento} onChange={(e) => setDiaVencimento(e.target.value)} className={inputClass} placeholder="Ex: 10" />
          </Field>
          <Field label="Índice de reajuste">
            <select value={indice} onChange={(e) => setIndice(e.target.value as IndiceReajuste)} className={inputClass}>
              {(Object.keys(INDICE_REAJUSTE_LABELS) as IndiceReajuste[]).map((r) => (
                <option key={r} value={r}>{INDICE_REAJUSTE_LABELS[r]}</option>
              ))}
            </select>
          </Field>
          <Field label="Mês do reajuste">
            <select value={mesReajuste} onChange={(e) => setMesReajuste(e.target.value)} className={inputClass}>
              <option value="">—</option>
              {MESES.map((m, idx) => (
                <option key={m} value={idx + 1}>{m}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Observações">
          <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} className={inputClass} placeholder="Cláusulas específicas, fiador, garantia..." />
        </Field>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
          {saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar contrato'}
        </button>
        <button type="button" onClick={() => router.push('/admin/gestao/contratos')} className="px-5 py-2.5 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
          {isEditing ? 'Voltar' : 'Cancelar'}
        </button>
        {saved && <span className="text-sm text-green-600 font-medium">Salvo ✓</span>}
      </div>

      {isEditing && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 text-base border-b border-slate-100 pb-3 mb-4">Histórico de alterações</h2>
          {historicoInicial.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhum evento registrado ainda.</p>
          ) : (
            <ol className="space-y-3">
              {historicoInicial.map((ev) => (
                <li key={ev.id} className="flex items-start gap-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${TIPO_EVENTO_COLORS[ev.tipo_evento]}`}>
                    {TIPO_EVENTO_LABELS[ev.tipo_evento]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-700">{ev.descricao}</p>
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
      )}
    </form>
  )
}
