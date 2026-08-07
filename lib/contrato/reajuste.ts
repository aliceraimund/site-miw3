// Motor de reajuste. Funções PURAS — toda a aritmética com decimal.js.
// Percentuais são expressos em unidades de porcentagem (5 = 5%).
//
// Ordem das operações (não alterar):
//   1. acumulado = produtório ∏(1 + iₘ/100) − 1   (nunca soma)
//   2. janela termina em mes_base − defasagem
//   3. mês faltante → pendente_indice (NUNCA zero)
//   4. trava de deflação: acumulado < 0 → parcial = 0
//   5. piso/teto por último: aplicado = clamp(parcial, min, max)
//   6. valor_novo = round(valor_base × (1 + aplicado/100), 2) half-up
//   7. tipo fixo ignora índice

import Decimal from 'decimal.js'
import type { MemoriaCalculo, ReajusteStatus } from '@/types/reajuste'

export type SerieIndice = Record<string, number> // 'AAAA-MM' → variação % do mês

export interface ParametrosReajuste {
  valorBase: number
  dataBase: string // 'AAAA-MM-DD'
  periodicidadeMeses: number
  defasagemMeses: number
  travaDeflacao: boolean
  percentualMinimo?: number | null
  percentualMaximo?: number | null
  percentualFixo?: number | null // definido → tipo fixo (ignora índice)
}

export interface ResultadoReajuste {
  status: Extract<ReajusteStatus, 'pendente_indice' | 'projetado'>
  percentualAcumulado: number | null
  percentualAplicado: number
  valorNovo: number
  mesesFaltantes: string[]
  memoriaCalculo: MemoriaCalculo
}

// --- utilidades de competência ('AAAA-MM') ---------------------------------

export function competenciaDe(dataISO: string): string {
  return dataISO.slice(0, 7)
}

export function somarMeses(anoMes: string, delta: number): string {
  const [ano, mes] = anoMes.split('-').map(Number)
  const idx = ano * 12 + (mes - 1) + delta
  return `${Math.floor(idx / 12)}-${String((idx % 12) + 1).padStart(2, '0')}`
}

// Janela de N meses que TERMINA em (mês da data-base − defasagem).
export function janelaCompetencias(dataBase: string, periodicidadeMeses: number, defasagemMeses: number): string[] {
  const fim = somarMeses(competenciaDe(dataBase), -defasagemMeses)
  const meses: string[] = []
  for (let i = periodicidadeMeses - 1; i >= 0; i--) meses.push(somarMeses(fim, -i))
  return meses
}

// --- motor ------------------------------------------------------------------

function arredondar2(v: Decimal): number {
  return v.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber()
}

export function calcularReajuste(p: ParametrosReajuste, serie: SerieIndice): ResultadoReajuste {
  const valorBase = new Decimal(p.valorBase)

  // (7) Tipo fixo — ignora índice por completo.
  if (p.percentualFixo != null) {
    const aplicado = new Decimal(p.percentualFixo)
    const valorNovo = arredondar2(valorBase.mul(aplicado.div(100).plus(1)))
    return {
      status: 'projetado',
      percentualAcumulado: null,
      percentualAplicado: aplicado.toNumber(),
      valorNovo,
      mesesFaltantes: [],
      memoriaCalculo: {
        meses: [],
        acumulado_bruto: aplicado.toNumber(),
        aplicado: aplicado.toNumber(),
        formula: `percentual fixo de ${aplicado.toNumber()}% (índice ignorado)`,
        janela: [],
        tipo: 'fixo',
      },
    }
  }

  // (2) Janela de competências.
  const janela = janelaCompetencias(p.dataBase, p.periodicidadeMeses, p.defasagemMeses)

  // (3) Mês faltante bloqueia — nunca assume zero.
  const faltantes = janela.filter((m) => serie[m] == null)
  if (faltantes.length > 0) {
    return {
      status: 'pendente_indice',
      percentualAcumulado: null,
      percentualAplicado: 0,
      valorNovo: arredondar2(valorBase),
      mesesFaltantes: faltantes,
      memoriaCalculo: {
        meses: janela.filter((m) => serie[m] != null).map((m) => ({ ano_mes: m, variacao: serie[m] })),
        acumulado_bruto: 0,
        aplicado: 0,
        formula: 'bloqueado: índice ausente na janela',
        janela,
        meses_faltantes: faltantes,
        tipo: 'indice',
      },
    }
  }

  // (1) Produtório.
  let fator = new Decimal(1)
  const meses = janela.map((m) => {
    const variacao = serie[m]
    fator = fator.mul(new Decimal(variacao).div(100).plus(1))
    return { ano_mes: m, variacao }
  })
  const acumulado = fator.minus(1).mul(100)

  // (4) Trava de deflação.
  let parcial = acumulado
  const travou = p.travaDeflacao && acumulado.lessThan(0)
  if (travou) parcial = new Decimal(0)

  // (5) Piso e teto — por último.
  let aplicado = parcial
  if (p.percentualMinimo != null && aplicado.lessThan(p.percentualMinimo)) aplicado = new Decimal(p.percentualMinimo)
  if (p.percentualMaximo != null && aplicado.greaterThan(p.percentualMaximo)) aplicado = new Decimal(p.percentualMaximo)

  // (6) Arredondamento half-up.
  const valorNovo = arredondar2(valorBase.mul(aplicado.div(100).plus(1)))

  return {
    status: 'projetado',
    percentualAcumulado: acumulado.toDecimalPlaces(6).toNumber(),
    percentualAplicado: aplicado.toDecimalPlaces(6).toNumber(),
    valorNovo,
    mesesFaltantes: [],
    memoriaCalculo: {
      meses,
      acumulado_bruto: acumulado.toDecimalPlaces(6).toNumber(),
      aplicado: aplicado.toDecimalPlaces(6).toNumber(),
      formula: '∏(1 + iₘ/100) − 1' + (travou ? ' · trava de deflação aplicada' : ''),
      janela,
      trava_deflacao_aplicada: travou,
      tipo: 'indice',
    },
  }
}

