import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import AdminGestaoFicha from '@/components/AdminGestaoFicha'
import type { Imovel } from '@/types/imovel'
import type { ImovelGestao, ImovelConta, ImovelDocumento } from '@/types/gestao'

export default async function GestaoFichaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data: imovel } = await supabase.from('imoveis').select('*').eq('id', id).single()
  if (!imovel) notFound()

  const { data: ficha } = await supabase.from('imovel_gestao').select('*').eq('imovel_id', id).maybeSingle()
  const { data: contas } = await supabase
    .from('imovel_contas')
    .select('*')
    .eq('imovel_id', id)
    .order('criado_em', { ascending: true })

  const { data: documentos } = await supabase
    .from('imovel_documentos')
    .select('*')
    .eq('imovel_id', id)
    .order('criado_em', { ascending: true })

  return (
    <div>
      <Link href="/admin/gestao" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Voltar para a gestão
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{(imovel as Imovel).nome}</h1>
        <p className="text-slate-500 text-sm mt-0.5">{(imovel as Imovel).endereco_completo} — {(imovel as Imovel).cidade}</p>
      </div>

      <AdminGestaoFicha
        imovel={imovel as Imovel}
        ficha={(ficha as ImovelGestao | null) ?? null}
        contasIniciais={(contas as ImovelConta[]) ?? []}
        documentosIniciais={(documentos as ImovelDocumento[]) ?? []}
      />
    </div>
  )
}
