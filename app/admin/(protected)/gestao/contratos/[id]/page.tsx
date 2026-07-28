import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import AdminContratoForm from '@/components/AdminContratoForm'
import type { Contrato, ContratoHistorico } from '@/types/contrato'

export default async function ContratoEditarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()

  const [{ data: contrato }, { data: imoveis }, { data: inquilinos }, { data: historico }] = await Promise.all([
    supabase.from('contratos').select('*').eq('id', id).single(),
    supabase.from('imoveis').select('id, nome, endereco_completo').order('nome', { ascending: true }),
    supabase.from('inquilinos').select('id, nome').order('nome', { ascending: true }),
    supabase.from('contrato_historico').select('*').eq('contrato_id', id).order('criado_em', { ascending: false }),
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

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Contrato</h1>
        {(contrato as Contrato).corpo_gerado && (
          <a
            href={`/admin/gestao/contratos/${id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M4 6a2 2 0 012-2h8l6 6v8a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
            </svg>
            Baixar PDF
          </a>
        )}
      </div>

      <AdminContratoForm
        contrato={contrato as Contrato}
        imoveis={imoveis ?? []}
        inquilinos={inquilinos ?? []}
        historicoInicial={(historico as ContratoHistorico[]) ?? []}
      />
    </div>
  )
}
