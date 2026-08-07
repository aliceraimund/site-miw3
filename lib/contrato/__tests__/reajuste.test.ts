import { describe, it, expect } from 'vitest'
import {
  calcularReajuste,
  janelaCompetencias,
  validarTransicao,
  planejarAplicacao,
  diaAnterior,
  vigenciaInicialDe,
  type SerieIndice,
  type ParametrosReajuste,
} from '../reajuste'

// Série auxiliar: preenche N meses terminando em `fim` com uma variação fixa.
function serie(fim: string, meses: number, variacoes: number[] | number): SerieIndice {
  const s: SerieIndice = {}
  const [ano, mes] = fim.split('-').map(Number)
  for (let i = 0; i < meses; i++) {
    const idx = ano * 12 + (mes - 1) - i
    const chave = `${Math.floor(idx / 12)}-${String((idx % 12) + 1).padStart(2, '0')}`
    s[chave] = Array.isArray(variacoes) ? variacoes[meses - 1 - i] : variacoes
  }
  return s
}

const BASE: ParametrosReajuste = {
  valorBase: 1000,
  dataBase: '2026-03-01',
  periodicidadeMeses: 12,
  defasagemMeses: 2,
  travaDeflacao: true,
}

describe('motor de reajuste', () => {
  it('1. acumula por produtório, não por soma', () => {
    const variacoes = [0.5, 0.3, -0.2, 1.1, 0.4, 0.2, 0.6, 0.1, 0.3, 0.5, 0.2, 0.4]
    const s = serie('2026-01', 12, variacoes)
    const r = calcularReajuste({ ...BASE, percentualMinimo: null }, s)

    // Produtório manual
    const esperado = (variacoes.reduce((f, v) => f * (1 + v / 100), 1) - 1) * 100
    const soma = variacoes.reduce((a, b) => a + b, 0)

    expect(r.status).toBe('projetado')
    expect(r.percentualAcumulado).toBeCloseTo(esperado, 6)
    expect(r.percentualAcumulado).not.toBeCloseTo(soma, 6) // produtório ≠ soma
  })

  it('2. mês faltante na janela → pendente_indice, não calcula', () => {
    const s = serie('2026-01', 12, 0.5)
    delete s['2025-07'] // buraco no meio da janela
    const r = calcularReajuste(BASE, s)

    expect(r.status).toBe('pendente_indice')
    expect(r.mesesFaltantes).toContain('2025-07')
    expect(r.percentualAplicado).toBe(0)
    expect(r.valorNovo).toBe(1000) // valor base intacto
  })

  it('3. acumulado negativo com trava → parcial 0', () => {
    const s = serie('2026-01', 12, -0.5)
    const r = calcularReajuste({ ...BASE, travaDeflacao: true }, s)

    expect(r.percentualAcumulado!).toBeLessThan(0)
    expect(r.percentualAplicado).toBe(0)
    expect(r.valorNovo).toBe(1000)
    expect(r.memoriaCalculo.trava_deflacao_aplicada).toBe(true)
  })

  it('4. piso: acumulado 3,2% com mínimo 5 → aplica 5%', () => {
    // 12 meses que somam ~3,2% no produtório
    const v = Math.pow(1.032, 1 / 12) - 1
    const s = serie('2026-01', 12, v * 100)
    const r = calcularReajuste({ ...BASE, percentualMinimo: 5 }, s)

    expect(r.percentualAcumulado).toBeCloseTo(3.2, 4)
    expect(r.percentualAplicado).toBe(5)
    expect(r.valorNovo).toBe(1050)
  })

  it('5. piso vence a deflação: acumulado −1,5%, trava on, mínimo 5 → 5%', () => {
    const v = Math.pow(0.985, 1 / 12) - 1
    const s = serie('2026-01', 12, v * 100)
    const r = calcularReajuste({ ...BASE, travaDeflacao: true, percentualMinimo: 5 }, s)

    expect(r.percentualAcumulado!).toBeLessThan(0)
    expect(r.percentualAplicado).toBe(5)
    expect(r.valorNovo).toBe(1050)
  })

  it('6. teto: acumulado 12% com máximo 8 → aplica 8%', () => {
    const v = Math.pow(1.12, 1 / 12) - 1
    const s = serie('2026-01', 12, v * 100)
    const r = calcularReajuste({ ...BASE, percentualMaximo: 8 }, s)

    expect(r.percentualAcumulado).toBeCloseTo(12, 4)
    expect(r.percentualAplicado).toBe(8)
    expect(r.valorNovo).toBe(1080)
  })

  it('7. índice de mora não interfere no reajuste', () => {
    // O motor só recebe a série do índice de reajuste; mora é outro parâmetro
    // do contrato e não entra em nenhum cálculo aqui.
    const s = serie('2026-01', 12, 0.5)
    const r = calcularReajuste(BASE, s)
    const esperado = (Math.pow(1.005, 12) - 1) * 100

    expect(r.percentualAcumulado).toBeCloseTo(esperado, 6)
    // Nada na memória de cálculo referencia mora
    expect(JSON.stringify(r.memoriaCalculo)).not.toMatch(/mora/i)
  })

  it('8. tipo fixo ignora a série de índices', () => {
    const s = serie('2026-01', 12, 99) // série absurda, deve ser ignorada
    const r = calcularReajuste({ ...BASE, percentualFixo: 7 }, s)

    expect(r.percentualAplicado).toBe(7)
    expect(r.percentualAcumulado).toBeNull()
    expect(r.valorNovo).toBe(1070)
    expect(r.memoriaCalculo.meses).toHaveLength(0)
  })

  it('9. aplicar fecha a vigência anterior (fim = efeito − 1 dia) e abre nova', () => {
    const plano = planejarAplicacao(
      { id: 'rj-1', data_efeito: '2026-03-01', valor_novo: 1050 },
      [{ id: 'vg-1', inicio: '2025-03-01', fim: null, reajuste_id: null }]
    )

    expect(plano.ok).toBe(true)
    expect(plano.fecharVigenciaId).toBe('vg-1')
    expect(plano.fecharVigenciaEm).toBe('2026-02-28')
    expect(plano.novaVigencia).toMatchObject({ inicio: '2026-03-01', valor_aluguel: 1050, origem: 'reajuste', reajuste_id: 'rj-1' })
    expect(plano.atualizarCacheValor).toBe(1050)
  })

  it('10. aplicar o mesmo reajuste 2× aborta (idempotência)', () => {
    const vigencias = [
      { id: 'vg-1', inicio: '2025-03-01', fim: '2026-02-28', reajuste_id: null },
      { id: 'vg-2', inicio: '2026-03-01', fim: null, reajuste_id: 'rj-1' },
    ]
    const plano = planejarAplicacao({ id: 'rj-1', data_efeito: '2026-03-01', valor_novo: 1050 }, vigencias)

    expect(plano.ok).toBe(false)
    expect(plano.motivo).toMatch(/já foi aplicado/i)
    expect(plano.novaVigencia).toBeUndefined()
  })

  it('11. periodicidade 24 usa janela de 24 meses', () => {
    const janela = janelaCompetencias('2026-03-01', 24, 2)
    expect(janela).toHaveLength(24)
    expect(janela[janela.length - 1]).toBe('2026-01') // termina em base − defasagem
    expect(janela[0]).toBe('2024-02')

    const s = serie('2026-01', 24, 0.5)
    const r = calcularReajuste({ ...BASE, periodicidadeMeses: 24 }, s)
    expect(r.status).toBe('projetado')
    expect(r.memoriaCalculo.meses).toHaveLength(24)
  })

  it('12. arredondamento exato: 1000 × 1,0475 = 1047,50', () => {
    const r = calcularReajuste({ ...BASE, valorBase: 1000, percentualFixo: 4.75 }, {})
    expect(r.valorNovo).toBe(1047.5)
  })

  it('13. dispensar sem observação é erro de validação', () => {
    const semObs = validarTransicao('projetado', 'dispensado', '')
    expect(semObs.ok).toBe(false)
    expect(semObs.erro).toMatch(/observação/i)

    const comObs = validarTransicao('projetado', 'dispensado', 'Acordo com o inquilino')
    expect(comObs.ok).toBe(true)

    // nenhum reajuste vira "aplicado" sozinho
    expect(validarTransicao('projetado', 'aplicado').ok).toBe(false)
    expect(validarTransicao('confirmado', 'aplicado').ok).toBe(true)
  })

  it('14. backfill: contrato existente vira exatamente 1 vigência inicial com o valor da coluna', () => {
    const v = vigenciaInicialDe({ id: 'ct-1', data_inicio: '2025-03-01', valor_aluguel: 3500 })
    expect(v).toEqual({ contrato_id: 'ct-1', inicio: '2025-03-01', valor_aluguel: 3500, origem: 'inicial' })

    // contrato sem valor não gera vigência (não inventa zero)
    expect(vigenciaInicialDe({ id: 'ct-2', data_inicio: '2025-03-01', valor_aluguel: null })).toBeNull()
  })
})

describe('utilitários', () => {
  it('janela termina em base − defasagem', () => {
    expect(janelaCompetencias('2026-03-15', 12, 2)).toEqual([
      '2025-02', '2025-03', '2025-04', '2025-05', '2025-06', '2025-07',
      '2025-08', '2025-09', '2025-10', '2025-11', '2025-12', '2026-01',
    ])
  })

  it('diaAnterior atravessa mês e ano', () => {
    expect(diaAnterior('2026-03-01')).toBe('2026-02-28')
    expect(diaAnterior('2024-03-01')).toBe('2024-02-29') // bissexto
    expect(diaAnterior('2026-01-01')).toBe('2025-12-31')
  })
})
