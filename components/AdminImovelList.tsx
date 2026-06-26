'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Imovel } from '@/types/imovel'
import { STATUS_LABELS, STATUS_COLORS, DISPONIVEL_LABELS, formatArea, formatCurrency } from '@/lib/utils'

interface Props {
  imoveis: Imovel[]
}

export default function AdminImovelList({ imoveis: initialImoveis }: Props) {
  const router = useRouter()
  const [imoveis, setImoveis] = useState(initialImoveis)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)

  const togglePublicado = async (id: string, current: boolean) => {
    setTogglingId(id)
    const supabase = createClient()
    const { error } = await supabase.from('imoveis').update({ publicado: !current }).eq('id', id)
    if (!error) {
      setImoveis((prev) => prev.map((i) => i.id === id ? { ...i, publicado: !current } : i))
    }
    setTogglingId(null)
  }

  const handleDuplicate = async (id: string) => {
    setDuplicatingId(id)
    const supabase = createClient()

    const imovel = imoveis.find((i) => i.id === id)
    if (!imovel) {
      setDuplicatingId(null)
      return
    }

    const { id: originalId, criado_em, ...rest } = imovel
    void originalId; void criado_em

    const { data, error } = await supabase
      .from('imoveis')
      .insert({ ...rest, nome: `${imovel.nome} (cópia)`, publicado: false })
      .select('*')
      .single()

    setDuplicatingId(null)
    if (!error && data) {
      router.push(`/admin/imoveis/${data.id}/editar`)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const supabase = createClient()

    const imovel = imoveis.find((i) => i.id === id)
    if (imovel?.fotos?.length) {
      const paths = imovel.fotos.map((url) => {
        const parts = url.split('/imoveis/')
        return parts[1] ?? ''
      }).filter(Boolean)
      if (paths.length) {
        await supabase.storage.from('imoveis').remove(paths)
      }
    }

    const { error } = await supabase.from('imoveis').delete().eq('id', id)
    if (!error) {
      setImoveis((prev) => prev.filter((i) => i.id !== id))
    }
    setDeletingId(null)
    setConfirmId(null)
    router.refresh()
  }

  if (imoveis.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <p className="text-slate-500">Nenhum imóvel cadastrado.</p>
        <Link href="/admin/imoveis/novo" className="mt-4 inline-block text-blue-600 hover:underline text-sm">
          Adicionar primeiro imóvel
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {imoveis.map((imovel) => (
        <div key={imovel.id} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[imovel.status]}`}>
                {STATUS_LABELS[imovel.status]}
              </span>
              <span className="text-xs text-slate-500">{DISPONIVEL_LABELS[imovel.disponivel_para]}</span>
              {imovel.destaque && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Destaque</span>
              )}
              {!imovel.publicado && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Não publicado</span>
              )}
            </div>
            <p className="font-semibold text-slate-900 truncate">{imovel.nome}</p>
            <p className="text-sm text-slate-500 truncate">{imovel.tipo} · {imovel.endereco_completo}</p>
            <div className="flex gap-3 mt-1 text-xs text-slate-500">
              <span>{formatArea(imovel.area_m2)}</span>
              {imovel.preco_venda && <span>Venda: {formatCurrency(imovel.preco_venda)}</span>}
              {imovel.preco_locacao && <span>Locação: {formatCurrency(imovel.preco_locacao)}/mês</span>}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => togglePublicado(imovel.id, imovel.publicado)}
              disabled={togglingId === imovel.id}
              title={imovel.publicado ? 'Clique para ocultar do site' : 'Clique para publicar no site'}
              className={`flex items-center gap-1.5 text-xs font-medium border rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50 ${
                imovel.publicado
                  ? 'text-green-700 border-green-200 bg-green-50 hover:bg-green-100'
                  : 'text-slate-500 border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              {imovel.publicado ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
              {togglingId === imovel.id ? '...' : imovel.publicado ? 'Publicado' : 'Oculto'}
            </button>
            <Link
              href={`/imovel/${imovel.id}`}
              target="_blank"
              className="text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors"
            >
              Ver
            </Link>
            <Link
              href={`/admin/imoveis/${imovel.id}/editar`}
              className="text-xs text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
            >
              Editar
            </Link>
            <button
              onClick={() => handleDuplicate(imovel.id)}
              disabled={duplicatingId === imovel.id}
              className="text-xs text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              {duplicatingId === imovel.id ? 'Duplicando...' : 'Duplicar'}
            </button>
            {confirmId === imovel.id ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDelete(imovel.id)}
                  disabled={deletingId === imovel.id}
                  className="text-xs text-white bg-red-600 hover:bg-red-700 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                >
                  {deletingId === imovel.id ? 'Excluindo...' : 'Confirmar'}
                </button>
                <button
                  onClick={() => setConfirmId(null)}
                  className="text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmId(imovel.id)}
                className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors"
              >
                Excluir
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
