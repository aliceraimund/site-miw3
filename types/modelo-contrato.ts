import type { CategoriaEnum } from './imovel'

export type ModeloVersaoStatus = 'rascunho' | 'publicada' | 'arquivada'

export interface ModeloContrato {
  id: string
  codigo: string
  nome: string
  categoria: CategoriaEnum | null
  descricao: string | null
  ativo: boolean
  criado_em: string
}

// corpo_blocos: árvore de blocos (não HTML). Estrutura detalhada modelada na F1.
export interface CorpoBlocos {
  blocos: unknown[]
}

export interface ModeloContratoVersao {
  id: string
  modelo_id: string
  versao: number
  corpo_blocos: CorpoBlocos
  changelog: string | null
  status: ModeloVersaoStatus
  publicado_em: string | null
  criado_em: string
}

export interface ModeloVariavel {
  id: string
  versao_id: string
  chave: string
  label: string
  tipo: string
  origem: string // CONST | MAN | IMV | PES | CALC
  caminho_origem: string | null
  obrigatoria: boolean
  valor_padrao: string | null
  grupo: string | null
  ordem: number
}

export const MODELO_VERSAO_STATUS_LABELS: Record<ModeloVersaoStatus, string> = {
  rascunho: 'Rascunho',
  publicada: 'Publicada',
  arquivada: 'Arquivada',
}
