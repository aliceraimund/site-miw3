'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Vistoria, VistoriaItem, VistoriaFoto, EstadoItem } from '@/types/vistoria'
import { ESTADO_LABELS, ESTADO_COLORS, TIPO_VISTORIA_LABELS, formatDate } from '@/lib/utils'

const RANK: Record<string, number> = { bom: 0, regular: 1, avaria: 2 }

function chave(item: VistoriaItem) {
  return `${item.secao}__${item.item}__${item.ordem}`
}

function temMudanca(a: VistoriaItem | undefined, b: VistoriaItem | undefined) {
  if (!a || !b) return true
  if (a.estado !== b.estado) return true
  if ((a.observacao ?? '') !== (b.observacao ?? '')) return true
  if ((a.vistoria_fotos?.length ?? 0) !== (b.vistoria_fotos?.length ?? 0)) return true
  return false
}

function ehPiora(a: VistoriaItem | undefined, b: VistoriaItem | undefined) {
  if (!a || !b || !a.estado || !b.estado) return false
  if (!(a.estado in RANK) || !(b.estado in RANK)) return false
  return RANK[b.estado] > RANK[a.estado]
}

function FotoView({ foto }: { foto: VistoriaFoto }) {
  const [url, setUrl] = useState<string | null>(null)
  if (url === null) {
    const supabase = createClient()
    supabase.storage.from('vistorias').createSignedUrl(foto.storage_path, 3600).then(({ data }) => {
      if (data) setUrl(data.signedUrl)
    })
  }
  return (
    <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full animate-pulse bg-slate-200" />
      )}
    </div>
  )
}

function ColunaItem({ item }: { item?: VistoriaItem }) {
  if (!item) {
    return <p className="text-sm text-slate-400 italic">Item não registrado nesta vistoria</p>
  }
  return (
    <div className="space-y-2">
      {item.estado ? (
        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${ESTADO_COLORS[item.estado as EstadoItem]}`}>
          {ESTADO_LABELS[item.estado]}
        </span>
      ) : (
        <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">Sem estado</span>
      )}
      {item.observacao && <p className="text-sm text-slate-600">{item.observacao}</p>}
      {(item.vistoria_fotos?.length ?? 0) > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto">
          {item.vistoria_fotos!.map((foto) => <FotoView key={foto.id} foto={foto} />)}
        </div>
      )}
    </div>
  )
}

interface Props {
  vistoriaEntrada: Vistoria
  vistoriaSaida: Vistoria
  itensEntrada: VistoriaItem[]
  itensSaida: VistoriaItem[]
}

export default function ComparadorResultado({ vistoriaEntrada, vistoriaSaida, itensEntrada, itensSaida }: Props) {
  const [apenasDivergencias, setApenasDivergencias] = useState(false)

  const mapaEntrada = new Map(itensEntrada.map((i) => [chave(i), i]))
  const mapaSaida = new Map(itensSaida.map((i) => [chave(i), i]))
  const chaves = Array.from(new Set([...itensEntrada.map(chave), ...itensSaida.map(chave)]))

  const linhas = chaves.map((k) => {
    const a = mapaEntrada.get(k)
    const b = mapaSaida.get(k)
    return { k, a, b, mudou: temMudanca(a, b), piora: ehPiora(a, b) }
  })

  const divergencias = linhas.filter((l) => l.mudou)
  const visiveis = apenasDivergencias ? divergencias : linhas

  const secoes = Array.from(new Set(visiveis.map((l) => (l.a ?? l.b)!.secao)))

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-slate-400">{TIPO_VISTORIA_LABELS.entrada.toUpperCase()}</p>
            <p className="text-sm text-slate-700">{formatDate(vistoriaEntrada.data)} {vistoriaEntrada.vistoriador && `· ${vistoriaEntrada.vistoriador}`}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">{TIPO_VISTORIA_LABELS.saida.toUpperCase()}</p>
            <p className="text-sm text-slate-700">{formatDate(vistoriaSaida.data)} {vistoriaSaida.vistoriador && `· ${vistoriaSaida.vistoriador}`}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${divergencias.length > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {divergencias.length} {divergencias.length === 1 ? 'divergência' : 'divergências'}
          </span>
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" checked={apenasDivergencias} onChange={(e) => setApenasDivergencias(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            Mostrar apenas divergências
          </label>
        </div>
      </div>

      {secoes.map((secao) => (
        <div key={secao} className="space-y-3">
          <h2 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">{secao}</h2>
          {visiveis.filter((l) => (l.a ?? l.b)!.secao === secao).map((linha) => (
            <div
              key={linha.k}
              className={`rounded-xl border overflow-hidden ${linha.piora ? 'border-red-300' : linha.mudou ? 'border-amber-300' : 'border-slate-200'}`}
            >
              <div className={`px-4 py-2 flex items-center justify-between gap-2 ${linha.piora ? 'bg-red-50' : linha.mudou ? 'bg-amber-50' : 'bg-slate-50'}`}>
                <p className="font-medium text-sm text-slate-800">{(linha.a ?? linha.b)!.item}</p>
                {linha.piora ? (
                  <span className="text-xs font-semibold text-red-700 shrink-0">Piora</span>
                ) : linha.mudou ? (
                  <span className="text-xs font-semibold text-amber-700 shrink-0">Mudança</span>
                ) : (
                  <span className="text-xs text-slate-400 shrink-0">sem mudança</span>
                )}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                <div className="p-4">
                  <p className="text-xs font-semibold text-slate-400 mb-2">ENTRADA</p>
                  <ColunaItem item={linha.a} />
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold text-slate-400 mb-2">SAÍDA</p>
                  <ColunaItem item={linha.b} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {visiveis.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          Nenhuma divergência encontrada entre as duas vistorias.
        </div>
      )}
    </div>
  )
}
