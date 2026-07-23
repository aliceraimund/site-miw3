export type ContratoTipo = 'residencial' | 'comercial' | 'temporada'
export type ContratoStatus = 'ativo' | 'encerrado' | 'renovado'
export type IndiceReajuste = 'igpm' | 'ipca' | 'incc' | 'outro' | 'nenhum'

export interface Contrato {
  id: string
  imovel_id: string
  inquilino_id: string
  tipo: ContratoTipo
  data_inicio: string
  data_fim: string | null
  valor_aluguel: number | null
  dia_vencimento: number | null
  indice_reajuste: IndiceReajuste | null
  mes_reajuste: number | null
  status: ContratoStatus
  observacoes: string | null
  criado_em: string
  atualizado_em: string
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
