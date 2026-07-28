export type ReajusteStatus = 'pendente_indice' | 'projetado' | 'confirmado' | 'aplicado' | 'dispensado'
export type AditivoTipo = 'reajuste' | 'prorrogacao' | 'alteracao_partes' | 'alteracao_valor' | 'rescisao' | 'outro'

// memoria_calculo: janela de meses usada, acumulado bruto, aplicado e fórmula.
export interface MemoriaCalculo {
  meses: { ano_mes: string; variacao: number }[]
  acumulado_bruto: number
  aplicado: number
  formula: string
  [k: string]: unknown
}

export interface Reajuste {
  id: string
  contrato_id: string
  data_base: string
  data_efeito: string
  valor_base: number
  percentual_acumulado: number | null
  percentual_aplicado: number
  valor_novo: number
  status: ReajusteStatus
  memoria_calculo: MemoriaCalculo
  observacao: string | null
  aplicado_em: string | null
  criado_em: string
}

export interface ContratoAditivo {
  id: string
  contrato_id: string
  numero: number
  tipo: AditivoTipo | null
  data_efeito: string
  corpo_blocos: Record<string, unknown> | null
  resumo: string | null
  criado_em: string
}

export const REAJUSTE_STATUS_LABELS: Record<ReajusteStatus, string> = {
  pendente_indice: 'Pendente de índice',
  projetado: 'Projetado',
  confirmado: 'Confirmado',
  aplicado: 'Aplicado',
  dispensado: 'Dispensado',
}

export const REAJUSTE_STATUS_COLORS: Record<ReajusteStatus, string> = {
  pendente_indice: 'bg-red-100 text-red-800',
  projetado: 'bg-amber-100 text-amber-800',
  confirmado: 'bg-blue-100 text-blue-800',
  aplicado: 'bg-green-100 text-green-800',
  dispensado: 'bg-slate-100 text-slate-600',
}

export const ADITIVO_TIPO_LABELS: Record<AditivoTipo, string> = {
  reajuste: 'Reajuste',
  prorrogacao: 'Prorrogação',
  alteracao_partes: 'Alteração de partes',
  alteracao_valor: 'Alteração de valor',
  rescisao: 'Rescisão',
  outro: 'Outro',
}