// --- máquina de estados -----------------------------------------------------

const TRANSICOES: Record<ReajusteStatus, ReajusteStatus[]> = {
  pendente_indice: ['projetado', 'dispensado'],
  projetado: ['confirmado', 'pendente_indice', 'dispensado'],
  confirmado: ['aplicado', 'projetado', 'dispensado'],
  aplicado: [],
  dispensado: [],
}

export interface ResultadoValidacao {
  ok: boolean
  erro?: string
}

export function validarTransicao(de: ReajusteStatus, para: ReajusteStatus, observacao?: string | null): ResultadoValidacao {
  if (!TRANSICOES[de]?.includes(para)) {
    return { ok: false, erro: `Transição inválida: ${de} → ${para}.` }
  }
  // Dispensar exige justificativa.
  if (para === 'dispensado' && !observacao?.trim()) {
    return { ok: false, erro: 'Para dispensar um reajuste é obrigatório informar a observação.' }
  }
  return { ok: true }
}

// --- aplicação (plano puro; a escrita no banco usa este plano) --------------

export function diaAnterior(dataISO: string): string {
  const [a, m, d] = dataISO.split('-').map(Number)
  const dt = new Date(Date.UTC(a, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() - 1)
  return dt.toISOString().slice(0, 10)
}

export interface VigenciaExistente {
  id: string
  inicio: string
  fim: string | null
  reajuste_id: string | null
}

export interface PlanoAplicacao {
  ok: boolean
  motivo?: string
  fecharVigenciaId?: string
  fecharVigenciaEm?: string
  novaVigencia?: { inicio: string; valor_aluguel: number; origem: 'reajuste'; reajuste_id: string }
  atualizarCacheValor?: number
}

// Idempotente: se já existe vigência gerada por este reajuste, aborta.
export function planejarAplicacao(
  reajuste: { id: string; data_efeito: string; valor_novo: number },
  vigencias: VigenciaExistente[]
): PlanoAplicacao {
  if (vigencias.some((v) => v.reajuste_id === reajuste.id)) {
    return { ok: false, motivo: 'Este reajuste já foi aplicado (vigência existente).' }
  }

  // Vigência corrente = a de maior início sem fim, ou a última.
  const ordenadas = [...vigencias].sort((a, b) => (a.inicio < b.inicio ? 1 : -1))
  const atual = ordenadas.find((v) => v.fim == null) ?? ordenadas[0]

  return {
    ok: true,
    fecharVigenciaId: atual?.id,
    fecharVigenciaEm: diaAnterior(reajuste.data_efeito),
    novaVigencia: {
      inicio: reajuste.data_efeito,
      valor_aluguel: reajuste.valor_novo,
      origem: 'reajuste',
      reajuste_id: reajuste.id,
    },
    atualizarCacheValor: reajuste.valor_novo,
  }
}

// --- backfill (invariante da F0) -------------------------------------------

// Um contrato existente deve virar EXATAMENTE uma vigência 'inicial'
// com o valor da coluna cache.
export function vigenciaInicialDe(contrato: { id: string; data_inicio: string; valor_aluguel: number | null }) {
  if (contrato.valor_aluguel == null) return null
  return {
    contrato_id: contrato.id,
    inicio: contrato.data_inicio,
    valor_aluguel: contrato.valor_aluguel,
    origem: 'inicial' as const,
  }
}
