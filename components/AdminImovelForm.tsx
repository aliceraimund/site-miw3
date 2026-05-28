'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { Imovel, DisponibilidadeEnum, StatusEnum } from '@/types/imovel'

type FormData = Omit<Imovel, 'id' | 'criado_em'>

interface Props {
  imovel?: Imovel
}

const INITIAL: FormData = {
  nome: '',
  tipo: '',
  endereco_completo: '',
  bairro: '',
  cidade: '',
  disponivel_para: 'venda',
  preco_venda: null,
  preco_locacao: null,
  iptu: null,
  area_m2: 0,
  quartos: null,
  suites: null,
  banheiros: null,
  vagas: null,
  status: 'disponivel',
  fotos: null,
  descricao: null,
  destaque: false,
  valor_livre: false,
}

function Field({ label, children, required, hint }: { label: string; children: React.ReactNode; required?: boolean; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {!required && <span className="text-slate-400 text-xs ml-1">(opcional)</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  )
}

const inputClass = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

export default function AdminImovelForm({ imovel }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEditing = !!imovel

  const [form, setForm] = useState<FormData>(() => {
    if (!imovel) return INITIAL
    const { id, criado_em, ...rest } = imovel
    void id; void criado_em
    return rest
  })
  const [fotos, setFotos] = useState<string[]>(imovel?.fotos ?? [])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState<string>('')

  const set = (field: keyof FormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const numOrNull = (v: string) => (v === '' ? null : Number(v))

  const handleImageUpload = async (files: FileList) => {
    const supabase = createClient()
    const newUrls: string[] = []
    setUploading(true)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setUploadProgress(`Enviando ${i + 1}/${files.length}...`)

      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { data, error: uploadError } = await supabase.storage
        .from('imoveis')
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        setError(`Erro ao enviar ${file.name}: ${uploadError.message}`)
        continue
      }

      const { data: { publicUrl } } = supabase.storage.from('imoveis').getPublicUrl(data.path)
      newUrls.push(publicUrl)
    }

    setFotos((prev) => [...prev, ...newUrls])
    setUploading(false)
    setUploadProgress('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removePhoto = async (url: string) => {
    const supabase = createClient()
    const parts = url.split('/imoveis/')
    const path = parts[1]
    if (path) {
      await supabase.storage.from('imoveis').remove([path])
    }
    setFotos((prev) => prev.filter((f) => f !== url))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const supabase = createClient()
    const payload = { ...form, fotos: fotos.length > 0 ? fotos : null }

    let err
    if (isEditing) {
      const res = await supabase.from('imoveis').update(payload).eq('id', imovel.id)
      err = res.error
    } else {
      const res = await supabase.from('imoveis').insert(payload)
      err = res.error
    }

    if (err) {
      setError(err.message)
      setSaving(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  const dp = form.disponivel_para

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h2 className="font-semibold text-slate-900 text-base border-b border-slate-100 pb-3">Informações básicas</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Nome do imóvel" required>
            <input type="text" value={form.nome} onChange={(e) => set('nome', e.target.value)} required className={inputClass} placeholder="Ex: Galpão Industrial Vila Olímpia" />
          </Field>

          <Field label="Tipo" required hint="Ex: Galpão, Sala Comercial, Loja, Terreno">
            <input type="text" value={form.tipo} onChange={(e) => set('tipo', e.target.value)} required className={inputClass} placeholder="Galpão" />
          </Field>

          <Field label="Endereço completo" required>
            <input type="text" value={form.endereco_completo} onChange={(e) => set('endereco_completo', e.target.value)} required className={inputClass} placeholder="Rua das Flores, 123" />
          </Field>

          <Field label="Bairro" required>
            <input type="text" value={form.bairro} onChange={(e) => set('bairro', e.target.value)} required className={inputClass} placeholder="Vila Olímpia" />
          </Field>

          <Field label="Cidade" required>
            <input type="text" value={form.cidade} onChange={(e) => set('cidade', e.target.value)} required className={inputClass} placeholder="São Paulo" />
          </Field>

          <Field label="Área (m²)" required>
            <input type="number" min="0" step="0.01" value={form.area_m2 || ''} onChange={(e) => set('area_m2', Number(e.target.value))} required className={inputClass} placeholder="500" />
          </Field>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h2 className="font-semibold text-slate-900 text-base border-b border-slate-100 pb-3">Modalidade e preços</h2>

        <Field label="Disponível para" required>
          <select value={form.disponivel_para} onChange={(e) => set('disponivel_para', e.target.value as DisponibilidadeEnum)} className={inputClass}>
            <option value="venda">Venda</option>
            <option value="locacao">Locação</option>
            <option value="ambos">Venda e Locação</option>
          </select>
        </Field>

        {(dp === 'venda' || dp === 'ambos') && (
          <Field label="Preço de venda (R$)">
            <input type="number" min="0" step="0.01" value={form.preco_venda ?? ''} onChange={(e) => set('preco_venda', numOrNull(e.target.value))} className={inputClass} placeholder="1500000" />
          </Field>
        )}

        {(dp === 'locacao' || dp === 'ambos') && (
          <>
            <Field label="Preço de locação mensal (R$)">
              <input type="number" min="0" step="0.01" value={form.preco_locacao ?? ''} onChange={(e) => set('preco_locacao', numOrNull(e.target.value))} className={inputClass} placeholder="8000" />
            </Field>
            <Field label="Valor Livre?">
              <label className="flex items-center gap-3 mt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.valor_livre}
                  onChange={(e) => set('valor_livre', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">
                  Exibir no anúncio: <span className="italic text-slate-500">"Valor livre ao proprietário — comissão de administração a acrescer"</span>
                </span>
              </label>
            </Field>
            <Field label="IPTU mensal (R$)">
              <input type="number" min="0" step="0.01" value={form.iptu ?? ''} onChange={(e) => set('iptu', numOrNull(e.target.value))} className={inputClass} placeholder="1200" />
            </Field>
          </>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h2 className="font-semibold text-slate-900 text-base border-b border-slate-100 pb-3">Características</h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          <Field label="Quartos">
            <input type="number" min="0" value={form.quartos ?? ''} onChange={(e) => set('quartos', numOrNull(e.target.value))} className={inputClass} placeholder="—" />
          </Field>
          <Field label="Suítes">
            <input type="number" min="0" value={form.suites ?? ''} onChange={(e) => set('suites', numOrNull(e.target.value))} className={inputClass} placeholder="—" />
          </Field>
          <Field label="Banheiros">
            <input type="number" min="0" value={form.banheiros ?? ''} onChange={(e) => set('banheiros', numOrNull(e.target.value))} className={inputClass} placeholder="—" />
          </Field>
          <Field label="Vagas">
            <input type="number" min="0" value={form.vagas ?? ''} onChange={(e) => set('vagas', numOrNull(e.target.value))} className={inputClass} placeholder="—" />
          </Field>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h2 className="font-semibold text-slate-900 text-base border-b border-slate-100 pb-3">Status e destaque</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Status" required>
            <select value={form.status} onChange={(e) => set('status', e.target.value as StatusEnum)} className={inputClass}>
              <option value="disponivel">Disponível</option>
              <option value="em_reforma">Em reforma</option>
              <option value="reservado">Reservado</option>
            </select>
          </Field>

          <Field label="Imóvel em destaque?">
            <label className="flex items-center gap-3 mt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={form.destaque}
                onChange={(e) => set('destaque', e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Exibir como destaque na listagem</span>
            </label>
          </Field>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h2 className="font-semibold text-slate-900 text-base border-b border-slate-100 pb-3">Fotos</h2>

        <div
          className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <svg className="w-10 h-10 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-slate-600 font-medium">Clique para selecionar fotos</p>
          <p className="text-xs text-slate-400 mt-1">PNG, JPEG — múltiplos arquivos permitidos</p>
          {uploading && (
            <p className="text-xs text-blue-600 mt-2 font-medium">{uploadProgress}</p>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg,image/webp"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
        />

        {fotos.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {fotos.map((url, i) => (
              <div key={url} className="relative group aspect-square rounded-lg overflow-hidden bg-slate-100">
                <Image src={url} alt={`Foto ${i + 1}`} fill className="object-cover" sizes="120px" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removePhoto(url)}
                    className="opacity-0 group-hover:opacity-100 bg-red-600 text-white rounded-full p-1 transition-opacity"
                    title="Remover foto"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">principal</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 text-base border-b border-slate-100 pb-3 mb-5">Descrição</h2>
        <Field label="Descrição do imóvel">
          <textarea
            value={form.descricao ?? ''}
            onChange={(e) => set('descricao', e.target.value || null)}
            rows={5}
            className={inputClass}
            placeholder="Descreva características, diferenciais e informações adicionais do imóvel..."
          />
        </Field>
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
          disabled={saving || uploading}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Cadastrar imóvel'}
        </button>
      </div>
    </form>
  )
}
