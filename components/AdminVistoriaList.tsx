'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Vistoria } from '@/types/vistoria'
import { TIPO_VISTORIA_LABELS, STATUS_VISTORIA_LABELS, STATUS_VISTORIA_COLORS, formatDate } from '@/lib/utils'

interface Props {
  vistorias: Vistoria[]
}

export default function AdminVistoriaList({ vistorias: initialVistorias }: Props) {
  const router = useRouter()
  const [vistorias, setVistorias] = useState(initialVistorias)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const supabase = createClient()
    const { error } = await supabase.from('vistorias').delete().eq('id', id)
    if (!error) {
      setVistorias((prev) => prev.filter((v) => v.id !== id))
    }
    setDeletingId(null)
    setConfirmId(null)
    router.refresh()
  }

  if (vistorias.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <p className="text-slate-500">Nenhuma vistoria encontrada.</p>
        <Link href="/admin/vistorias/nova" className="mt-4 inline-block text-blue-600 hover:underline text-sm">
          Criar primeira vistoria
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {vistorias.map((vistoria) => (
        <div key={vistoria.id} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_VISTORIA_COLORS[vistoria.status]}`}>
                {STATUS_VISTORIA_LABELS[vistoria.status]}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {TIPO_VISTORIA_LABELS[vistoria.tipo_vistoria]}
              </span>
              <span className="text-xs text-slate-500">{formatDate(vistoria.data)}</span>
            </div>
            <p className="font-semibold text-slate-900 truncate">{vistoria.imovel?.nome ?? 'Imóvel removido'}</p>
            <p className="text-sm text-slate-500 truncate">{vistoria.imovel?.endereco}</p>
            {(vistoria.vistoriador || vistoria.locatario) && (
              <div className="flex gap-3 mt-1 text-xs text-slate-500">
                {vistoria.vistoriador && <span>Vistoriador: {vistoria.vistoriador}</span>}
                {vistoria.locatario && <span>Locatário: {vistoria.locatario}</span>}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/admin/vistorias/${vistoria.id}/laudo`}
              target="_blank"
              className="text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors"
            >
              Laudo PDF
            </Link>
            <Link
              href={`/admin/vistorias/${vistoria.id}`}
              className="text-xs text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
            >
              {vistoria.status === 'concluida' ? 'Ver' : 'Preencher'}
            </Link>
            {confirmId === vistoria.id ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDelete(vistoria.id)}
                  disabled={deletingId === vistoria.id}
                  className="text-xs text-white bg-red-600 hover:bg-red-700 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                >
                  {deletingId === vistoria.id ? 'Excluindo...' : 'Confirmar'}
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
                onClick={() => setConfirmId(vistoria.id)}
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
