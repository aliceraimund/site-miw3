'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import RetryImage from '@/components/RetryImage'
import type { Imovel, DisponibilidadeEnum, StatusEnum, CategoriaEnum } from '@/types/imovel'

type FormData = Omit<Imovel, 'id' | 'criado_em'>

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface Props {
  imovel?: Imovel
}

const INITIAL: FormData = {
  nome: '',
  tipo: '',
  categoria: 'comercial',
  endereco_completo: '',
  bairro: '',
  cidade: '',
  disponivel_para: 'venda',
  preco_venda: null,
  preco_locacao: null,
  iptu: null,
  condominio: null,
  area_m2: 0,
  quartos: null,
  suites: null,
  banheiros: null,
  vagas: null,
  status: 'disponivel',
  fotos: null,
  descricao: null,
  destaque: false,
  publicado: true,
  valor_livre: false,
  valor_livre_venda: false,
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
  const [removedPaths, setRemovedPaths] = useState<string[]>([])
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
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

      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setError(`"${file.name}" está em um formato não suportado pelo site (${file.type || 'desconhecido'}). Fotos tiradas em iPhone às vezes salvam em HEIC — abra a foto, use "Compartilhar" e exporte/salve como JPEG antes de enviar aqui.`)
        continue
      }

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

  const removePhoto = (url: string) => {
    const path = url.split('/imoveis/')[1]
    if (path) {
      setRemovedPaths((prev) => [...prev, path])
    }
    setFotos((prev) => prev.filter((f) => f !== url))
  }

  const reorderPhoto = (from: number, to: number) => {
    setFotos((prev) => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
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

    if (removedPaths.length > 0) {
      await supabase.storage.from('imoveis').remove(removedPaths)
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

          <Field label="Categoria" required>
            <select value={form.categoria} onChange={(e) => set('categoria', e.target.value as CategoriaEnum)} className={inputClass}>
              <option value="residencial">Residencial</option>
              <option value="comercial">Comercial</option>
              <option value="industrial">Industrial</option>
            </select>
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
          <>
            <Field label="Preço de venda (R$)">
              <input type="number" min="0" step="0.01" value={form.preco_venda ?? ''} onChange={(e) => set('preco_venda', numOrNull(e.target.value))} className={inputClass} placeholder="1500000" />
            </Field>
            <Field label="Valor Livre? (Venda)">
              <label className="flex items-center gap-3 mt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.valor_livre_venda}
                  onChange={(e) => set('valor_livre_venda', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">
                  Exibir no anúncio: <span className="italic text-slate-500">"Valor livre ao proprietário — comissão de administração a acrescer"</span>
                </span>
              </label>
            </Field>
          </>
        )}

        {(dp === 'locacao' || dp === 'ambos') && (
          <>
            <Field label="Preço de locação mensal (R$)">
              <input type="number" min="0" step="0.01" value={form.preco_locacao ?? ''} onChange={(e) => set('preco_locacao', numOrNull(e.target.value))} className={inputClass} placeholder="8000" />
            </Field>
            <Field label="Valor Livre? (Locação)">
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

        <Field label="Condomínio mensal (R$)">
          <input type="number" min="0" step="0.01" value={form.condominio ?? ''} onChange={(e) => set('condominio', numOrNull(e.target.value))} className={inputClass} placeholder="800" />
        </Field>
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
              <option value="em_construcao">Em construção</option>
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

          <Field label="Visibilidade">
            <label className="flex items-center gap-3 mt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={form.publicado}
                onChange={(e) => set('publicado', e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">
                Publicar no site — desmarque para salvar sem exibir publicamente
              </span>
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
          <p className="text-xs text-slate-400 mt-1">PNG, JPEG ou WebP — múltiplos arquivos permitidos. Fotos em HEIC (iPhone) não são suportadas.</p>
          {uploading && (
            <p className="text-xs text-blue-600 mt-2 font-medium">{uploadProgress}</p>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
        />

        {fotos.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {fotos.map((url, i) => (
              <div
                key={url}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => {
                  e.preventDefault()
                  if (overIndex !== i) setOverIndex(i)
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  if (dragIndex !== null && dragIndex !== i) reorderPhoto(dragIndex, i)
                  setDragIndex(null)
                  setOverIndex(null)
                }}
                onDragEnd={() => {
                  setDragIndex(null)
                  setOverIndex(null)
                }}
                className={`relative group aspect-square rounded-lg overflow-hidden bg-slate-100 cursor-grab active:cursor-grabbing transition-opacity ${
                  dragIndex === i ? 'opacity-40' : ''
                } ${overIndex === i && dragIndex !== null && dragIndex !== i ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
              >
                <RetryImage
                  src={url}
                  alt={`Foto ${i + 1}`}
                  fill
                  unoptimized
                  draggable={false}
                  className="object-cover"
                  sizes="120px"
                  fallback={
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-2 text-center text-slate-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                      <span className="text-[10px] leading-tight">Imagem indisponível — remova e reenvie</span>
                    </div>
                  }
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                {i === 0 ? (
                  <span className="absolute bottom-1 left-1 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Principal
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setFotos((prev) => [prev[i], ...prev.filter((_, j) => j !== i)])}
                    className="absolute bottom-1 left-1 sm:opacity-0 sm:group-hover:opacity-100 bg-black/60 hover:bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded transition-all flex items-center gap-1"
                    title="Tornar principal"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Principal
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="absolute top-1 right-1 sm:opacity-0 sm:group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 transition-opacity"
                  title="Remover foto"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {fotos.length > 1 && (
                  <div className="sm:hidden absolute bottom-1 right-1 flex gap-0.5">
                    {i > 0 && (
                      <button
                        type="button"
                        onClick={() => reorderPhoto(i, i - 1)}
                        className="bg-black/60 text-white rounded p-1"
                        title="Mover para esquerda"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}
                    {i < fotos.length - 1 && (
                      <button
                        type="button"
                        onClick={() => reorderPhoto(i, i + 1)}
                        className="bg-black/60 text-white rounded p-1"
                        title="Mover para direita"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>
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
