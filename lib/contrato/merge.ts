// Motor de merge: resolve a árvore de blocos (placeholders/condicionais/
// repetições/alternativas) contra um objeto de valores, produzindo uma lista
// plana de blocos de texto que o preview e o PDF percorrem.

import type { Bloco, Run } from './blocos'
import { isRunPlaceholder } from './blocos'

export interface RunResolvido {
  texto: string
  negrito: boolean
}
export interface BlocoResolvido {
  tipo: 'titulo' | 'paragrafo'
  runs: RunResolvido[]
}

type Escopo = Record<string, unknown>

// Resolve caminho com pontos (ex.: "imovel.logradouro", "l.nome") no escopo.
export function getPath(escopo: Escopo, caminho: string): unknown {
  return caminho.split('.').reduce<unknown>((acc, chave) => {
    if (acc == null || typeof acc !== 'object') return undefined
    return (acc as Record<string, unknown>)[chave]
  }, escopo)
}

function valorParaTexto(valor: unknown): string {
  if (valor == null) return ''
  if (Array.isArray(valor)) return valor.map(valorParaTexto).join(', ')
  if (typeof valor === 'boolean') return valor ? 'sim' : 'não'
  return String(valor)
}

function resolverRuns(runs: Run[], escopo: Escopo): RunResolvido[] {
  return runs.map((r) => ({
    texto: isRunPlaceholder(r) ? valorParaTexto(getPath(escopo, r.placeholder)) : r.texto,
    negrito: Boolean(r.negrito),
  }))
}

function resolverBlocos(blocos: Bloco[], escopo: Escopo): BlocoResolvido[] {
  const saida: BlocoResolvido[] = []
  for (const bloco of blocos) {
    switch (bloco.tipo) {
      case 'titulo':
      case 'paragrafo':
        saida.push({ tipo: bloco.tipo, runs: resolverRuns(bloco.runs, escopo) })
        break
      case 'condicional':
        if (getPath(escopo, bloco.quando)) {
          saida.push(...resolverBlocos(bloco.blocos, escopo))
        }
        break
      case 'repeticao': {
        const lista = getPath(escopo, bloco.sobre)
        if (Array.isArray(lista)) {
          lista.forEach((item, idx) => {
            const escopoItem: Escopo = { ...escopo, [bloco.como]: item, [`${bloco.como}_indice`]: idx }
            saida.push(...resolverBlocos(bloco.blocos, escopoItem))
          })
        }
        break
      }
      case 'alternativa': {
        const chave = valorParaTexto(getPath(escopo, bloco.sobre))
        const caso = bloco.casos[chave]
        if (caso) saida.push(...resolverBlocos(caso, escopo))
        break
      }
    }
  }
  return saida
}

export function renderizarBlocos(blocos: Bloco[], valores: Escopo): BlocoResolvido[] {
  return resolverBlocos(blocos, valores)
}
