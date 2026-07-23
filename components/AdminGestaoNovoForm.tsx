'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { CategoriaEnum, DisponibilidadeEnum } from '@/types/imovel'

const inputClass = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

const TIPOS_SUGERIDOS = ['Casa', 'Apartamento', 'Barracão', 'Galpão', 'Kitnet', 'Sala Comercial', 'Chácara', 'Terreno', 'Cobertura']

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

export default function AdminGestaoNovoForm() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('')
  const [categoria, setCategoria] = useState<CategoriaEnum>('residencial')
  const [finalidade, setFinalidade] = useState<DisponibilidadeEnum>('locacao')
  const [endereco, setEndereco] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim() || !tipo.trim() || !endereco.trim() || !bairro.trim() || !cidade.trim()) {
      setError('Preencha os campos obrigatórios.')
      return
    }
    setSaving(true)
    setError('')
    const supabase = createClient()

    const { data, error: insertError } = await supabase
      .from('imoveis')
      .insert({
        nome: nome.trim(),
        tipo: tipo.trim(),
        categoria,
        disponivel_para: finalidade,
        endereco_completo: endereco.trim(),
        bairro: bairro.trim(),
        cidade: cidade.trim(),
        area_m2: 0,
        status: 'disponivel',
        publicado: false, // não vai para o site
        gerido: true, // entra direto na gestão
      })
      .select('id')
      .single()

    if (insertError || !data) {
      setError(insertError?.message ?? 'Erro ao cadastrar o imóvel.')
      setSaving(false)
      return
    }

    await supabase.from('imovel_gestao').upsert({ imovel_id: data.id }, { onConflict: 'imovel_id' })
    router.push(`/admin/gestao/${data.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h2 className="font-semibold text-slate-900 text-base border-b border-slate-100 pb-3">Identificação do imóvel</h2>

        <Field label="Nome / identificação" required>
          <input value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} placeholder="Ex: Apartamento Rua X, 100 - Apto 42" />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Tipo" required>
            <input list="tipos-sugeridos" value={tipo} onChange={(e) => setTipo(e.target.value)} className={inputClass} placeholder="Casa, Apartamento, Galpão..." />
            <datalist id="tipos-sugeridos">
              {TIPOS_SUGERIDOS.map((t) => <option key={t} value={t} />)}
            </datalist>
          </Field>
          <Field label="Categoria">
            <select value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaEnum)} className={inputClass}>
              <option value="residencial">Residencial</option>
              <option value="comercial">Comercial</option>
              <option value="industrial">Industrial</option>
            </select>
          </Field>
        </div>

        <Field label="Finalidade">
          <select value={finalidade} onChange={(e) => setFinalidade(e.target.value as DisponibilidadeEnum)} className={inputClass}>
            <option value="locacao">Locação</option>
            <option value="venda">Venda</option>
            <option value="ambos">Venda e Locação</option>
          </select>
        </Field>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h2 className="font-semibold text-slate-900 text-base border-b border-slate-100 pb-3">Endereço</h2>

        <Field label="Endereço completo" required>
          <input value={endereco} onChange={(e) => setEndereco(e.target.value)} className={inputClass} placeholder="Rua, número, complemento" />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Bairro" required>
            <input value={bairro} onChange={(e) => setBairro(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Cidade" required>
            <input value={cidade} onChange={(e) => setCidade(e.target.value)} className={inputClass} />
          </Field>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
          {saving ? 'Cadastrando...' : 'Cadastrar e abrir ficha'}
        </button>
        <button type="button" onClick={() => router.push('/admin/gestao')} className="px-5 py-2.5 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
          Cancelar
        </button>
      </div>

      <p className="text-xs text-slate-400">
        O imóvel entra direto na gestão e <strong>não aparece no site</strong>. Se quiser anunciá-lo depois, é só editar o anúncio e marcar &ldquo;Publicar no site&rdquo;.
      </p>
    </form>
  )
}
