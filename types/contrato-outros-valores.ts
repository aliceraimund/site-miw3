export type OutroValorTipo = 'despesa' | 'reembolso_positivo' | 'reembolso_negativo' | 'desconto'

export interface ContratoOutroValor {
  id: string
  contrato_id: string
  titulo: string
  valor: number
  qtd_parcelas: number | null // 0 = recorrente até o fim do contrato
  competencia_inicial: string | null // 'AAAA-MM'
  tipo: OutroValorTipo
  descricao: string | null
  nome_link: string | null
  url_link: string | null
  criado_em: string
}

export const OUTRO_VALOR_TIPO_LABELS: Record<OutroValorTipo, string> = {
  despesa: 'Despesa',
  reembolso_positivo: 'Reembolso (+)',
  reembolso_negativo: 'Reembolso (−)',
  desconto: 'Desconto',
}

export const OUTRO_VALOR_TIPO_COLORS: Record<OutroValorTipo, string> = {
  despesa: 'bg-amber-100 text-amber-800',
  reembolso_positivo: 'bg-green-100 text-green-800',
  reembolso_negativo: 'bg-red-100 text-red-800',
  desconto: 'bg-blue-100 text-blue-800',
}
