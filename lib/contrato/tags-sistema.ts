// Preenchimento das tags de sistema no documento HTML + verificação pré-voo.
//
// Regras:
// - Só substitui {chave} que existe em contrato_tags_sistema.
// - {PREENCHER ...} é texto literal do usuário — NUNCA é tocado.
// - Pré-voo lista {PREENCHER ...} restantes e {tags} desconhecidas.

import { MIW3 } from './constantes-miw3'
import { extensoMoeda, dataExtenso, moeda, listaPessoas } from './helpers'
import type { ContratoTagSistema } from '@/types/contrato-tag'
import { CONTRATO_TIPO_LABELS, INDICE_REAJUSTE_LABELS, TIPO_GARANTIA_LABELS, MODALIDADE_COBRANCA_LABELS, TITULO_COBRANCA_LABELS } from '@/types/contrato'

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

export interface FontesTags {
  contrato?: Record<string, unknown> | null
  imovel?: Record<string, unknown> | null
  imovelGestao?: Record<string, unknown> | null
  inquilino?: Record<string, unknown> | null // locatário principal
  locatarios?: { nome?: string | null }[] // todos, para {inquilino_nomes}
}

const dataBR = (iso: unknown): string => {
  const s = String(iso ?? '')
  const [a, m, d] = s.split('-')
  return a && m && d ? `${d}/${m}/${a}` : ''
}

function formatarValor(caminho: string, bruto: unknown, fontes: FontesTags): string {
  if (bruto == null || bruto === '') return ''
  const [tabela, coluna] = caminho.split('.')

  // Dinheiro
  if (coluna === 'valor_aluguel') return moeda(Number(bruto))
  // Datas
  if (coluna === 'data_inicio' || coluna === 'data_fim') return dataBR(bruto)
  // Rótulos de enum
  if (tabela === 'contratos') {
    if (coluna === 'tipo') return CONTRATO_TIPO_LABELS[bruto as keyof typeof CONTRATO_TIPO_LABELS] ?? String(bruto)
    if (coluna === 'indice_reajuste') return INDICE_REAJUSTE_LABELS[bruto as keyof typeof INDICE_REAJUSTE_LABELS] ?? String(bruto)
    if (coluna === 'tipo_garantia') return TIPO_GARANTIA_LABELS[bruto as keyof typeof TIPO_GARANTIA_LABELS] ?? String(bruto)
    if (coluna === 'modalidade_cobranca') return MODALIDADE_COBRANCA_LABELS[bruto as keyof typeof MODALIDADE_COBRANCA_LABELS] ?? String(bruto)
    if (coluna === 'titulo_cobranca') return TITULO_COBRANCA_LABELS[bruto as keyof typeof TITULO_COBRANCA_LABELS] ?? String(bruto)
    if (coluna === 'mes_reajuste') {
      const n = Number(bruto)
      return n >= 1 && n <= 12 ? MESES[n - 1] : String(bruto)
    }
  }
  if (tabela === 'inquilinos' && coluna === 'tipo_pessoa') return bruto === 'juridica' ? 'pessoa jurídica' : 'pessoa física'
  void fontes
  return String(bruto)
}

// Resolve o valor de UMA tag a partir do caminho_origem.
function resolver(caminho: string, fontes: FontesTags): string {
  const [tabela, coluna] = caminho.split('.')

  if (tabela === 'const') return String((MIW3 as Record<string, string>)[coluna] ?? '')

  if (tabela === 'calc') {
    if (coluna === 'valorAluguelExtenso') {
      const v = fontes.contrato?.valor_aluguel
      return v == null ? '' : extensoMoeda(Number(v))
    }
    if (coluna === 'dataHojeExtenso') return dataExtenso(new Date().toISOString().slice(0, 10))
    return ''
  }

  if (tabela === 'partes') {
    if (coluna === 'nomes') {
      const nomes = (fontes.locatarios ?? []).map((l) => String(l?.nome ?? '')).filter(Boolean)
      return listaPessoas(nomes)
    }
    return ''
  }

  const mapa: Record<string, Record<string, unknown> | null | undefined> = {
    contratos: fontes.contrato,
    imoveis: fontes.imovel,
    imovel_gestao: fontes.imovelGestao,
    inquilinos: fontes.inquilino,
  }
  const fonte = mapa[tabela]
  if (!fonte) return ''
  return formatarValor(caminho, fonte[coluna], fontes)
}

// Monta { chave: valorFormatado } para todas as tags conhecidas.
export function montarDadosTags(tags: ContratoTagSistema[], fontes: FontesTags): Record<string, string> {
  const out: Record<string, string> = {}
  for (const tag of tags) out[tag.chave] = resolver(tag.caminho_origem, fontes)
  return out
}

// Remove os chips visuais do editor, preservando o texto interno ({chave} ou já resolvido).
function desembrulharChips(html: string): string {
  return html.replace(/<span[^>]*data-tag="[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '$1')
}

// Substitui apenas as {chave} conhecidas. {PREENCHER ...} e desconhecidas ficam.
export function preencherTagsSistema(html: string, valores: Record<string, string>): string {
  let saida = desembrulharChips(html)
  for (const [chave, valor] of Object.entries(valores)) {
    saida = saida.split(`{${chave}}`).join(valor)
  }
  return saida
}

export interface Pendencias {
  preencher: string[] // {PREENCHER ...} restantes
  desconhecidas: string[] // {algo} que não é tag de sistema
}

// Verificação pré-voo: escaneia o documento e lista o que impede ir a "vigente".
export function verificarPendencias(html: string, chavesConhecidas: string[]): Pendencias {
  const texto = desembrulharChips(html).replace(/<[^>]+>/g, ' ')
  const conhecidas = new Set(chavesConhecidas)
  const preencher = new Set<string>()
  const desconhecidas = new Set<string>()

  const re = /\{([^{}]+)\}/g
  let m: RegExpExecArray | null
  while ((m = re.exec(texto)) !== null) {
    const conteudo = m[1].trim()
    if (/^PREENCHER\b/i.test(conteudo)) {
      preencher.add(`{${conteudo}}`)
    } else if (!conhecidas.has(conteudo)) {
      desconhecidas.add(`{${conteudo}}`)
    }
  }
  return { preencher: [...preencher], desconhecidas: [...desconhecidas] }
}
