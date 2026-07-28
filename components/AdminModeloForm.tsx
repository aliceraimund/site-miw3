'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { CategoriaEnum } from '@/types/imovel'

const inputClass = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  )
}

export default function AdminModeloForm() {
  const router = useRouter()
  const [codigo, setCodigo] = useState('')
  const [nome, setNome] = useState('')
  const [categoria, setCategoria] = useState<CategoriaEnum | ''>('residencial')
  const [descricao, setDescricao] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!codigo.trim() || !nome.trim()) {
      setError('Código e nome são obrigatórios.')
      return
    }
    setSaving(true)
    setError('')
    const supabase = createClient()

    const { data: modelo, error: mErr } = await supabase
      .from('modelo_contratos')
      .insert({ codigo: codigo.trim(), nome: nome.trim(), categoria: categoria || null, descricao: descricao.trim() || null })
      .select('id')
      .single()

    if (mErr || !modelo) {
      setError(mErr?.message ?? 'Erro ao criar o modelo.')
      setSaving(false)
      return
    }

    // Já cria a versão 1 (rascunho, corpo vazio) para começar a editar.
    const { data: versao } = await supabase
      .from('modelo_contrato_versoes')
      .insert({ modelo_id: modelo.id, versao: 1, corpo_blocos: { blocos: [] }, status: 'rascunho' })
      .select('id')
      .single()

    if (versao) router.push(`/admin/gestao/contratos/modelos/${modelo.id}/versoes/${versao.id}`)
    else router.push(`/admin/gestao/contratos/modelos/${modelo.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h2 className="font-semibold text-slate-900 text-base border-b border-slate-100 pb-3">Novo modelo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Código" required>
            <input value={codigo} onChange={(e) => setCodigo(e.target.value)} className={inputClass} placeholder="ex: RES-CAP" />
          </Field>
          <Field label="Categoria">
            <select value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaEnum)} className={inputClass}>
              <option value="residencial">Residencial</option>
              <option value="comercial">Comercial</option>
              <option value="industrial">Industrial</option>
            </select>
          </Field>
        </div>
        <Field label="Nome" required>
          <input value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} placeholder="ex: Locação residencial com título de capitalização" />
        </Field>
        <Field label="Descrição">
          <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={2} className={inputClass} />
        </Field>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Criando...' : 'Criar e editar versão 1'}
        </button>
        <button type="button" onClick={() => router.push('/admin/gestao/contratos/modelos')} className="px-5 py-2.5 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">
          Cancelar
        </button>
      </div>
    </form>
  )
}
