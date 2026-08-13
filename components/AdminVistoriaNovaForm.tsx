'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { type ImovelVistoria, type TipoVistoria, type ChaveEntregue, type VistoriaAmbienteTemplate, categoriaParaTipoVistoria } from '@/types/vistoria'

// Ambiente escolhido para esta vistoria. `templateId` guarda de onde vêm os
// itens; o nome é editável (ex.: "Dormitório 2" → "Quarto da frente").
interface AmbienteEscolhido {
  key: string
  templateId: string
  nome: string
}

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

export default function AdminVistoriaNovaForm({ imoveis }: Props) {
  const router = useRouter()
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

  // Ambientes (cômodos) desta vistoria
  const [templates, setTemplates] = useState<VistoriaAmbienteTemplate[]>([])
  const [ambientes, setAmbientes] = useState<AmbienteEscolhido[]>([])
  const [carregandoAmb, setCarregandoAmb] = useState(false)
  const contador = useRef(0)
  const novaKey = () => `a${contador.current++}`

  // Ao escolher o imóvel, carrega os ambientes padrão do tipo correspondente.
  const carregarAmbientes = async (idImovel: string) => {
    const imovel = imoveis.find((i) => i.id === idImovel)
    if (!imovel) return
    setCarregandoAmb(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('vistoria_ambiente_templates')
      .select('*')
      .eq('tipo_imovel', categoriaParaTipoVistoria(imovel.categoria))
      .eq('ativo', true)
      .order('ordem')
    const lista = (data as VistoriaAmbienteTemplate[]) ?? []
    setTemplates(lista)
    setAmbientes(lista.filter((t) => t.padrao).map((t) => ({ key: novaKey(), templateId: t.id, nome: t.nome })))
    setCarregandoAmb(false)
  }

  const renomear = (key: string, nome: string) => setAmbientes((prev) => prev.map((a) => (a.key === key ? { ...a, nome } : a)))
  const remover = (key: string) => setAmbientes((prev) => prev.filter((a) => a.key !== key))
  const duplicar = (templateId: string, nome: string) =>
    setAmbientes((prev) => [...prev, { key: novaKey(), templateId, nome }])

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
    if (ambientes.length === 0) {
      setError('Selecione ao menos um ambiente para vistoriar.')
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

    // Cria os ambientes escolhidos, na ordem em que aparecem na tela.
    const { data: ambientesCriados, error: ambError } = await supabase
      .from('vistoria_ambientes')
      .insert(ambientes.map((a, idx) => ({ vistoria_id: vistoria.id, nome: a.nome.trim() || 'Ambiente', ordem: idx })))
      .select('*')

    if (ambError || !ambientesCriados) {
      setError(ambError?.message ?? 'Erro ao criar os ambientes')
      setSaving(false)
      return
    }

    // Itens de cada ambiente, copiados do template de origem.
    const { data: templatesItens, error: templatesError } = await supabase
      .from('vistoria_checklist_templates')
      .select('*')
      .in('ambiente_template_id', [...new Set(ambientes.map((a) => a.templateId))])
      .eq('ativo', true)
      .order('ordem')

    if (templatesError) {
      setError(templatesError.message)
      setSaving(false)
      return
    }

    const itens = ambientes.flatMap((a, idx) => {
      const criado = ambientesCriados[idx] as { id: string; nome: string }
      return (templatesItens ?? [])
        .filter((t) => t.ambiente_template_id === a.templateId)
        .map((t) => ({
          vistoria_id: vistoria.id,
          ambiente_id: criado.id,
          template_item_id: t.id,
          secao: criado.nome, // nome do ambiente no momento da criação
          item: t.item,
          ordem: t.ordem,
        }))
    })

    if (itens.length > 0) {
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
          <select value={imovelId} onChange={(e) => { setImovelId(e.target.value); carregarAmbientes(e.target.value) }} className={inputClass}>
            <option value="">Selecione...</option>
            {imoveis.map((i) => (
              <option key={i.id} value={i.id}>{i.nome} — {i.endereco}</option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">
            O imóvel vem do cadastro. Para adicionar um novo, use a aba{' '}
            <a href="/admin/gestao" className="text-blue-600 hover:underline">Gestão</a>.
          </p>
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

      {/* Ambientes a vistoriar */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="font-semibold text-slate-900 text-base">Ambientes a vistoriar</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            A vistoria é feita cômodo a cômodo. Ajuste a lista conforme o imóvel — dá para renomear, remover e adicionar.
          </p>
        </div>

        {!imovelId ? (
          <p className="text-sm text-slate-400">Selecione o imóvel para carregar os ambientes.</p>
        ) : carregandoAmb ? (
          <p className="text-sm text-slate-400">Carregando ambientes...</p>
        ) : (
          <>
            {ambientes.length === 0 ? (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
                Nenhum ambiente selecionado — escolha ao menos um abaixo.
              </p>
            ) : (
              <ol className="space-y-2">
                {ambientes.map((a, idx) => (
                  <li key={a.key} className="flex items-center gap-2">
                    <span className="w-6 h-6 shrink-0 rounded-full bg-slate-100 text-slate-500 text-xs flex items-center justify-center">{idx + 1}</span>
                    <input
                      value={a.nome}
                      onChange={(e) => renomear(a.key, e.target.value)}
                      className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="button" onClick={() => duplicar(a.templateId, `${a.nome} (2)`)} title="Duplicar este ambiente" className="text-slate-400 hover:text-blue-600 px-2 text-sm">
                      ⧉
                    </button>
                    <button type="button" onClick={() => remover(a.key)} title="Remover" className="text-slate-400 hover:text-red-600 px-2">
                      ✕
                    </button>
                  </li>
                ))}
              </ol>
            )}

            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Adicionar ambiente</p>
              <div className="flex flex-wrap gap-1.5">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => duplicar(t.id, t.nome)}
                    className="text-xs border border-slate-200 text-slate-600 rounded-lg px-2.5 py-1 hover:bg-slate-50 hover:border-slate-300"
                  >
                    + {t.nome}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
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
