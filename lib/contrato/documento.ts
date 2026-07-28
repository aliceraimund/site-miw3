// Ponte entre a árvore de blocos (corpo_blocos) e o editor-documento.
// - Agrupa o corpo em "regiões": trechos de texto corrido (títulos/parágrafos)
//   e trechos especiais (condicional/repetição/alternativa).
// - Converte blocos de texto para HTML (para o contenteditable) e de volta.

import type { Bloco, BlocoParagrafo, BlocoTitulo, Run } from './blocos'
import { isRunPlaceholder } from './blocos'

export type BlocoTexto = BlocoTitulo | BlocoParagrafo

export type Regiao =
  | { tipo: 'texto'; blocos: BlocoTexto[] }
  | { tipo: 'especial'; bloco: Exclude<Bloco, BlocoTitulo | BlocoParagrafo> }

export function ehTexto(b: Bloco): b is BlocoTexto {
  return b.tipo === 'titulo' || b.tipo === 'paragrafo'
}

export function agruparRegioes(blocos: Bloco[]): Regiao[] {
  const regioes: Regiao[] = []
  let buffer: BlocoTexto[] = []
  const flush = () => {
    if (buffer.length) { regioes.push({ tipo: 'texto', blocos: buffer }); buffer = [] }
  }
  for (const b of blocos) {
    if (ehTexto(b)) buffer.push(b)
    else { flush(); regioes.push({ tipo: 'especial', bloco: b }) }
  }
  flush()
  return regioes
}

export function regioesParaBlocos(regioes: Regiao[]): Bloco[] {
  const out: Bloco[] = []
  for (const r of regioes) {
    if (r.tipo === 'texto') out.push(...r.blocos)
    else out.push(r.bloco)
  }
  return out
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function runParaHtml(run: Run, labelDe: (chave: string) => string): string {
  if (isRunPlaceholder(run)) {
    const label = labelDe(run.placeholder) || run.placeholder
    const chip = `<span class="chip-var" data-var="${escapeHtml(run.placeholder)}" contenteditable="false">${escapeHtml(label)}</span>`
    return run.negrito ? `<b>${chip}</b>` : chip
  }
  const txt = escapeHtml(run.texto)
  return run.negrito ? `<b>${txt}</b>` : txt
}

// Blocos de texto → HTML para o contenteditable (um <h3>/<p> por bloco).
export function blocosTextoParaHtml(blocos: BlocoTexto[], labelDe: (chave: string) => string): string {
  if (blocos.length === 0) return '<p><br></p>'
  return blocos
    .map((b) => {
      const inner = b.runs.map((r) => runParaHtml(r, labelDe)).join('') || '<br>'
      return b.tipo === 'titulo' ? `<h3>${inner}</h3>` : `<p>${inner}</p>`
    })
    .join('')
}

// Junta runs de texto adjacentes com o mesmo negrito.
function normalizarRuns(runs: Run[]): Run[] {
  const out: Run[] = []
  for (const r of runs) {
    const ultimo = out[out.length - 1]
    if (ultimo && !isRunPlaceholder(ultimo) && !isRunPlaceholder(r) && Boolean(ultimo.negrito) === Boolean(r.negrito)) {
      ultimo.texto += r.texto
    } else {
      out.push({ ...r })
    }
  }
  return out.filter((r) => isRunPlaceholder(r) || r.texto !== '')
}

// DOM de um bloco (<h3>/<p>) → runs.
function parseInline(el: Node, negrito: boolean, runs: Run[]) {
  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const texto = node.textContent ?? ''
      if (texto) runs.push({ texto, negrito })
      return
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return
    const elem = node as HTMLElement
    const chave = elem.getAttribute('data-var')
    if (chave) {
      runs.push({ placeholder: chave, negrito })
      return
    }
    const tag = elem.tagName.toLowerCase()
    const bold = negrito || tag === 'b' || tag === 'strong' || /^(bold|[6-9]00)$/.test(elem.style.fontWeight)
    parseInline(elem, bold, runs)
  })
}

// contenteditable → blocos de texto.
export function elementoParaBlocosTexto(raiz: HTMLElement): BlocoTexto[] {
  const blocos: BlocoTexto[] = []
  const filhos = Array.from(raiz.children).length ? Array.from(raiz.children) : [raiz]
  for (const filho of filhos) {
    const el = filho as HTMLElement
    const runs: Run[] = []
    parseInline(el, false, runs)
    const norm = normalizarRuns(runs)
    const tipo = el.tagName.toLowerCase() === 'h3' ? 'titulo' : 'paragrafo'
    blocos.push({ tipo, runs: norm.length ? norm : [{ texto: '' }] } as BlocoTexto)
  }
  return blocos.filter((b) => b.runs.some((r) => isRunPlaceholder(r) || r.texto.trim() !== '') || blocos.length === 1)
}
