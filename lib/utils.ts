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
