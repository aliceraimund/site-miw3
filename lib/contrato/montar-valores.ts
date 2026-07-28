// Monta o objeto `valores` (nested, endereçável por caminhos com ponto) usado
// pelo merge, a partir do imóvel, das partes e das entradas manuais. Computa os
// CALC via helpers (F1).

import { extenso, extensoMoeda, dataExtenso, listaPessoas } from './helpers'
import type { ModeloVariavel } from '@/types/modelo-contrato'

export interface ImovelParaContrato {
  [k: string]: unknown
  gestao?: { matricula?: string | null; inscricao_municipal?: string | null } | null
}
export interface InquilinoParaContrato {
  [k: string]: unknown
}

export interface ParteMontagem {
  inquilino: InquilinoParaContrato
  manual: Record<string, string> // campos PES sem caminho_origem (nacionalidade, etc.)
}

export interface EntradaMontagem {
  variaveis: ModeloVariavel[]
  imovel: ImovelParaContrato | null
  locatarios: ParteMontagem[]
  fiadores: ParteMontagem[]
  globalManual: Record<string, string> // CONST/MAN por chave
}

// Mapeia o sufixo da variável PES (após "locatarios."/"fiadores.") → campo do inquilino.
const PES_MAP: Record<string, string> = {
  nome: 'nome',
  cpf: 'cpf_cnpj',
  cnpj: 'cpf_cnpj',
  rg: 'rg',
  email: 'email',
  telefone: 'telefones',
  endereco: 'endereco',
}

function setPath(obj: Record<string, unknown>, caminho: string, valor: unknown) {
  const partes = caminho.split('.')
  let atual = obj
  for (let i = 0; i < partes.length - 1; i++) {
    const p = partes[i]
    if (typeof atual[p] !== 'object' || atual[p] === null) atual[p] = {}
    atual = atual[p] as Record<string, unknown>
  }
  atual[partes[partes.length - 1]] = valor
}

function valorImovel(imovel: ImovelParaContrato, caminho: string): unknown {
  const [tabela, campo] = caminho.split('.')
  if (tabela === 'imovel_gestao') return imovel.gestao?.[campo as 'matricula' | 'inscricao_municipal'] ?? ''
  if (tabela === 'imoveis') return imovel[campo] ?? ''
  return ''
}

function montarParte(p: ParteMontagem, sufixos: string[]): Record<string, unknown> {
  const item: Record<string, unknown> = {}
  for (const suf of sufixos) {
    const campoInquilino = PES_MAP[suf]
    if (campoInquilino) item[suf] = p.inquilino[campoInquilino] ?? ''
    else item[suf] = p.manual[suf] ?? ''
  }
  // Garante o nome mesmo que não listado.
  if (item.nome == null) item.nome = p.inquilino.nome ?? ''
  return item
}

export function montarValores(e: EntradaMontagem): Record<string, unknown> {
  const valores: Record<string, unknown> = {}

  // Sufixos PES declarados (para saber quais campos montar por pessoa).
  const sufixosLocatario = e.variaveis
    .filter((v) => v.chave.startsWith('locatarios.'))
    .map((v) => v.chave.slice('locatarios.'.length))
  const sufixosFiador = e.variaveis
    .filter((v) => v.chave.startsWith('fiadores.'))
    .map((v) => v.chave.slice('fiadores.'.length))

  for (const v of e.variaveis) {
    if (v.chave.startsWith('locatarios.') || v.chave.startsWith('fiadores.')) continue // via array
    switch (v.origem) {
      case 'IMV':
        if (e.imovel && v.caminho_origem) setPath(valores, v.chave, valorImovel(e.imovel, v.caminho_origem))
        break
      case 'CONST':
      case 'MAN':
        if (e.globalManual[v.chave] != null && e.globalManual[v.chave] !== '') setPath(valores, v.chave, e.globalManual[v.chave])
        break
      // PES (nível de array) e CALC tratados abaixo
    }
  }

  // Arrays de partes, com props extras (qtd/nomes) anexadas ao próprio array.
  const locatarios = e.locatarios.map((p) => montarParte(p, sufixosLocatario.length ? sufixosLocatario : ['nome']))
  ;(locatarios as unknown as { qtd: number }).qtd = locatarios.length
  ;(locatarios as unknown as { nomes: string }).nomes = listaPessoas(locatarios.map((l) => String(l.nome ?? '')))
  valores.locatarios = locatarios

  if (e.fiadores.length > 0) {
    const fiadores = e.fiadores.map((p) => montarParte(p, sufixosFiador.length ? sufixosFiador : ['nome']))
    ;(fiadores as unknown as { qtd: number }).qtd = fiadores.length
    valores.fiadores = fiadores
  } else {
    valores.fiadores = []
  }

  // CALC conhecidos (dependem dos valores base já preenchidos).
  const getNum = (caminho: string): number => {
    const partes = caminho.split('.')
    let atual: unknown = valores
    for (const p of partes) atual = atual != null && typeof atual === 'object' ? (atual as Record<string, unknown>)[p] : undefined
    const n = Number(atual)
    return Number.isFinite(n) ? n : 0
  }
  const getStr = (caminho: string): string => {
    const partes = caminho.split('.')
    let atual: unknown = valores
    for (const p of partes) atual = atual != null && typeof atual === 'object' ? (atual as Record<string, unknown>)[p] : undefined
    return atual != null ? String(atual) : ''
  }

  const calc: Record<string, () => unknown> = {
    'locatarios.qtd': () => locatarios.length,
    'locatarios.nomes': () => listaPessoas(locatarios.map((l) => String(l.nome ?? ''))),
    'prazo.mesesExtenso': () => extenso(getNum('prazo.meses')),
    'valores.aluguelExtenso': () => extensoMoeda(getNum('valores.aluguel')),
    'garantia.titulo.valorNominalExtenso': () => extensoMoeda(getNum('garantia.titulo.valorNominal')),
    'assinatura.dataExtenso': () => (getStr('assinatura.data') ? dataExtenso(getStr('assinatura.data')) : ''),
    'prazo.dataFim': () => (getStr('prazo.dataFim') ? getStr('prazo.dataFim') : ''),
  }
  for (const v of e.variaveis) {
    if (v.origem === 'CALC' && calc[v.chave]) setPath(valores, v.chave, calc[v.chave]())
  }

  return valores
}
