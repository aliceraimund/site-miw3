import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import AdminInquilinoList from '@/components/AdminInquilinoList'
import GestaoSubNav from '@/components/GestaoSubNav'
import type { Inquilino } from '@/types/inquilino'

export default async function InquilinosPage() {
  const supabase = await createServerClient()
  const { data: inquilinos } = await supabase
    .from('inquilinos')
    .select('*')
    .order('nome', { ascending: true })

  return (
    <div>
      <GestaoSubNav />
      <div className="flex flex-col items-start gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inquilinos</h1>
          <p className="text-slate-500 text-sm mt-0.5">{inquilinos?.length ?? 0} inquilino(s) cadastrado(s)</p>
        </div>
        <Link
          href="/admin/gestao/inquilinos/novo"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo inquilino
        </Link>
      </div>

      <AdminInquilinoList inquilinos={(inquilinos ?? []) as Inquilino[]} />
    </div>
  )
}
