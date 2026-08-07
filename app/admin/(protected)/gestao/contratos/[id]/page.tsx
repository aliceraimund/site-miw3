import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import AdminContratoAbas from '@/components/AdminContratoAbas'
import type { Contrato, ContratoHistorico } from '@/types/contrato'
import type { ContratoTagSistema } from '@/types/contrato-tag'
import type { ContratoOutroValor } from '@/types/contrato-outros-valores'
import type { ContratoDocumento } from '@/components/contrato/AnexosPanel'

export default async function ContratoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data: contrato } = await supabase
    .from('contratos')
    .select('*, imovel:imoveis(nome), inquilino:inquilinos(nome)')
    .eq('id', id)
    .single()

  if (!contrato) notFound()

  const [{ data: tags }, { data: outros }, { data: historico }, { data: documentos }] = await Promise.all([
    supabase.from('contrato_tags_sistema').select('*').order('grupo').order('ordem'),
    supabase.from('contrato_outros_valores').select('*').eq('contrato_id', id).order('criado_em', { ascending: true }),
    supabase.from('contrato_historico').select('*').eq('contrato_id', id).order('criado_em', { ascending: false }),
    supabase.from('contrato_documentos').select('*').eq('contrato_id', id).order('criado_em', { ascending: true }),
  ])

  const c = contrato as Contrato & { imovel: { nome: string } | null; inquilino: { nome: string } | null }

  return (
    <div>
      <Link href="/admin/gestao/contratos" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Voltar para contratos
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{c.imovel?.nome ?? 'Contrato'}</h1>
        <p className="text-slate-500 text-sm mt-0.5">Locatário: {c.inquilino?.nome ?? '—'}</p>
      </div>

      <AdminContratoAbas
        contrato={c}
        imovelNome={c.imovel?.nome ?? '—'}
        inquilinoNome={c.inquilino?.nome ?? '—'}
        tags={(tags as ContratoTagSistema[]) ?? []}
        outrosValores={(outros as ContratoOutroValor[]) ?? []}
        historico={(historico as ContratoHistorico[]) ?? []}
        documentos={(documentos as ContratoDocumento[]) ?? []}
      />
    </div>
  )
}
