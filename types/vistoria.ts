export type TipoImovelVistoria = 'residencial' | 'comercial'
export type TipoVistoria = 'entrada' | 'saida'
export type StatusVistoria = 'rascunho' | 'concluida'
export type EstadoItem = 'nova' | 'boa' | 'regular' | 'danificada' | 'nz'
export const ESTADOS_ITEM: EstadoItem[] = ['nova', 'boa', 'regular', 'danificada', 'nz']

// Opção de imóvel para a vistoria — agora vinda do cadastro unificado (tabela imoveis).
export interface ImovelVistoria {
  id: string
  nome: string
  endereco: string
  categoria: string
}

// A vistoria monta o checklist por tipo (residencial/comercial); imóveis
// industriais usam o checklist comercial.
export function categoriaParaTipoVistoria(categoria: string): TipoImovelVistoria {
  return categoria === 'residencial' ? 'residencial' : 'comercial'
}

export interface ChecklistTemplateItem {
  id: string
  tipo_imovel: TipoImovelVistoria
  secao: string
  item: string
  ordem: number
  ativo: boolean
  criado_em: string
  ambiente_template_id: string | null // nulo no checklist antigo, por sistema
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
  laudo_url: string | null // PDF arquivado no Google Drive
  fotos_liberadas_em: string | null // fotos removidas do storage
  imovel?: { nome: string; endereco: string } | null
}

export interface VistoriaItem {
  id: string
  vistoria_id: string
  template_item_id: string | null
  ambiente_id: string | null // ambiente (cômodo) a que o item pertence
  secao: string // nome do ambiente no momento da criação (histórico)
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
  vistoria_item_id: string | null // nulo quando a foto é do ambiente
  vistoria_ambiente_id: string | null
  storage_path: string
  legenda: string | null
  criado_em: string
}

// Ambiente padrão sugerido por tipo de imóvel (`padrao` = pré-marcado ao criar).
export interface VistoriaAmbienteTemplate {
  id: string
  tipo_imovel: TipoImovelVistoria
  nome: string
  ordem: number
  padrao: boolean
  ativo: boolean
}

// Ambiente DAQUELA vistoria — editável (renomear, adicionar, remover).
export interface VistoriaAmbiente {
  id: string
  vistoria_id: string
  nome: string
  ordem: number
  observacao: string | null
  criado_em: string
  vistoria_fotos?: VistoriaFoto[] // fotos gerais do ambiente
}
