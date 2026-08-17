export type DisponibilidadeEnum = 'venda' | 'locacao' | 'ambos'
export type StatusEnum = 'disponivel' | 'em_reforma' | 'em_construcao' | 'reservado'
export type CategoriaEnum = 'residencial' | 'comercial' | 'industrial'
// De quem é o imóvel anunciado: carteira própria da MIW3 ou corretor parceiro.
export type OrigemEnum = 'propria' | 'parceiro'

export const ORIGEM_LABELS: Record<OrigemEnum, string> = {
  propria: 'Imóvel de Carteira Própria',
  parceiro: 'Imóvel de Corretores Parceiros',
}

// Aviso exibido dentro do anúncio, conforme a origem.
export const ORIGEM_AVISOS: Record<OrigemEnum, string> = {
  propria:
    'Imóveis de propriedade da MIW3. Corretores e imobiliárias estão autorizados a divulgar em seus canais. Não há participação de corretor intermediário na comissão.',
  parceiro:
    'Imóveis de corretores parceiros. As condições de parceria, comissão e visitas devem ser alinhadas diretamente com o corretor responsável informado no anúncio.',
}

export interface Imovel {
  id: string
  nome: string
  tipo: string
  categoria: CategoriaEnum
  endereco_completo: string
  bairro: string
  cidade: string
  disponivel_para: DisponibilidadeEnum
  preco_venda: number | null
  preco_locacao: number | null
  iptu: number | null
  condominio: number | null
  area_m2: number
  quartos: number | null
  suites: number | null
  banheiros: number | null
  vagas: number | null
  status: StatusEnum
  fotos: string[] | null
  descricao: string | null
  destaque: boolean
  publicado: boolean
  valor_livre: boolean
  valor_livre_venda: boolean
  whatsapp: string | null
  ordem: number | null
  gerido: boolean
  origem: OrigemEnum
  criado_em: string
}
