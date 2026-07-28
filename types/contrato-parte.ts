export type PapelParte = 'locatario' | 'fiador'

export interface ContratoParte {
  id: string
  contrato_id: string
  inquilino_id: string
  papel: PapelParte
  ordem: number
}

export const PAPEL_PARTE_LABELS: Record<PapelParte, string> = {
  locatario: 'Locatário',
  fiador: 'Fiador',
}
