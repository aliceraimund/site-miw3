export type TipoPessoa = 'fisica' | 'juridica'

export interface Inquilino {
  id: string
  nome: string
  tipo_pessoa: TipoPessoa
  cpf_cnpj: string | null
  rg: string | null
  telefones: string | null
  email: string | null
  endereco: string | null
  observacoes: string | null
  imovel_relacionado_id: string | null
  criado_em: string
}

export interface InquilinoDocumento {
  id: string
  inquilino_id: string
  storage_path: string
  nome: string
  criado_em: string
}

export const TIPO_PESSOA_LABELS: Record<TipoPessoa, string> = {
  fisica: 'Pessoa física',
  juridica: 'Pessoa jurídica',
}
