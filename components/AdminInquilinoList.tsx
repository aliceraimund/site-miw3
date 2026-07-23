'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { type Inquilino, TIPO_PESSOA_LABELS } from '@/types/inquilino'

interface Props {
  inquilinos: Inquilino[]
}

export default function AdminInquilinoList({ inquilinos: initial }: Props) {
  const router = useRouter()
  const [inquilinos, setInquilinos] = useState(initial)
  const [busca, setBusca] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return inquilinos
    return inquilinos.filter(
      (i) =>
        i.nome.toLowerCase().includes(termo) ||
        (i.cpf_cnpj ?? '').toLowerCase().includes(termo) ||
        (i.email ?? '').toLowerCase().includes(termo)
    )
  }, [inquilinos, busca])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const supabase = createClient()
    const { error } = await supabase.from('inquilinos').delete().eq('id', id)
    if (!error) {
      setInquilinos((prev) => prev.filter((i) => i.id !== id))
    }
    setDeletingId(null)
    setConfirmId(null)
    router.refresh()
  }

  if (inquilinos.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <p className="text-slate-500">Nenhum inquilino cadastrado.</p>
        <Link href="/admin/gestao/inquilinos/novo" className="mt-4 inline-block text-blue-600 hover:underline text-sm">
          Cadastrar primeiro inquilino
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <input
        type="search"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por nome, CPF/CNPJ ou e-mail..."
        className="w-full sm:w-80 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {filtrados.map((inq) => (
        <div key={inq.id} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {TIPO_PESSOA_LABELS[inq.tipo_pessoa]}
              </span>
              {inq.cpf_cnpj && <span className="text-xs text-slate-500">{inq.cpf_cnpj}</span>}
            </div>
            <p className="font-semibold text-slate-900 truncate">{inq.nome}</p>
            <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500">
              {inq.telefones && <span>{inq.telefones}</span>}
              {inq.email && <span>{inq.email}</span>}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/admin/gestao/inquilinos/${inq.id}`}
              className="text-xs text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors font-medium"
            >
              Abrir
            </Link>
            {confirmId === inq.id ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDelete(inq.id)}
                  disabled={deletingId === inq.id}
                  className="text-xs text-white bg-red-600 hover:bg-red-700 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                >
                  {deletingId === inq.id ? 'Excluindo...' : 'Confirmar'}
                </button>
                <button onClick={() => setConfirmId(null)} className="text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors">
                  Cancelar
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmId(inq.id)} className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors">
                Excluir
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
