// Checagem de "cadastro completo": dado o conjunto de variáveis obrigatórias do
// modelo, verifica o que falta no imóvel (origem IMV) e nas partes (origem PES),
// olhando apenas as que têm caminho_origem (auto-mapeáveis).

import type { ModeloVariavel } from '@/types/modelo-contrato'
import type { ImovelParaContrato, InquilinoParaContrato } from './montar-valores'

export interface Pendencia {
  chave: string
  label: string
}

const PES_MAP: Record<string, string> = { nome: 'nome', cpf: 'cpf_cnpj', cnpj: 'cpf_cnpj', rg: 'rg', email: 'email', telefone: 'telefones', endereco: 'endereco' }

function vazio(v: unknown): boolean {
  return v == null || String(v).trim() === ''
}

export function pendenciasImovel(variaveis: ModeloVariavel[], imovel: ImovelParaContrato | null): Pendencia[] {
  if (!imovel) return []
  const pend: Pendencia[] = []
  for (const v of variaveis) {
    if (v.origem !== 'IMV' || !v.obrigatoria || !v.caminho_origem) continue
    const [tabela, campo] = v.caminho_origem.split('.')
    const valor = tabela === 'imovel_gestao' ? imovel.gestao?.[campo as 'matricula' | 'inscricao_municipal'] : imovel[campo]
    if (vazio(valor)) pend.push({ chave: v.chave, label: v.label })
  }
  return pend
}

export function pendenciasParte(variaveis: ModeloVariavel[], inquilino: InquilinoParaContrato): Pendencia[] {
  const pend: Pendencia[] = []
  for (const v of variaveis) {
    if (v.origem !== 'PES' || !v.obrigatoria) continue
    // Considera só campos por-pessoa mapeáveis (sufixo após "locatarios."/"fiadores.").
    const suf = v.chave.includes('.') ? v.chave.split('.').slice(1).join('.') : v.chave
    const campo = PES_MAP[suf]
    if (!campo) continue
    if (vazio(inquilino[campo])) pend.push({ chave: v.chave, label: v.label })
  }
  return pend
}
