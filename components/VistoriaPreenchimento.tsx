'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { comprimirImagem } from '@/lib/imagem'
import AmbientePanel from '@/components/vistoria/AmbientePanel'
import type { Vistoria, VistoriaItem, VistoriaFoto, VistoriaAmbiente, EstadoItem, Medidores, ChaveEntregue, StatusVistoria } from '@/types/vistoria'
import { ESTADO_LABELS, ESTADO_BUTTON_COLORS, TIPO_VISTORIA_LABELS, STATUS_VISTORIA_LABELS, STATUS_VISTORIA_COLORS } from '@/lib/utils'

const ESTADOS: EstadoItem[] = ['nova', 'boa', 'regular', 'danificada', 'nz']
const inputClass = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
const nowISO = () => new Date().toISOString()

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      {children}
    </div>
  )
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === 'idle') return null
  if (state === 'saving') {
    return (
      <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 shrink-0">
        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Salvando...
      </span>
    )
  }
  if (state === 'error') {
    return <span className="text-xs font-medium text-red-600 shrink-0">Erro ao salvar</span>
  }
  return (
    <span className="text-xs font-medium text-green-600 flex items-center gap-1 shrink-0">
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
      </svg>
      Salvo
    </span>
  )
}

function useDictation(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const supported = typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)

  const start = () => {
    if (!supported) return
    const Impl = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new Impl()
    recognition.lang = 'pt-BR'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript
      if (transcript) onResult(transcript)
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  const stop = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  return { supported, listening, start, stop }
}

