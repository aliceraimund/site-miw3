import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import AdminVistoriaNovaForm from '@/components/AdminVistoriaNovaForm'
import type { ImovelVistoria } from '@/types/vistoria'

export default async function NovaVistoriaPage() {
  const supabase = await createServerClient()
  const { data: imoveis } = await supabase.from('imoveis_vistoria').select('*').order('nome')

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/vistorias" className="text-slate-500 hover:text-slate-700 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Nova vistoria</h1>
      </div>
      <AdminVistoriaNovaForm imoveis={(imoveis ?? []) as ImovelVistoria[]} />
    </div>
  )
}
