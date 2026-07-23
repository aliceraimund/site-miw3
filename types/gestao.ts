export type SituacaoGestao = 'disponivel' | 'alugado' | 'temporada' | 'indisponivel'
export type ContaTipo = 'iptu' | 'agua' | 'energia' | 'gas' | 'internet' | 'condominio' | 'lixo' | 'outros'
export type ContaResponsavel = 'proprietario' | 'inquilino' | 'incluso'

export interface ImovelGestao {
  imovel_id: string
  matricula: string | null
  inscricao_municipal: string | null
  area_construida: number | null
  area_terreno: number | null
  situacao_gestao: SituacaoGestao
  observacoes: string | null
  atualizado_em: string
}

export interface ImovelConta {
  id: string
  imovel_id: string
  tipo: ContaTipo
  numero_identificacao: string | null
  responsavel: ContaResponsavel
  observacao: string | null
  criado_em: string
}

export interface ImovelDocumento {
  id: string
  imovel_id: string
  storage_path: string
  nome: string
  tipo: string | null
  criado_em: string
}

export const SITUACAO_GESTAO_LABELS: Record<SituacaoGestao, string> = {
  disponivel: 'Disponível',
  alugado: 'Alugado',
  temporada: 'Temporada',
  indisponivel: 'Indisponível',
}

export const SITUACAO_GESTAO_COLORS: Record<SituacaoGestao, string> = {
  disponivel: 'bg-green-100 text-green-800',
  alugado: 'bg-blue-100 text-blue-800',
  temporada: 'bg-purple-100 text-purple-800',
  indisponivel: 'bg-slate-100 text-slate-600',
}

export const CONTA_TIPO_LABELS: Record<ContaTipo, string> = {
  iptu: 'IPTU',
  agua: 'Água',
  energia: 'Energia',
  gas: 'Gás',
  internet: 'Internet',
  condominio: 'Condomínio',
  lixo: 'Taxa de lixo',
  outros: 'Outros',
}

export const CONTA_RESPONSAVEL_LABELS: Record<ContaResponsavel, string> = {
  proprietario: 'Proprietário',
  inquilino: 'Inquilino',
  incluso: 'Incluso no aluguel',
}
