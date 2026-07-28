export type OrigemVigencia = 'inicial' | 'reajuste' | 'aditivo' | 'correcao'

// Fonte da verdade do valor do aluguel — histórico imutável (nunca sobrescrever).
export interface ContratoVigenciaValor {
  id: string
  contrato_id: string
  inicio: string
  fim: string | null
  valor_aluguel: number
  valor_condominio: number | null
  valor_iptu: number | null
  outros_encargos: Record<string, unknown> | null
  origem: OrigemVigencia
  reajuste_id: string | null
  criado_em: string
}

export const ORIGEM_VIGENCIA_LABELS: Record<OrigemVigencia, string> = {
  inicial: 'Inicial',
  reajuste: 'Reajuste',
  aditivo: 'Aditivo',
  correcao: 'Correção',
}
