'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  type Reajuste, type ReajusteStatus,
  REAJUSTE_STATUS_LABELS, REAJUSTE_STATUS_COLORS,
} from '@/types/reajuste'
import type { Contrato } from '@/types/contrato'
import type { IndiceEconomico, IndiceValorMensal } from '@/types/indice'
import {
  calcularReajuste, validarTransicao, planejarAplicacao,
  janelaCompetencias, type SerieIndice,
} from '@/lib/contrato/reajuste'
import { proximoAniversarioReajuste, codigoContrato } from '@/lib/contrato/datas'

export type ReajusteComRelacoes = Reajuste & {
  contrato: (Pick<Contrato, 'id' | 'valor_aluguel' | 'indice_reajuste'> & { imovel: { nome: string } | null }) | null
}
type ContratoParaProjecao = Contrato & { imovel: { nome: string } | null }

interface Props {
  reajustes: ReajusteComRelacoes[]
  contratos: ContratoParaProjecao[]
  indices: IndiceEconomico[]
  valores: IndiceValorMensal[]
}

const FILTROS: { key: ReajusteStatus | ''; label: string }[] = [
  { key: '', label: 'Todos' },
  { key: 'pendente_indice', label: 'Pendentes de índice' },
  { key: 'projetado', label: 'Projetados' },
  { key: 'confirmado', label: 'Confirmados' },
  { key: 'aplicado', label: 'Aplicados' },
  { key: 'dispensado', label: 'Dispensados' },
]

