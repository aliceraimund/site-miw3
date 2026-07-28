export interface IndiceEconomico {
  id: string
  codigo: string
  nome: string
  fonte: string | null
  ativo: boolean
}

// ano_mes no formato 'YYYY-MM'.
export interface IndiceValorMensal {
  id: string
  indice_id: string
  ano_mes: string
  variacao_percentual: number
  informado_em: string
}
