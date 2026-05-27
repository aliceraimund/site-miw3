import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import AdminImovelForm from '@/components/AdminImovelForm'
import type { Imovel } from '@/types/imovel'

export default async function EditarImovelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data } = await supabase.from('imoveis').select('*').eq('id', id).single()
  if (!data) notFound()

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-slate-500 hover:text-slate-700 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Editar imóvel</h1>
      </div>
      <AdminImovelForm imovel={data as Imovel} />
    </div>
  )
}
