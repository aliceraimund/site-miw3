import { describe, it, expect } from 'vitest'
import { formatTitulo } from '../utils'
describe('formatTitulo', () => {
  it('normaliza cidades em caixa alta', () => {
    expect(formatTitulo('SÃO CAETANO DO SUL')).toBe('São Caetano do Sul')
    expect(formatTitulo('BARRA DO UNA')).toBe('Barra do Una')
  })
  it('preserva a sigla do estado depois de vírgula ou traço', () => {
    expect(formatTitulo('Diadema, SP')).toBe('Diadema, SP')
    expect(formatTitulo('PERUÍBE, SP')).toBe('Peruíbe, SP')
    expect(formatTitulo('Salão Comercial | Cerâmica - São Caetano do Sul - SP')).toBe('Salão Comercial | Cerâmica - São Caetano do Sul - SP')
  })
  it('não transforma palavras comuns em sigla', () => {
    // "se" só viraria "SE" depois de vírgula/traço; solto, é palavra normal
    expect(formatTitulo('venha se encantar')).toBe('Venha Se Encantar')
    expect(formatTitulo('apartamento com vista para o mar')).toBe('Apartamento com Vista para o Mar')
  })
})
