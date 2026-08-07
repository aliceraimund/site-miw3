// Datas derivadas do contrato. Reajuste e vencimento são conceitos SEPARADOS:
// - vencimento do contrato = data_fim
// - aniversário de reajuste = próxima data-base (mês/ano)

const MESES_CURTO = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

interface ContratoDatas {
  data_inicio: string
  data_fim: string | null
  mes_reajuste: number | null
  periodicidade_reajuste_meses: number | null
}

// Próxima data-base de reajuste (a partir de hoje). Null se não há reajuste definido.
export function proximoAniversarioReajuste(c: ContratoDatas, hoje = new Date()): { ano: number; mes: number } | null {
  const periodicidade = c.periodicidade_reajuste_meses ?? 12
  if (!c.data_inicio || periodicidade <= 0) return null

  const [anoIni, mesIni] = c.data_inicio.split('-').map(Number)
  if (!anoIni || !mesIni) return null

  // Base: mês de reajuste declarado, senão o mês de início.
  const mesBase = c.mes_reajuste ?? mesIni
  const hojeIdx = hoje.getFullYear() * 12 + hoje.getMonth() // 0-based
  const iniIdx = anoIni * 12 + (mesBase - 1)

  // Avança em múltiplos da periodicidade até passar do mês corrente.
  let idx = iniIdx
  while (idx <= hojeIdx) idx += periodicidade

  // Não passa do fim da vigência.
  if (c.data_fim) {
    const [anoFim, mesFim] = c.data_fim.split('-').map(Number)
    if (anoFim && mesFim && idx > anoFim * 12 + (mesFim - 1)) return null
  }
  return { ano: Math.floor(idx / 12), mes: (idx % 12) + 1 }
}

export function formatarMesAno(v: { ano: number; mes: number } | null): string {
  if (!v) return '—'
  return `${MESES_CURTO[v.mes - 1]}/${v.ano}`
}

// Dias até uma data ISO (negativo = já passou).
export function diasAte(iso: string | null, hoje = new Date()): number | null {
  if (!iso) return null
  const [a, m, d] = iso.split('-').map(Number)
  if (!a || !m || !d) return null
  const alvo = new Date(a, m - 1, d)
  const base = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  return Math.round((alvo.getTime() - base.getTime()) / 86400000)
}

// Código curto e estável do contrato (não há coluna própria).
export function codigoContrato(id: string): string {
  return id.slice(0, 8).toUpperCase()
}