function FotoThumb({ foto, onRemove }: { foto: VistoriaFoto; onRemove: () => void }) {
  const [url, setUrl] = useState<string | null>(null)

  if (url === null) {
    const supabase = createClient()
    supabase.storage.from('vistorias').createSignedUrl(foto.storage_path, 3600).then(({ data }) => {
      if (data) setUrl(data.signedUrl)
    })
  }

  return (
    <div className="relative shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full animate-pulse bg-slate-200" />
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
        title="Remover foto"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

interface ItemCardProps {
  item: VistoriaItem
  onSetEstado: (itemId: string, estado: EstadoItem) => void
  onObservacaoChange: (itemId: string, value: string) => void
  onAddFotos: (itemId: string, files: FileList) => void
  onRemoveFoto: (itemId: string, foto: VistoriaFoto) => void
}

function ItemCard({ item, onSetEstado, onObservacaoChange, onAddFotos, onRemoveFoto }: ItemCardProps) {
  const [observacao, setObservacao] = useState(item.observacao ?? '')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dictation = useDictation((text) => {
    setObservacao((prev) => {
      const next = prev ? `${prev} ${text}`.trim() : text
      onObservacaoChange(item.id, next)
      return next
    })
  })

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      <p className="font-medium text-slate-900 text-sm">{item.item}</p>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {ESTADOS.map((estado) => (
          <button
            key={estado}
            type="button"
            onClick={() => onSetEstado(item.id, estado)}
            className={`py-2.5 rounded-lg text-xs sm:text-sm font-semibold border-2 transition-colors ${
              item.estado === estado ? ESTADO_BUTTON_COLORS[estado] : 'border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            {ESTADO_LABELS[estado]}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(item.vistoria_fotos ?? []).map((foto) => (
          <FotoThumb key={foto.id} foto={foto} onRemove={() => onRemoveFoto(item.id, foto)} />
        ))}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-400 flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-[10px] mt-0.5">Foto</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) onAddFotos(item.id, e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      <div className="flex items-start gap-2">
        <textarea
          value={observacao}
          onChange={(e) => {
            setObservacao(e.target.value)
            onObservacaoChange(item.id, e.target.value)
          }}
          rows={2}
          placeholder="Observação (opcional)"
          className={`${inputClass} flex-1`}
        />
        {dictation.supported && (
          <button
            type="button"
            onClick={() => (dictation.listening ? dictation.stop() : dictation.start())}
            title="Ditar observação"
            className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              dictation.listening ? 'bg-red-600 text-white' : 'border border-slate-300 text-slate-500 hover:border-slate-400'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

function ChavesEditor({ chaves, onChange }: { chaves: ChaveEntregue[]; onChange: (next: ChaveEntregue[]) => void }) {
  const add = () => onChange([...chaves, { descricao: '', quantidade: 1 }])
  const update = (i: number, patch: Partial<ChaveEntregue>) => onChange(chaves.map((c, j) => (j === i ? { ...c, ...patch } : c)))
  const remove = (i: number) => onChange(chaves.filter((_, j) => j !== i))

  return (
    <div className="sm:col-span-3">
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-medium text-slate-500">Chaves entregues</label>
        <button type="button" onClick={add} className="text-xs text-blue-600 hover:underline">+ Adicionar</button>
      </div>
      <div className="space-y-2">
        {chaves.map((chave, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={chave.descricao}
              onChange={(e) => update(i, { descricao: e.target.value })}
              placeholder="Descrição (porta, portão, controle...)"
              className={inputClass}
            />
            <input
              type="number"
              min={1}
              value={chave.quantidade}
              onChange={(e) => update(i, { quantidade: Number(e.target.value) })}
              className="w-16 border border-slate-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button type="button" onClick={() => remove(i)} className="text-red-500 hover:text-red-700 shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function AddItemForm({ defaultSecao, onAdd }: { defaultSecao: string; onAdd: (secao: string, texto: string) => void }) {
  const [open, setOpen] = useState(false)
  const [secao, setSecao] = useState(defaultSecao)
  const [texto, setTexto] = useState('')

  if (!open) {
    return (
      <button type="button" onClick={() => { setSecao(defaultSecao); setOpen(true) }} className="text-sm text-blue-600 hover:underline">
        + Adicionar item (ex: eletrodoméstico, móvel ou item avulso)
      </button>
    )
  }

  const submit = () => {
    if (!texto.trim()) return
    onAdd(secao.trim() || defaultSecao, texto.trim())
    setTexto('')
    setOpen(false)
  }

  return (
    <div className="bg-white rounded-xl border border-dashed border-slate-300 p-4 space-y-2">
      <input type="text" value={secao} onChange={(e) => setSecao(e.target.value)} placeholder="Seção (ex: Itens mobiliados / eletrodomésticos)" className={inputClass} />
      <div className="flex items-center gap-2">
        <input type="text" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Item (ex: geladeira, fogão...)" className={inputClass} />
        <button type="button" onClick={submit} className="shrink-0 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
          Adicionar
        </button>
        <button type="button" onClick={() => setOpen(false)} className="shrink-0 text-slate-500 text-sm px-2">
          Cancelar
        </button>
      </div>
    </div>
  )
}

function HeaderFields({ vistoria, onSave }: { vistoria: Vistoria; onSave: (patch: Record<string, unknown>) => void }) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState(vistoria.data)
  const [vistoriador, setVistoriador] = useState(vistoria.vistoriador ?? '')
  const [locatario, setLocatario] = useState(vistoria.locatario ?? '')
  const [medidores, setMedidores] = useState<Medidores>(vistoria.medidores ?? {})
  const [chaves, setChaves] = useState<ChaveEntregue[]>(vistoria.chaves ?? [])
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleSave = (patch: Record<string, unknown>) => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => onSave(patch), 800)
  }

  return (
    <div className="border-t border-slate-100 pt-3 mt-3">
      <button type="button" onClick={() => setOpen((o) => !o)} className="text-sm text-blue-600 hover:underline">
        {open ? 'Ocultar detalhes da vistoria' : 'Editar detalhes da vistoria'}
      </button>
      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
          <Field label="Data">
            <input
              type="date"
              value={data}
              onChange={(e) => { setData(e.target.value); scheduleSave({ data: e.target.value }) }}
              className={inputClass}
            />
          </Field>
          <Field label="Vistoriador (preparado por)">
            <input
              type="text"
              value={vistoriador}
              onChange={(e) => { setVistoriador(e.target.value); scheduleSave({ vistoriador: e.target.value || null }) }}
              className={inputClass}
            />
          </Field>
          <Field label="Locatário / inquilino">
            <input
              type="text"
              value={locatario}
              onChange={(e) => { setLocatario(e.target.value); scheduleSave({ locatario: e.target.value || null }) }}
              className={inputClass}
            />
          </Field>
          <Field label="Água (leitura)">
            <input
              type="text"
              value={medidores.agua ?? ''}
              onChange={(e) => { const next = { ...medidores, agua: e.target.value }; setMedidores(next); scheduleSave({ medidores: next }) }}
              className={inputClass}
            />
          </Field>
          <Field label="Energia (leitura)">
            <input
              type="text"
              value={medidores.energia ?? ''}
              onChange={(e) => { const next = { ...medidores, energia: e.target.value }; setMedidores(next); scheduleSave({ medidores: next }) }}
              className={inputClass}
            />
          </Field>
          <Field label="Gás (leitura)">
            <input
              type="text"
              value={medidores.gas ?? ''}
              onChange={(e) => { const next = { ...medidores, gas: e.target.value }; setMedidores(next); scheduleSave({ medidores: next }) }}
              className={inputClass}
            />
          </Field>
          <ChavesEditor chaves={chaves} onChange={(next) => { setChaves(next); scheduleSave({ chaves: next }) }} />
        </div>
      )}
    </div>
  )
}

interface Props {
  vistoria: Vistoria
  itensIniciais: VistoriaItem[]
  ambientesIniciais?: VistoriaAmbiente[]
}

export default function VistoriaPreenchimento({ vistoria, itensIniciais, ambientesIniciais = [] }: Props) {
  const [itens, setItens] = useState(itensIniciais)
  const [ambientes, setAmbientes] = useState(ambientesIniciais)
  const [status, setStatus] = useState<StatusVistoria>(vistoria.status)
  const [activeSecao, setActiveSecao] = useState<string>(itensIniciais[0]?.secao ?? '')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [showPendentes, setShowPendentes] = useState(false)
  const observacaoTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  // Vistorias novas navegam pela ordem dos ambientes; as antigas, pela seção.
  const secoes = ambientes.length > 0
    ? ambientes.map((a) => a.nome)
    : Array.from(new Set(itens.map((i) => i.secao)))
  const ambienteAtivo = ambientes.find((a) => a.nome === activeSecao) ?? null
  const itensAtivos = itens.filter((i) => i.secao === activeSecao)
  const totalPreenchidos = itens.filter((i) => i.estado).length
  const pendentes = itens.filter((i) => !i.estado)

  const handleSetEstado = async (itemId: string, estado: EstadoItem) => {
    setItens((prev) => prev.map((i) => (i.id === itemId ? { ...i, estado } : i)))
    setSaveState('saving')
    const supabase = createClient()
    const { error } = await supabase.from('vistoria_itens').update({ estado, atualizado_em: nowISO() }).eq('id', itemId)
    setSaveState(error ? 'error' : 'saved')
  }

  const handleObservacaoChange = (itemId: string, value: string) => {
    setItens((prev) => prev.map((i) => (i.id === itemId ? { ...i, observacao: value } : i)))
    setSaveState('saving')
    if (observacaoTimers.current[itemId]) clearTimeout(observacaoTimers.current[itemId])
    observacaoTimers.current[itemId] = setTimeout(async () => {
      const supabase = createClient()
      const { error } = await supabase.from('vistoria_itens').update({ observacao: value, atualizado_em: nowISO() }).eq('id', itemId)
      setSaveState(error ? 'error' : 'saved')
    }, 800)
  }

  const handleAddFotos = async (itemId: string, files: FileList) => {
    const supabase = createClient()
    setSaveState('saving')
    let hadError = false
    for (let i = 0; i < files.length; i++) {
      // Comprime no navegador: reduz ~85% do peso sem recortar a foto.
      const file = await comprimirImagem(files[i])
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const path = `${itemId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage.from('vistorias').upload(path, file, { cacheControl: '3600', upsert: false })
      if (uploadError) { hadError = true; continue }

      const { data: foto, error: insertError } = await supabase
        .from('vistoria_fotos')
        .insert({ vistoria_item_id: itemId, storage_path: path })
        .select('*')
        .single()

      if (insertError || !foto) { hadError = true; continue }
      setItens((prev) => prev.map((it) => (it.id === itemId ? { ...it, vistoria_fotos: [...(it.vistoria_fotos ?? []), foto] } : it)))
    }
    setSaveState(hadError ? 'error' : 'saved')
  }

  const handleRemoveFoto = async (itemId: string, foto: VistoriaFoto) => {
    const supabase = createClient()
    setSaveState('saving')
    await supabase.storage.from('vistorias').remove([foto.storage_path])
    const { error } = await supabase.from('vistoria_fotos').delete().eq('id', foto.id)
    setItens((prev) => prev.map((it) => (it.id === itemId ? { ...it, vistoria_fotos: (it.vistoria_fotos ?? []).filter((f) => f.id !== foto.id) } : it)))
    setSaveState(error ? 'error' : 'saved')
  }

  const handleAddItem = async (secao: string, texto: string) => {
    setSaveState('saving')
    const supabase = createClient()
    const maxOrdem = itens.reduce((max, i) => Math.max(max, i.ordem), 0)
    const { data: novo, error } = await supabase
      .from('vistoria_itens')
      .insert({ vistoria_id: vistoria.id, secao, item: texto, ordem: maxOrdem + 1 })
      .select('*')
      .single()
    if (!error && novo) {
      setItens((prev) => [...prev, { ...novo, vistoria_fotos: [] }])
      setActiveSecao(secao)
    }
    setSaveState(error ? 'error' : 'saved')
  }

  const handleHeaderSave = async (patch: Record<string, unknown>) => {
    setSaveState('saving')
    const supabase = createClient()
    const { error } = await supabase.from('vistorias').update({ ...patch, atualizado_em: nowISO() }).eq('id', vistoria.id)
    setSaveState(error ? 'error' : 'saved')
  }

  const doSetStatus = async (newStatus: StatusVistoria) => {
    setSaveState('saving')
    const supabase = createClient()
    const { error } = await supabase.from('vistorias').update({ status: newStatus, atualizado_em: nowISO() }).eq('id', vistoria.id)
    if (!error) setStatus(newStatus)
    setSaveState(error ? 'error' : 'saved')
  }

  const handleConcluir = () => {
    if (pendentes.length > 0) { setShowPendentes(true); return }
    doSetStatus('concluida')
  }

  const handleProximaSecao = () => {
    if (secoes.length === 0) return
    const idx = secoes.indexOf(activeSecao)
    const next = secoes[(idx + 1) % secoes.length]
    setActiveSecao(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-4 pb-28">
      <div className="flex items-center gap-3">
        <Link href="/admin/vistorias" className="text-slate-500 hover:text-slate-700 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-slate-900 truncate">{vistoria.imovel?.nome ?? 'Vistoria'}</h1>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_VISTORIA_COLORS[status]}`}>{STATUS_VISTORIA_LABELS[status]}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">{TIPO_VISTORIA_LABELS[vistoria.tipo_vistoria]}</span>
            </div>
            <p className="text-sm text-slate-500">{vistoria.imovel?.endereco}</p>
          </div>
          <SaveIndicator state={saveState} />
        </div>

        <HeaderFields vistoria={{ ...vistoria, data: vistoria.data }} onSave={handleHeaderSave} />
      </div>

      <div className="sticky top-0 z-10 -mx-4 px-4 py-2 bg-slate-100/95 backdrop-blur sm:-mx-0 sm:px-0">
        <div className="flex gap-2 overflow-x-auto">
          {secoes.map((secao) => {
            const secaoItens = itens.filter((i) => i.secao === secao)
            const preenchidos = secaoItens.filter((i) => i.estado).length
            const completo = preenchidos === secaoItens.length
            return (
              <button
                key={secao}
                type="button"
                onClick={() => { setActiveSecao(secao); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  activeSecao === secao
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : completo
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
                }`}
              >
                {secao} ({preenchidos}/{secaoItens.length})
              </button>
            )
          })}
        </div>
      </div>

      {ambienteAtivo && (
        <div className="mb-3">
          <AmbientePanel
            key={ambienteAtivo.id}
            ambiente={ambienteAtivo}
            onRenomear={(id, nome) => {
              setAmbientes((prev) => prev.map((a) => (a.id === id ? { ...a, nome } : a)))
              setItens((prev) => prev.map((i) => (i.ambiente_id === id ? { ...i, secao: nome } : i)))
              setActiveSecao(nome)
            }}
            onRemover={async (id) => {
              const supabase = createClient()
              await supabase.from('vistoria_ambientes').delete().eq('id', id)
              const restantes = ambientes.filter((a) => a.id !== id)
              setAmbientes(restantes)
              setItens((prev) => prev.filter((i) => i.ambiente_id !== id))
              setActiveSecao(restantes[0]?.nome ?? '')
            }}
          />
        </div>
      )}

      <div className="space-y-3">
        {itensAtivos.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onSetEstado={handleSetEstado}
            onObservacaoChange={handleObservacaoChange}
            onAddFotos={handleAddFotos}
            onRemoveFoto={handleRemoveFoto}
          />
        ))}
        <AddItemForm defaultSecao={activeSecao} onAdd={handleAddItem} />
      </div>

      {showPendentes && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={() => setShowPendentes(false)}>
          <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-semibold text-slate-900 text-base mb-2">Itens sem estado preenchido</h2>
            <p className="text-sm text-slate-500 mb-4">
              {pendentes.length} {pendentes.length === 1 ? 'item ainda não foi avaliado' : 'itens ainda não foram avaliados'}.
            </p>
            <ul className="space-y-1.5 mb-5 text-sm max-h-60 overflow-y-auto">
              {pendentes.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => { setActiveSecao(p.secao); setShowPendentes(false) }}
                    className="text-blue-600 hover:underline text-left"
                  >
                    {p.secao} — {p.item}
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowPendentes(false)}
                className="text-sm text-slate-600 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Revisar pendências
              </button>
              <button
                type="button"
                onClick={() => { setShowPendentes(false); doSetStatus('concluida') }}
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Concluir mesmo assim
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between gap-3 sm:px-6 z-20">
        <div className="text-sm text-slate-600 font-medium">{totalPreenchidos} de {itens.length} itens</div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/vistorias/${vistoria.id}/laudo`}
            target="_blank"
            className="hidden sm:inline-block text-sm border border-slate-300 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Laudo PDF
          </Link>
          <button
            type="button"
            onClick={handleProximaSecao}
            className="text-sm border border-slate-300 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Próxima seção
          </button>
          {status === 'concluida' ? (
            <button
              type="button"
              onClick={() => doSetStatus('rascunho')}
              className="text-sm bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Reabrir
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConcluir}
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Concluir
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
