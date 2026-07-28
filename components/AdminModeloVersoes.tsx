'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ModeloContratoVersao } from '@/types/modelo-contrato'
import { MODELO_VERSAO_STATUS_LABELS } from '@/types/modelo-contrato'
import { formatDate } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  rascunho: 'bg-slate-100 text-slate-600',
  publicada: 'bg-green-100 text-green-800',
  arquivada: 'bg-amber-100 text-amber-800',
}

export default function AdminModeloVersoes({ modeloId, versoes }: { modeloId: string; versoes: ModeloContratoVersao[] }) {
  const router = useRouter()
  const [criando, setCriando] = useState(false)

  const novaVersao = async () => {
    setCriando(true)
    const supabase = createClient()
    const maxVersao = versoes.reduce((m, v) => Math.max(m, v.versao), 0)
    // Clona o corpo da última versão como ponto de partida.
    const ultima = [...versoes].sort((a, b) => b.versao - a.versao)[0]
    const corpo = ultima?.corpo_blocos ?? { blocos: [] }
    const { data, error } = await supabase
      .from('modelo_contrato_versoes')
      .insert({ modelo_id: modeloId, versao: maxVersao + 1, corpo_blocos: corpo, status: 'rascunho' })
      .select('id')
      .single()
    setCriando(false)
    if (!error && data) router.push(`/admin/gestao/contratos/modelos/${modeloId}/versoes/${data.id}`)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Versões ({versoes.length})</h2>
        <button onClick={novaVersao} disabled={criando} className="text-sm font-semibold text-white bg-blue-600 rounded-lg px-3 py-1.5 hover:bg-blue-700 disabled:opacity-50">
          {criando ? 'Criando...' : '+ Nova versão'}
        </button>
      </div>

      {versoes.length === 0 ? (
        <p className="text-sm text-slate-400">Nenhuma versão.</p>
      ) : (
        <div className="space-y-2">
          {[...versoes].sort((a, b) => b.versao - a.versao).map((v) => (
            <Link key={v.id} href={`/admin/gestao/contratos/modelos/${modeloId}/versoes/${v.id}`} className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-3 hover:border-slate-300 transition-colors">
              <span className="font-semibold text-slate-900">v{v.versao}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[v.status]}`}>{MODELO_VERSAO_STATUS_LABELS[v.status]}</span>
              {v.publicado_em && <span className="text-xs text-slate-400">publicada {formatDate(v.publicado_em)}</span>}
              <span className="ml-auto text-xs text-blue-600">{v.status === 'rascunho' ? 'Editar' : 'Ver'}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
