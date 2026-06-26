'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ImovelVistoria, TipoImovelVistoria } from '@/types/vistoria'

const inputClass = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

interface Props {
  imoveis: ImovelVistoria[]
  value: string
  onChange: (imovelId: string) => void
  onCreated: (imovel: ImovelVistoria) => void
}

export default function ImovelVistoriaSelect({ imoveis, value, onChange, onCreated }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [nome, setNome] = useState('')
  const [endereco, setEndereco] = useState('')
  const [tipo, setTipo] = useState<TipoImovelVistoria>('residencial')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const supabase = createClient()
    const { data, error: insertError } = await supabase
      .from('imoveis_vistoria')
      .insert({ nome, endereco, tipo })
      .select('*')
      .single()

    if (insertError || !data) {
      setError(insertError?.message ?? 'Erro ao cadastrar imóvel')
      setSaving(false)
      return
    }

    onCreated(data as ImovelVistoria)
    setSaving(false)
    setShowForm(false)
    setNome('')
    setEndereco('')
    setTipo('residencial')
  }

  if (showForm) {
    return (
      <div className="border border-slate-300 rounded-lg p-4 space-y-3 bg-slate-50">
        <p className="text-sm font-semibold text-slate-700">Novo imóvel para vistoria</p>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-xs">{error}</div>}
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome / identificação (ex: Apto Parco Toscana – Apto 22)"
          required
          className={inputClass}
        />
        <input
          type="text"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          placeholder="Endereço"
          required
          className={inputClass}
        />
        <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoImovelVistoria)} className={inputClass}>
          <option value="residencial">Residencial</option>
          <option value="comercial">Comercial / Industrial</option>
        </select>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCreate}
            disabled={saving || !nome || !endereco}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Adicionar e selecionar'}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-white transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <select value={value} onChange={(e) => onChange(e.target.value)} required className={inputClass}>
        <option value="">Selecione um imóvel...</option>
        {imoveis.map((imovel) => (
          <option key={imovel.id} value={imovel.id}>
            {imovel.nome} — {imovel.endereco}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="shrink-0 text-sm text-blue-600 border border-blue-200 rounded-lg px-3 py-2 hover:bg-blue-50 transition-colors whitespace-nowrap"
      >
        + Novo
      </button>
    </div>
  )
}
