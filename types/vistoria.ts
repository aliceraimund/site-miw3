export type TipoImovelVistoria = 'residencial' | 'comercial'
export type TipoVistoria = 'entrada' | 'saida'
export type StatusVistoria = 'rascunho' | 'concluida'
export type EstadoItem = 'bom' | 'regular' | 'avaria' | 'na'

export interface ImovelVistoria {
  id: string
  nome: string
  endereco: string
  tipo: TipoImovelVistoria
  criado_em: string
}

export interface ChecklistTemplateItem {
  id: string
  tipo_imovel: TipoImovelVistoria
  secao: string
  item: string
  ordem: number
  ativo: boolean
  criado_em: string
}

export interface Medidores {
  agua?: string
  energia?: string
  gas?: string
}

export interface ChaveEntregue {
  descricao: string
  quantidade: number
}

export interface Vistoria {
  id: string
  imovel_id: string
  tipo_vistoria: TipoVistoria
  data: string
  vistoriador: string | null
  locatario: string | null
  medidores: Medidores
  chaves: ChaveEntregue[]
  observacoes: string | null
  status: StatusVistoria
  criado_em: string
  atualizado_em: string
  imoveis_vistoria?: ImovelVistoria
}

export interface VistoriaItem {
  id: string
  vistoria_id: string
  template_item_id: string | null
  secao: string
  item: string
  ordem: number
  estado: EstadoItem | null
  observacao: string | null
  criado_em: string
  atualizado_em: string
  vistoria_fotos?: VistoriaFoto[]
}

export interface VistoriaFoto {
  id: string
  vistoria_item_id: string
  storage_path: string
  legenda: string | null
  criado_em: string
}
