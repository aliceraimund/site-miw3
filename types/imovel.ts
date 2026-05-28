export type DisponibilidadeEnum = 'venda' | 'locacao' | 'ambos'
export type StatusEnum = 'disponivel' | 'em_reforma' | 'reservado'

export interface Imovel {
  id: string
  nome: string
  tipo: string
  endereco_completo: string
  bairro: string
  cidade: string
  disponivel_para: DisponibilidadeEnum
  preco_venda: number | null
  preco_locacao: number | null
  iptu: number | null
  area_m2: number
  quartos: number | null
  suites: number | null
  banheiros: number | null
  vagas: number | null
  status: StatusEnum
  fotos: string[] | null
  descricao: string | null
  destaque: boolean
  valor_livre: boolean
  valor_livre_venda: boolean
  criado_em: string
}
