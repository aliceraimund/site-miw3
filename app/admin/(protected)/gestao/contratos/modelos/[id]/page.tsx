import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import AdminModeloVersoes from '@/components/AdminModeloVersoes'
import type { ModeloContrato, ModeloContratoVersao } from '@/types/modelo-contrato'

export default async function ModeloDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()

  const [{ data: modelo }, { data: versoes }] = await Promise.all([
    supabase.from('modelo_contratos').select('*').eq('id', id).single(),
    supabase.from('modelo_contrato_versoes').select('*').eq('modelo_id', id).order('versao', { ascending: false }),
  ])

  if (!modelo) notFound()
  const m = modelo as ModeloContrato

  return (
    <div>
      <Link href="/admin/gestao/contratos/modelos" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Voltar para modelos
      </Link>
      <div className="mb-6">
        <code className="text-xs text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">{m.codigo}</code>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">{m.nome}</h1>
        {m.descricao && <p className="text-slate-500 text-sm mt-0.5">{m.descricao}</p>}
      </div>

      <AdminModeloVersoes modeloId={id} versoes={(versoes ?? []) as ModeloContratoVersao[]} />
    </div>
  )
}
