// Helpers de merge para o corpo do contrato. pt-BR, sem dependências externas.

const UNIDADES = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez',
  'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove']
const DEZENAS = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa']
const CENTENAS = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos']

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

// Converte um trio (0..999) em texto.
function trioExtenso(n: number): string {
  if (n === 0) return ''
  if (n === 100) return 'cem'
  const c = Math.floor(n / 100)
  const resto = n % 100
  const partes: string[] = []
  if (c > 0) partes.push(CENTENAS[c])
  if (resto > 0) {
    if (resto < 20) partes.push(UNIDADES[resto])
    else {
      const d = Math.floor(resto / 10)
      const u = resto % 10
      partes.push(u > 0 ? `${DEZENAS[d]} e ${UNIDADES[u]}` : DEZENAS[d])
    }
  }
  return partes.join(' e ')
}

// Número inteiro por extenso (até bilhões).
export function extenso(valor: number): string {
  const n = Math.floor(Math.abs(valor))
  if (n === 0) return 'zero'

  const escalas: { sing: string; plur: string }[] = [
    { sing: '', plur: '' },
    { sing: 'mil', plur: 'mil' },
    { sing: 'milhão', plur: 'milhões' },
    { sing: 'bilhão', plur: 'bilhões' },
  ]

  const trios: number[] = []
  let resto = n
  while (resto > 0) {
    trios.push(resto % 1000)
    resto = Math.floor(resto / 1000)
  }

  const partes: string[] = []
  for (let i = trios.length - 1; i >= 0; i--) {
    const t = trios[i]
    if (t === 0) continue
    let texto = trioExtenso(t)
    if (i === 1 && t === 1) texto = '' // "mil", não "um mil"
    const escala = escalas[i]
    const nomeEscala = i === 0 ? '' : t === 1 ? escala.sing : escala.plur
    partes.push([texto, nomeEscala].filter(Boolean).join(' '))
  }

  // Liga o último grupo com "e" quando apropriado (ex.: "mil e quinhentos").
  if (partes.length > 1) {
    const ultimo = trios[0]
    if (ultimo > 0 && ultimo < 100) {
      return partes.slice(0, -1).join(', ') + ' e ' + partes[partes.length - 1]
    }
  }
  return partes.join(', ')
}

// Valor monetário por extenso: "mil quinhentos reais e cinquenta centavos".
export function extensoMoeda(valor: number): string {
  const reais = Math.floor(Math.abs(valor))
  const centavos = Math.round((Math.abs(valor) - reais) * 100)
  const partes: string[] = []
  partes.push(`${extenso(reais)} ${reais === 1 ? 'real' : 'reais'}`)
  if (centavos > 0) partes.push(`${extenso(centavos)} ${centavos === 1 ? 'centavo' : 'centavos'}`)
  return partes.join(' e ')
}

export function moeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })
}

// Data ISO 'YYYY-MM-DD' → "24 de julho de 2026" (sem timezone).
export function dataExtenso(iso: string): string {
  const [ano, mes, dia] = iso.split('-').map(Number)
  if (!ano || !mes || !dia) return iso
  return `${dia} de ${MESES[mes - 1]} de ${ano}`
}

// Concordância singular/plural conforme quantidade.
export function plural(qtd: number, singular: string, pluralForma?: string): string {
  return qtd === 1 ? singular : (pluralForma ?? `${singular}s`)
}

// Verbo conforme quantidade (formas explícitas).
export function verbo(qtd: number, singular: string, pluralForma: string): string {
  return qtd === 1 ? singular : pluralForma
}

// "A", "A e B", "A, B e C".
export function listaPessoas(nomes: string[]): string {
  const limpos = nomes.filter(Boolean)
  if (limpos.length === 0) return ''
  if (limpos.length === 1) return limpos[0]
  return `${limpos.slice(0, -1).join(', ')} e ${limpos[limpos.length - 1]}`
}

interface PartesEndereco {
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  uf?: string
  cep?: string
}

export function enderecoCompleto(e: PartesEndereco): string {
  const linha1 = [e.logradouro, e.numero].filter(Boolean).join(', ')
  const partes = [linha1, e.complemento, e.bairro, [e.cidade, e.uf].filter(Boolean).join('/'), e.cep ? `CEP ${e.cep}` : '']
  return partes.filter(Boolean).join(' - ')
}
