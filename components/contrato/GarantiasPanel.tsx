'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { type Contrato, type TipoGarantia, TIPO_GARANTIA_LABELS } from '@/types/contrato'

const inputClass = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

// Campos específicos por modalidade de garantia (gravados em garantia_detalhes).
const CAMPOS: Record<TipoGarantia, { chave: string; label: string }[]> = {
  titulo_capitalizacao: [
    { chave: 'seguradora', label: 'Seguradora' },
    { chave: 'valorNominal', label: 'Valor nominal (R$)' },
    { chave: 'numeroFicha', label: 'Nº da ficha' },
    { chave: 'modalidade', label: 'Modalidade' },
  ],
  fiador: [
    { chave: 'nome', label: 'Nome do fiador' },
    { chave: 'cpfCnpj', label: 'CPF/CNPJ' },
    { chave: 'observacao', label: 'Observação' },
  ],
  caucao: [
    { chave: 'valor', label: 'Valor da caução (R$)' },
    { chave: 'meses', label: 'Equivalente a (meses de aluguel)' },
    { chave: 'onde', label: 'Onde está depositada' },
  ],
  seguro_fianca: [
    { chave: 'seguradora', label: 'Seguradora' },
    { chave: 'apolice', label: 'Nº da apólice' },
    { chave: 'vigencia', label: 'Vigência' },
  ],
  nenhuma: [],
}

export default function GarantiasPanel({ contrato }: { contrato: Contrato }) {
  const router = useRouter()
  const [tipo, setTipo] = useState<TipoGarantia>(contrato.tipo_garantia ?? 'nenhuma')
  const [detalhes, setDetalhes] = useState<Record<string, string>>(
    Object.fromEntries(Object.entries((contrato.garantia_detalhes ?? {}) as Record<string, unknown>).map(([k, v]) => [k, String(v ?? '')]))
  )
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [erro, setErro] = useState('')

  const salvar = async () => {
    setSalvando(true); setSalvo(false); setErro('')
    const supabase = createClient()
    const { error } = await supabase
      .from('contratos')
      .update({
        tipo_garantia: tipo,
        garantia_detalhes: tipo === 'nenhuma' ? null : detalhes,
        atualizado_em: new Date().toISOString(),
      })
      .eq('id', contrato.id)
    setSalvando(false)
    if (error) { setErro(error.message); return }
    setSalvo(true)
    router.refresh()
  }

  const campos = CAMPOS[tipo] ?? []

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-semibold text-slate-900 text-base">Garantias</h2>
        <p className="text-xs text-slate-400 mt-0.5">A modalidade escolhida define qual cláusula de garantia entra no documento.</p>
      </div>

      <label className="block text-xs text-slate-500 max-w-sm">
        Modalidade
        <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoGarantia)} className={inputClass}>
          {(Object.keys(TIPO_GARANTIA_LABELS) as TipoGarantia[]).map((t) => <option key={t} value={t}>{TIPO_GARANTIA_LABELS[t]}</option>)}
        </select>
      </label>

      {campos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {campos.map((c) => (
            <label key={c.chave} className="block text-xs text-slate-500">
              {c.label}
              <input
                value={detalhes[c.chave] ?? ''}
                onChange={(e) => setDetalhes((prev) => ({ ...prev, [c.chave]: e.target.value }))}
                className={inputClass}
              />
            </label>
          ))}
        </div>
      )}

      {erro && <p className="text-sm text-red-600">{erro}</p>}
      <div className="flex items-center gap-3">
        <button onClick={salvar} disabled={salvando} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
        {salvo && <span className="text-sm text-green-600 font-medium">Salvo ✓</span>}
      </div>
    </div>
  )
}
