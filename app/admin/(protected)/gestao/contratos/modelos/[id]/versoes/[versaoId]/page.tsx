import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import AdminVersaoEditor from '@/components/AdminVersaoEditor'
import AdminVersaoEditorHtml from '@/components/AdminVersaoEditorHtml'
import type { ModeloContrato, ModeloContratoVersao, ModeloVariavel } from '@/types/modelo-contrato'
import type { ContratoTagSistema } from '@/types/contrato-tag'

export default async function VersaoEditorPage({ params }: { params: Promise<{ id: string; versaoId: string }> }) {
  const { id, versaoId } = await params
  const supabase = await createServerClient()

  const [{ data: modelo }, { data: versao }, { data: variaveis }, { data: tags }] = await Promise.all([
    supabase.from('modelo_contratos').select('*').eq('id', id).single(),
    supabase.from('modelo_contrato_versoes').select('*').eq('id', versaoId).single(),
    supabase.from('modelo_variaveis').select('*').eq('versao_id', versaoId).order('ordem', { ascending: true }),
    supabase.from('contrato_tags_sistema').select('*').order('grupo').order('ordem'),
  ])

  if (!modelo || !versao) notFound()
  const m = modelo as ModeloContrato
  const v = versao as ModeloContratoVersao
  const ehHtml = v.formato !== 'blocos'

  return (
    <div>
      <Link href={`/admin/gestao/contratos/modelos/${id}`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Voltar para o modelo
      </Link>
      <div className="mb-6">
        <code className="text-xs text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">{m.codigo}</code>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">{m.nome}</h1>
      </div>

      {ehHtml ? (
        <AdminVersaoEditorHtml modeloId={id} versao={v} tags={(tags as ContratoTagSistema[]) ?? []} />
      ) : (
        <>
          <div className="mb-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
            Esta versão usa o formato antigo de blocos. Novas versões nascem no editor de documento.
          </div>
          <AdminVersaoEditor modeloId={id} versao={v} variaveisIniciais={(variaveis as ModeloVariavel[]) ?? []} />
        </>
      )}
    </div>
  )
}
