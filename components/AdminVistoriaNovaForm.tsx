'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ImovelVistoriaSelect from '@/components/ImovelVistoriaSelect'
import type { ImovelVistoria, TipoVistoria, ChaveEntregue } from '@/types/vistoria'

const inputClass = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {!required && <span className="text-slate-400 text-xs ml-1">(opcional)</span>}
      </label>
      {children}
    </div>
  )
}

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface Props {
  imoveis: ImovelVistoria[]
}

export default function AdminVistoriaNovaForm({ imoveis: initialImoveis }: Props) {
  const router = useRouter()
  const [imoveis, setImoveis] = useState(initialImoveis)
  const [imovelId, setImovelId] = useState('')
  const [tipoVistoria, setTipoVistoria] = useState<TipoVistoria>('entrada')
  const [data, setData] = useState(todayISO())
  const [vistoriador, setVistoriador] = useState('')
  const [locatario, setLocatario] = useState('')
  const [agua, setAgua] = useState('')
  const [energia, setEnergia] = useState('')
  const [gas, setGas] = useState('')
  const [chaves, setChaves] = useState<ChaveEntregue[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const addChave = () => setChaves((prev) => [...prev, { descricao: '', quantidade: 1 }])
  const updateChave = (i: number, patch: Partial<ChaveEntregue>) =>
    setChaves((prev) => prev.map((c, j) => (j === i ? { ...c, ...patch } : c)))
  const removeChave = (i: number) => setChaves((prev) => prev.filter((_, j) => j !== i))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imovelId) {
      setError('Selecione um imóvel.')
      return
    }
    setSaving(true)
    setError('')

    const supabase = createClient()
    const imovel = imoveis.find((i) => i.id === imovelId)
    if (!imovel) {
      setError('Imóvel inválido.')
      setSaving(false)
      return
    }

    const { data: vistoria, error: vistoriaError } = await supabase
      .from('vistorias')
      .insert({
        imovel_id: imovelId,
        tipo_vistoria: tipoVistoria,
        data,
        vistoriador: vistoriador || null,
        locatario: locatario || null,
        medidores: { agua, energia, gas },
        chaves: chaves.filter((c) => c.descricao.trim() !== ''),
      })
      .select('*')
      .single()

    if (vistoriaError || !vistoria) {
      setError(vistoriaError?.message ?? 'Erro ao criar vistoria')
      setSaving(false)
      return
    }

    const { data: templates, error: templatesError } = await supabase
      .from('vistoria_checklist_templates')
      .select('*')
      .eq('tipo_imovel', imovel.tipo)
      .eq('ativo', true)
      .order('ordem')

    if (templatesError) {
      setError(templatesError.message)
      setSaving(false)
      return
    }

    if (templates && templates.length > 0) {
      const itens = templates.map((t) => ({
        vistoria_id: vistoria.id,
        template_item_id: t.id,
        secao: t.secao,
        item: t.item,
        ordem: t.ordem,
      }))
      const { error: itensError } = await supabase.from('vistoria_itens').insert(itens)
      if (itensError) {
        setError(itensError.message)
        setSaving(false)
        return
      }
    }

    router.push(`/admin/vistorias/${vistoria.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h2 className="font-semibold text-slate-900 text-base border-b border-slate-100 pb-3">Imóvel e tipo</h2>

        <Field label="Imóvel" required>
          <ImovelVistoriaSelect
            imoveis={imoveis}
            value={imovelId}
            onChange={setImovelId}
            onCreated={(novo) => {
              setImoveis((prev) => [...prev, novo])
              setImovelId(novo.id)
            }}
          />
        </Field>

        <Field label="Tipo de vistoria" required>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setTipoVistoria('entrada')}
              className={`flex-1 py-3 rounded-lg text-sm font-semibold border-2 transition-colors ${
                tipoVistoria === 'entrada' ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              Entrada
            </button>
            <button
              type="button"
              onClick={() => setTipoVistoria('saida')}
              className={`flex-1 py-3 rounded-lg text-sm font-semibold border-2 transition-colors ${
                tipoVistoria === 'saida' ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              Saída
            </button>
          </div>
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Data" required>
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} required className={inputClass} />
          </Field>
          <Field label="Vistoriador (preparado por)">
            <input type="text" value={vistoriador} onChange={(e) => setVistoriador(e.target.value)} className={inputClass} placeholder="Nome do vistoriador" />
          </Field>
          <Field label="Locatário / inquilino (ou empresa)">
            <input type="text" value={locatario} onChange={(e) => setLocatario(e.target.value)} className={inputClass} placeholder="Nome do locatário" />
          </Field>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h2 className="font-semibold text-slate-900 text-base border-b border-slate-100 pb-3">Leitura dos medidores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Field label="Água">
            <input type="text" value={agua} onChange={(e) => setAgua(e.target.value)} className={inputClass} placeholder="Leitura hidrômetro" />
          </Field>
          <Field label="Energia">
            <input type="text" value={energia} onChange={(e) => setEnergia(e.target.value)} className={inputClass} placeholder="Leitura relógio" />
          </Field>
          <Field label="Gás">
            <input type="text" value={gas} onChange={(e) => setGas(e.target.value)} className={inputClass} placeholder="Leitura medidor" />
          </Field>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-semibold text-slate-900 text-base">Chaves entregues</h2>
          <button type="button" onClick={addChave} className="text-sm text-blue-600 hover:underline">
            + Adicionar
          </button>
        </div>
        {chaves.length === 0 && <p className="text-sm text-slate-400">Nenhuma chave adicionada ainda.</p>}
        {chaves.map((chave, i) => (
          <div key={i} className="flex items-center gap-3">
            <input
              type="text"
              value={chave.descricao}
              onChange={(e) => updateChave(i, { descricao: e.target.value })}
              placeholder="Ex: porta de entrada, portão, controle"
              className={inputClass}
            />
            <input
              type="number"
              min={1}
              value={chave.quantidade}
              onChange={(e) => updateChave(i, { quantidade: Number(e.target.value) })}
              className="w-20 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button type="button" onClick={() => removeChave(i)} className="text-red-500 hover:text-red-700 shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Criando...' : 'Criar vistoria e começar a preencher'}
        </button>
      </div>
    </form>
  )
}
