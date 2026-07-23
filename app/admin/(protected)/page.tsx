import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import AdminImovelList from '@/components/AdminImovelList'
import type { Imovel } from '@/types/imovel'

export default async function AdminPage() {
  const supabase = await createServerClient()
  const { data: imoveis } = await supabase
    .from('imoveis')
    .select('*')
    .order('ordem', { ascending: true, nullsFirst: false })
    .order('destaque', { ascending: false })
    .order('criado_em', { ascending: false })

  return (
    <div>
      <div className="flex flex-col items-start gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Imóveis</h1>
          <p className="text-slate-500 text-sm mt-0.5">{imoveis?.length ?? 0} imóveis cadastrados</p>
        </div>
        <div className="flex items-center gap-2">
        <Link
          href="/admin/ordenar"
          className="border border-slate-300 text-slate-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h13M3 12h9M3 17h5m8 0l4-4m0 0l-4-4m4 4H11" />
          </svg>
          Ordenar exibição
        </Link>
        <Link
          href="/admin/imoveis/novo"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo imóvel
        </Link>
        </div>
      </div>

      <AdminImovelList imoveis={(imoveis ?? []) as Imovel[]} />
    </div>
  )
}
