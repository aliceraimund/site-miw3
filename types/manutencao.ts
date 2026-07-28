export type ManutencaoStatus = 'aberto' | 'em_andamento' | 'concluido' | 'cancelado'

export interface Manutencao {
  id: string
  imovel_id: string
  contrato_id: string | null
  titulo: string
  descricao: string | null
  prestador: string | null
  solicitante: string | null
  status: ManutencaoStatus
  custo_estimado: number | null
  custo_real: number | null
  data_abertura: string
  data_inicio: string | null
  data_conclusao_estimada: string | null
  data_conclusao_real: string | null
  criado_em: string
  atualizado_em: string
}

export interface ManutencaoFoto {
  id: string
  manutencao_id: string
  storage_path: string
  legenda: string | null
  criado_em: string
}

export const MANUTENCAO_STATUS_LABELS: Record<ManutencaoStatus, string> = {
  aberto: 'Aberto',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
}

export const MANUTENCAO_STATUS_COLORS: Record<ManutencaoStatus, string> = {
  aberto: 'bg-amber-100 text-amber-800',
  em_andamento: 'bg-blue-100 text-blue-800',
  concluido: 'bg-green-100 text-green-800',
  cancelado: 'bg-slate-100 text-slate-600',
}
