export type ContratoTipo = 'residencial' | 'comercial' | 'temporada'
export type ContratoStatus = 'ativo' | 'encerrado' | 'renovado'
export type IndiceReajuste = 'igpm' | 'ipca' | 'incc' | 'outro' | 'nenhum'
export type RegimePrimeiroMes = 'pro_rata' | 'integral' | 'carencia'
export type TipoGarantia = 'fiador' | 'caucao' | 'titulo_capitalizacao' | 'seguro_fianca' | 'nenhuma'

export interface Contrato {
  id: string
  imovel_id: string
  inquilino_id: string
  tipo: ContratoTipo
  data_inicio: string
  data_fim: string | null
  valor_aluguel: number | null // cache do valor corrente; fonte da verdade = contrato_vigencias_valor
  dia_vencimento: number | null
  indice_reajuste: IndiceReajuste | null
  mes_reajuste: number | null
  status: ContratoStatus
  observacoes: string | null
  criado_em: string
  atualizado_em: string
  // F0 — extensões
  modelo_versao_id: string | null
  valores_variaveis: Record<string, unknown> | null
  corpo_gerado: Record<string, unknown> | null
  dia_vencimento_primeiro: string | null
  regime_primeiro_mes: RegimePrimeiroMes
  periodicidade_reajuste_meses: number | null
  defasagem_indice_meses: number | null
  trava_deflacao: boolean
  percentual_minimo_reajuste: number | null
  percentual_maximo_reajuste: number | null
  percentual_fixo_reajuste: number | null
  indice_correcao_mora: string | null
  multa_mora_percentual: number | null
  juros_mensal_percentual: number | null
  tipo_garantia: TipoGarantia
  garantia_detalhes: Record<string, unknown> | null
}

export const REGIME_PRIMEIRO_MES_LABELS: Record<RegimePrimeiroMes, string> = {
  pro_rata: 'Pró-rata',
  integral: 'Integral',
  carencia: 'Carência',
}

export const TIPO_GARANTIA_LABELS: Record<TipoGarantia, string> = {
  fiador: 'Fiador',
  caucao: 'Caução',
  titulo_capitalizacao: 'Título de capitalização',
  seguro_fianca: 'Seguro-fiança',
  nenhuma: 'Nenhuma',
}

export const CONTRATO_TIPO_LABELS: Record<ContratoTipo, string> = {
  residencial: 'Residencial',
  comercial: 'Comercial',
  temporada: 'Temporada',
}

export const CONTRATO_STATUS_LABELS: Record<ContratoStatus, string> = {
  ativo: 'Ativo',
  encerrado: 'Encerrado',
  renovado: 'Renovado',
}

export const CONTRATO_STATUS_COLORS: Record<ContratoStatus, string> = {
  ativo: 'bg-green-100 text-green-800',
  encerrado: 'bg-slate-100 text-slate-600',
  renovado: 'bg-blue-100 text-blue-800',
}

export const INDICE_REAJUSTE_LABELS: Record<IndiceReajuste, string> = {
  igpm: 'IGP-M',
  ipca: 'IPCA',
  incc: 'INCC',
  outro: 'Outro',
  nenhum: 'Sem reajuste',
}

export type TipoEvento =
  | 'criacao'
  | 'reajuste'
  | 'renovacao'
  | 'alteracao'
  | 'encerramento'
  | 'reajuste_projetado'
  | 'reajuste_aplicado'
  | 'aditivo'
  | 'documento_gerado'

export interface ContratoHistorico {
  id: string
  contrato_id: string
  tipo_evento: TipoEvento
  descricao: string | null
  valor_anterior: number | null
  valor_novo: number | null
  data: string
  criado_em: string
}

export const TIPO_EVENTO_LABELS: Record<TipoEvento, string> = {
  criacao: 'Criação',
  reajuste: 'Reajuste',
  renovacao: 'Renovação',
  alteracao: 'Alteração',
  encerramento: 'Encerramento',
  reajuste_projetado: 'Reajuste projetado',
  reajuste_aplicado: 'Reajuste aplicado',
  aditivo: 'Aditivo',
  documento_gerado: 'Documento gerado',
}

export const TIPO_EVENTO_COLORS: Record<TipoEvento, string> = {
  criacao: 'bg-blue-100 text-blue-800',
  reajuste: 'bg-amber-100 text-amber-800',
  renovacao: 'bg-green-100 text-green-800',
  alteracao: 'bg-slate-100 text-slate-600',
  encerramento: 'bg-red-100 text-red-800',
  reajuste_projetado: 'bg-amber-100 text-amber-800',
  reajuste_aplicado: 'bg-green-100 text-green-800',
  aditivo: 'bg-blue-100 text-blue-800',
  documento_gerado: 'bg-slate-100 text-slate-600',
}
