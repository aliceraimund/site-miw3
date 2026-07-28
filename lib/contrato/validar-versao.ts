// Validação que bloqueia a publicação de uma versão de modelo:
// - placeholder usado no corpo mas não declarado em modelo_variaveis (órfão);
// - variável obrigatória declarada que nunca é usada no corpo.

import type { Bloco } from './blocos'
import { isRunPlaceholder } from './blocos'

export interface ErroValidacao {
  tipo: 'placeholder_orfao' | 'obrigatoria_nao_usada'
  chave: string
  detalhe: string
}

interface VariavelDeclarada {
  chave: string
  obrigatoria: boolean
}

interface Usos {
  placeholders: Set<string> // placeholders de runs
  refs: Set<string> // quando/sobre/casos (referências de controle)
  aliases: Set<string> // 'como' de repetições (variáveis de laço)
}

function coletar(blocos: Bloco[], usos: Usos) {
  for (const bloco of blocos) {
    switch (bloco.tipo) {
      case 'titulo':
      case 'paragrafo':
        for (const run of bloco.runs) {
          if (isRunPlaceholder(run) && run.placeholder.trim()) usos.placeholders.add(run.placeholder.trim())
        }
        break
      case 'condicional':
        if (bloco.quando.trim()) usos.refs.add(bloco.quando.trim())
        coletar(bloco.blocos, usos)
        break
      case 'repeticao':
        if (bloco.sobre.trim()) usos.refs.add(bloco.sobre.trim())
        if (bloco.como.trim()) usos.aliases.add(bloco.como.trim())
        coletar(bloco.blocos, usos)
        break
      case 'alternativa':
        if (bloco.sobre.trim()) usos.refs.add(bloco.sobre.trim())
        for (const caso of Object.values(bloco.casos)) coletar(caso, usos)
        break
    }
  }
}

const cabeca = (chave: string) => chave.split('.')[0]

export function validarVersao(blocos: Bloco[], variaveis: VariavelDeclarada[]): ErroValidacao[] {
  const usos: Usos = { placeholders: new Set(), refs: new Set(), aliases: new Set() }
  coletar(blocos, usos)

  const declaradas = new Set(variaveis.map((v) => v.chave))
  const cabecasDeclaradas = new Set(variaveis.map((v) => cabeca(v.chave)))
  const erros: ErroValidacao[] = []

  // Um uso é considerado declarado se: bate exatamente, ou sua cabeça bate uma
  // chave/cabeça declarada, ou sua cabeça é alias de laço (ex.: 'l' em repetição).
  const estaDeclarado = (chave: string): boolean => {
    if (declaradas.has(chave)) return true
    const h = cabeca(chave)
    return cabecasDeclaradas.has(h) || declaradas.has(h) || usos.aliases.has(h)
  }

  for (const p of usos.placeholders) {
    if (!estaDeclarado(p)) {
      erros.push({ tipo: 'placeholder_orfao', chave: p, detalhe: `Placeholder "${p}" não está declarado nas variáveis.` })
    }
  }

  // Obrigatória não usada: nem como placeholder, nem como referência de controle
  // (por chave exata ou pela cabeça).
  const usadas = new Set<string>()
  for (const u of [...usos.placeholders, ...usos.refs]) {
    usadas.add(u)
    usadas.add(cabeca(u))
  }
  for (const v of variaveis) {
    if (!v.obrigatoria) continue
    if (!usadas.has(v.chave) && !usadas.has(cabeca(v.chave))) {
      erros.push({ tipo: 'obrigatoria_nao_usada', chave: v.chave, detalhe: `Variável obrigatória "${v.chave}" nunca é usada no corpo.` })
    }
  }

  return erros
}