export default function AdminReajustesPanel({ reajustes: iniciais, contratos, indices, valores }: Props) {
  const router = useRouter()
  const [reajustes, setReajustes] = useState(iniciais)
  const [filtro, setFiltro] = useState<ReajusteStatus | ''>('')
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [msg, setMsg] = useState('')
  const [projetando, setProjetando] = useState(false)

  // Série por código de índice.
  const series = useMemo(() => {
    const porId = new Map(indices.map((i) => [i.id, i.codigo.toLowerCase()]))
    const out: Record<string, SerieIndice> = {}
    for (const v of valores) {
      const cod = porId.get(v.indice_id)
      if (!cod) continue
      if (!out[cod]) out[cod] = {}
      out[cod][v.ano_mes] = Number(v.variacao_percentual)
    }
    return out
  }, [indices, valores])

  const filtrados = useMemo(
    () => (filtro ? reajustes.filter((r) => r.status === filtro) : reajustes),
    [reajustes, filtro]
  )

  // Projeta a próxima data-base dos contratos vigentes que ainda não têm reajuste projetado.
  const projetarPendentes = async () => {
    setProjetando(true); setMsg('')
    const supabase = createClient()
    const novos: Reajuste[] = []

    for (const c of contratos) {
      const vigente = c.status === 'vigente' || c.status === 'ativo' || c.status === 'renovado'
      if (!vigente || c.valor_aluguel == null) continue

      const prox = proximoAniversarioReajuste(c)
      if (!prox) continue
      const dataBase = `${prox.ano}-${String(prox.mes).padStart(2, '0')}-01`

      // Idempotente pela chave (contrato_id, data_base).
      if (reajustes.some((r) => r.contrato_id === c.id && r.data_base === dataBase)) continue

      const serie = series[(c.indice_reajuste ?? '').toLowerCase()] ?? {}
      const calc = calcularReajuste(
        {
          valorBase: c.valor_aluguel,
          dataBase,
          periodicidadeMeses: c.periodicidade_reajuste_meses ?? 12,
          defasagemMeses: c.defasagem_indice_meses ?? 2,
          travaDeflacao: c.trava_deflacao ?? true,
          percentualMinimo: c.percentual_minimo_reajuste,
          percentualMaximo: c.percentual_maximo_reajuste,
          percentualFixo: c.percentual_fixo_reajuste,
        },
        serie
      )

      const { data } = await supabase
        .from('reajustes')
        .upsert({
          contrato_id: c.id,
          data_base: dataBase,
          data_efeito: dataBase,
          valor_base: c.valor_aluguel,
          percentual_acumulado: calc.percentualAcumulado,
          percentual_aplicado: calc.percentualAplicado,
          valor_novo: calc.valorNovo,
          status: calc.status,
          memoria_calculo: calc.memoriaCalculo,
        }, { onConflict: 'contrato_id,data_base' })
        .select('*, contrato:contratos(id, valor_aluguel, indice_reajuste, imovel:imoveis(nome))')
        .single()

      if (data) novos.push(data as Reajuste)
    }

    setProjetando(false)
    if (novos.length === 0) { setMsg('Nenhum reajuste novo a projetar.'); return }
    setReajustes((prev) => [...(novos as ReajusteComRelacoes[]), ...prev])
    router.refresh()
  }

  const mudarStatus = async (r: ReajusteComRelacoes, novo: ReajusteStatus) => {
    setMsg('')
    let observacao = r.observacao
    if (novo === 'dispensado') {
      const texto = prompt('Motivo da dispensa (obrigatório):')
      if (texto == null) return
      observacao = texto
    }
    const v = validarTransicao(r.status, novo, observacao)
    if (!v.ok) { setMsg(v.erro!); return }

    setOcupado(r.id)
    const supabase = createClient()

    if (novo === 'aplicado') {
      // Carrega as vigências para planejar (idempotência inclusa).
      const { data: vigencias } = await supabase
        .from('contrato_vigencias_valor')
        .select('id, inicio, fim, reajuste_id')
        .eq('contrato_id', r.contrato_id)

      const plano = planejarAplicacao(
        { id: r.id, data_efeito: r.data_efeito, valor_novo: Number(r.valor_novo) },
        (vigencias ?? []) as { id: string; inicio: string; fim: string | null; reajuste_id: string | null }[]
      )
      if (!plano.ok) { setMsg(plano.motivo ?? 'Não foi possível aplicar.'); setOcupado(null); return }

      // 1) fecha a vigência anterior
      if (plano.fecharVigenciaId) {
        await supabase.from('contrato_vigencias_valor').update({ fim: plano.fecharVigenciaEm }).eq('id', plano.fecharVigenciaId)
      }
      // 2) abre a nova vigência (fonte da verdade)
      await supabase.from('contrato_vigencias_valor').insert({ contrato_id: r.contrato_id, ...plano.novaVigencia })
      // 3) atualiza o cache no contrato
      await supabase.from('contratos').update({ valor_aluguel: plano.atualizarCacheValor, atualizado_em: new Date().toISOString() }).eq('id', r.contrato_id)
      // 4) gera o aditivo
      const { data: ultimos } = await supabase.from('contrato_aditivos').select('numero').eq('contrato_id', r.contrato_id).order('numero', { ascending: false }).limit(1)
      const numero = ((ultimos?.[0]?.numero as number | undefined) ?? 0) + 1
      await supabase.from('contrato_aditivos').insert({
        contrato_id: r.contrato_id, numero, tipo: 'reajuste', data_efeito: r.data_efeito,
        resumo: `Reajuste de ${r.percentual_aplicado}% — ${formatCurrency(Number(r.valor_base))} → ${formatCurrency(Number(r.valor_novo))}`,
      })
      // 5) auditoria
      await supabase.from('contrato_historico').insert({
        contrato_id: r.contrato_id, tipo_evento: 'reajuste_aplicado',
        descricao: `Reajuste aplicado (${r.percentual_aplicado}%)`,
        valor_anterior: Number(r.valor_base), valor_novo: Number(r.valor_novo),
      })
    }

    const { error } = await supabase
      .from('reajustes')
      .update({
        status: novo,
        observacao,
        aplicado_em: novo === 'aplicado' ? new Date().toISOString() : r.aplicado_em,
      })
      .eq('id', r.id)

    setOcupado(null)
    if (error) { setMsg(error.message); return }
    setReajustes((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: novo, observacao } : x)))
    router.refresh()
  }

  const recalcular = async (r: ReajusteComRelacoes) => {
    setOcupado(r.id); setMsg('')
    const contrato = contratos.find((c) => c.id === r.contrato_id)
    if (!contrato || contrato.valor_aluguel == null) { setOcupado(null); return }
    const serie = series[(contrato.indice_reajuste ?? '').toLowerCase()] ?? {}
    const calc = calcularReajuste(
      {
        valorBase: Number(r.valor_base),
        dataBase: r.data_base,
        periodicidadeMeses: contrato.periodicidade_reajuste_meses ?? 12,
        defasagemMeses: contrato.defasagem_indice_meses ?? 2,
        travaDeflacao: contrato.trava_deflacao ?? true,
        percentualMinimo: contrato.percentual_minimo_reajuste,
        percentualMaximo: contrato.percentual_maximo_reajuste,
        percentualFixo: contrato.percentual_fixo_reajuste,
      },
      serie
    )
    const supabase = createClient()
    await supabase.from('reajustes').update({
      percentual_acumulado: calc.percentualAcumulado,
      percentual_aplicado: calc.percentualAplicado,
      valor_novo: calc.valorNovo,
      status: calc.status,
      memoria_calculo: calc.memoriaCalculo,
    }).eq('id', r.id)
    setOcupado(null)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 flex-wrap">
          {FILTROS.map((f) => (
            <button key={f.key} onClick={() => setFiltro(f.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filtro === f.key ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <button onClick={projetarPendentes} disabled={projetando} className="sm:ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
          {projetando ? 'Projetando...' : 'Projetar próximos reajustes'}
        </button>
      </div>

      {msg && <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">{msg}</p>}

      {filtrados.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-sm text-slate-500">
          Nenhum reajuste nesta situação. Use &ldquo;Projetar próximos reajustes&rdquo; para calcular as próximas datas-base.
        </div>
      ) : (
        <div className="space-y-3">
          {filtrados.map((r) => {
            const faltantes = (r.memoria_calculo?.meses_faltantes as string[] | undefined) ?? []
            const janela = (r.memoria_calculo?.janela as string[] | undefined) ?? []
            return (
              <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${REAJUSTE_STATUS_COLORS[r.status]}`}>
                        {REAJUSTE_STATUS_LABELS[r.status]}
                      </span>
                      <span className="font-mono text-xs text-slate-400">{codigoContrato(r.contrato_id)}</span>
                    </div>
                    <p className="font-semibold text-slate-900 truncate">{r.contrato?.imovel?.nome ?? 'Contrato'}</p>
                    <p className="text-xs text-slate-500">
                      Data-base {formatDate(r.data_base)} · efeito {formatDate(r.data_efeito)}
                      {janela.length > 0 && <> · janela {janela[0]} a {janela[janela.length - 1]}</>}
                    </p>
                    {r.status === 'pendente_indice' && faltantes.length > 0 && (
                      <p className="text-xs text-red-600 mt-1">Faltam índices: {faltantes.join(', ')}</p>
                    )}
                    {r.observacao && <p className="text-xs text-slate-500 mt-1">Obs.: {r.observacao}</p>}
                  </div>

                  <div className="text-right shrink-0">
                    {r.status !== 'pendente_indice' && (
                      <>
                        <p className="text-sm font-bold text-slate-900">{formatCurrency(Number(r.valor_novo))}</p>
                        <p className="text-xs text-slate-500">
                          {formatCurrency(Number(r.valor_base))} · {Number(r.percentual_aplicado)}%
                          {r.percentual_acumulado != null && Number(r.percentual_acumulado) !== Number(r.percentual_aplicado) && (
                            <span className="text-slate-400"> (acum. {Number(r.percentual_acumulado).toFixed(2)}%)</span>
                          )}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                  {r.status === 'pendente_indice' && (
                    <button onClick={() => recalcular(r)} disabled={ocupado === r.id} className="text-xs text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 disabled:opacity-50">
                      Recalcular
                    </button>
                  )}
                  {r.status === 'projetado' && (
                    <>
                      <button onClick={() => mudarStatus(r, 'confirmado')} disabled={ocupado === r.id} className="text-xs font-semibold text-white bg-blue-600 rounded-lg px-3 py-1.5 hover:bg-blue-700 disabled:opacity-50">
                        Confirmar
                      </button>
                      <button onClick={() => recalcular(r)} disabled={ocupado === r.id} className="text-xs text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 disabled:opacity-50">
                        Recalcular
                      </button>
                    </>
                  )}
                  {r.status === 'confirmado' && (
                    <button onClick={() => mudarStatus(r, 'aplicado')} disabled={ocupado === r.id} className="text-xs font-semibold text-white bg-green-600 rounded-lg px-3 py-1.5 hover:bg-green-700 disabled:opacity-50">
                      {ocupado === r.id ? 'Aplicando...' : 'Aplicar reajuste'}
                    </button>
                  )}
                  {r.status !== 'aplicado' && r.status !== 'dispensado' && (
                    <button onClick={() => mudarStatus(r, 'dispensado')} disabled={ocupado === r.id} className="text-xs text-slate-500 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 disabled:opacity-50">
                      Dispensar
                    </button>
                  )}
                  {r.status === 'aplicado' && r.aplicado_em && (
                    <span className="text-xs text-slate-400">Aplicado em {formatDate(r.aplicado_em)}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
