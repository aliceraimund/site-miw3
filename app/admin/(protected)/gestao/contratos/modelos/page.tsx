import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import AdminModeloList from '@/components/AdminModeloList'
import GestaoSubNav from '@/components/GestaoSubNav'
import type { ModeloContrato } from '@/types/modelo-contrato'

export default async function ModelosPage() {
  const supabase = await createServerClient()
  const { data: modelos } = await supabase.from('modelo_contratos').select('*').order('nome', { ascending: true })

  return (
    <div>
      <GestaoSubNav />
      <div className="flex flex-col items-start gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/admin/gestao/contratos" className="text-sm text-slate-500 hover:text-slate-700">← Contratos</Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Modelos de contrato</h1>
          <p className="text-slate-500 text-sm mt-0.5">{modelos?.length ?? 0} modelo(s)</p>
        </div>
        <Link href="/admin/gestao/contratos/modelos/novo" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Novo modelo
        </Link>
      </div>

      <AdminModeloList modelos={(modelos ?? []) as ModeloContrato[]} />
    </div>
  )
}
