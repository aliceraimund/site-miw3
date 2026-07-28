export type GrupoTag = 'proprietario' | 'inquilino' | 'imovel' | 'contrato'

// Registro global de tags de sistema — auto-preenchidas no documento como {chave}.
// caminho_origem: 'tabela.coluna' | 'const.<chave>' | 'partes.<x>' | 'calc.<x>'
export interface ContratoTagSistema {
  id: string
  chave: string
  label: string
  grupo: GrupoTag
  caminho_origem: string
  ordem: number
}

export const GRUPO_TAG_LABELS: Record<GrupoTag, string> = {
  proprietario: 'Proprietário',
  inquilino: 'Inquilino',
  imovel: 'Imóvel',
  contrato: 'Contrato',
}
