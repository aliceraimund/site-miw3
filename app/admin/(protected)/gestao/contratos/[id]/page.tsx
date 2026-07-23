import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import AdminContratoForm from '@/components/AdminContratoForm'
import type { Contrato } from '@/types/contrato'

export default async function ContratoEditarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()

  const [{ data: contrato }, { data: imoveis }, { data: inquilinos }] = await Promise.all([
    supabase.from('contratos').select('*').eq('id', id).single(),
    supabase.from('imoveis').select('id, nome, endereco_completo').order('nome', { ascending: true }),
    supabase.from('inquilinos').select('id, nome').order('nome', { ascending: true }),
  ])

  if (!contrato) notFound()

  return (
    <div>
      <Link href="/admin/gestao/contratos" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Voltar para contratos
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Contrato</h1>
      </div>

      <AdminContratoForm
        contrato={contrato as Contrato}
        imoveis={imoveis ?? []}
        inquilinos={inquilinos ?? []}
      />
    </div>
  )
}
