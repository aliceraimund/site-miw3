// Árvore de blocos do corpo do modelo de contrato (formato JSON, NÃO HTML).
// O editor produz esta estrutura; o merge e o PDF a percorrem.

export interface RunTexto {
  texto: string
  negrito?: boolean
}
export interface RunPlaceholder {
  placeholder: string
  negrito?: boolean
}
export type Run = RunTexto | RunPlaceholder

export interface BlocoTitulo {
  tipo: 'titulo'
  runs: Run[]
}
export interface BlocoParagrafo {
  tipo: 'paragrafo'
  runs: Run[]
}
export interface BlocoCondicional {
  tipo: 'condicional'
  quando: string
  blocos: Bloco[]
}
export interface BlocoRepeticao {
  tipo: 'repeticao'
  sobre: string
  como: string
  blocos: Bloco[]
}
export interface BlocoAlternativa {
  tipo: 'alternativa'
  sobre: string
  casos: Record<string, Bloco[]>
}

export type Bloco = BlocoTitulo | BlocoParagrafo | BlocoCondicional | BlocoRepeticao | BlocoAlternativa
export type BlocoTipo = Bloco['tipo']

export interface CorpoBlocos {
  blocos: Bloco[]
}

export function isRunPlaceholder(r: Run): r is RunPlaceholder {
  return 'placeholder' in r
}

export const BLOCO_TIPO_LABELS: Record<BlocoTipo, string> = {
  titulo: 'Título',
  paragrafo: 'Parágrafo',
  condicional: 'Condicional',
  repeticao: 'Repetição',
  alternativa: 'Alternativa',
}

export function blocoVazio(tipo: BlocoTipo): Bloco {
  switch (tipo) {
    case 'titulo':
      return { tipo: 'titulo', runs: [{ texto: '' }] }
    case 'paragrafo':
      return { tipo: 'paragrafo', runs: [{ texto: '' }] }
    case 'condicional':
      return { tipo: 'condicional', quando: '', blocos: [] }
    case 'repeticao':
      return { tipo: 'repeticao', sobre: '', como: 'item', blocos: [] }
    case 'alternativa':
      return { tipo: 'alternativa', sobre: '', casos: {} }
  }
}
