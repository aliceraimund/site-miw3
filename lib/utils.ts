export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export function formatArea(value: number): string {
  return `${value.toLocaleString('pt-BR')} m²`
}

// Padroniza títulos em "Title Case": inicial maiúscula em cada palavra,
// mantendo conectores (de, do, da...) em minúsculo (exceto na primeira palavra).
const CONECTORES_TITULO = new Set(['de', 'do', 'da', 'dos', 'das', 'e', 'a', 'o', 'com', 'em', 'para'])

export function formatTitulo(texto: string): string {
  const tokens = texto.toLowerCase().split(/(\s+)/)
  let primeira = true
  return tokens
    .map((tok) => {
      if (tok.trim() === '') return tok
      const ehConector = CONECTORES_TITULO.has(tok)
      if (ehConector && !primeira) return tok
      primeira = false
      return tok.replace(/\p{L}/u, (c) => c.toUpperCase())
    })
    .join('')
}

export const STATUS_LABELS: Record<string, string> = {
  disponivel: 'Disponível',
  em_reforma: 'Em reforma',
  em_construcao: 'Em construção',
  reservado: 'Reservado',
}

export const STATUS_COLORS: Record<string, string> = {
  disponivel: 'bg-green-100 text-green-800',
  em_reforma: 'bg-yellow-100 text-yellow-800',
  em_construcao: 'bg-orange-100 text-orange-800',
  reservado: 'bg-red-100 text-red-800',
}

export const DISPONIVEL_LABELS: Record<string, string> = {
  venda: 'Venda',
  locacao: 'Locação',
  ambos: 'Venda e Locação',
}

export const DISPONIVEL_COLORS: Record<string, string> = {
  venda: 'bg-blue-100 text-blue-800',
  locacao: 'bg-purple-100 text-purple-800',
  ambos: 'bg-indigo-100 text-indigo-800',
}

export const TIPO_IMOVEL_VISTORIA_LABELS: Record<string, string> = {
  residencial: 'Residencial',
  comercial: 'Comercial / Industrial',
}

export const TIPO_VISTORIA_LABELS: Record<string, string> = {
  entrada: 'Entrada',
  saida: 'Saída',
}

export const STATUS_VISTORIA_LABELS: Record<string, string> = {
  rascunho: 'Rascunho',
  concluida: 'Concluída',
}

export const STATUS_VISTORIA_COLORS: Record<string, string> = {
  rascunho: 'bg-yellow-100 text-yellow-800',
  concluida: 'bg-green-100 text-green-800',
}

export const ESTADO_LABELS: Record<string, string> = {
  nova: 'Nova',
  boa: 'Boa',
  regular: 'Regular',
  danificada: 'Danificada',
  nz: 'N/Z',
}

export const ESTADO_COLORS: Record<string, string> = {
  nova: 'bg-emerald-100 text-emerald-800',
  boa: 'bg-green-100 text-green-800',
  regular: 'bg-amber-100 text-amber-800',
  danificada: 'bg-red-100 text-red-800',
  nz: 'bg-slate-100 text-slate-600',
}

export const ESTADO_BUTTON_COLORS: Record<string, string> = {
  nova: 'bg-emerald-600 border-emerald-600 text-white',
  boa: 'bg-green-600 border-green-600 text-white',
  regular: 'bg-amber-500 border-amber-500 text-white',
  danificada: 'bg-red-600 border-red-600 text-white',
  nz: 'bg-slate-500 border-slate-500 text-white',
}

export function formatDate(value: string): string {
  return new Date(value + (value.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('pt-BR')
}
