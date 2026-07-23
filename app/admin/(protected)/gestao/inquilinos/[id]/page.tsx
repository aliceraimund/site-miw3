import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import AdminInquilinoForm from '@/components/AdminInquilinoForm'
import type { Inquilino, InquilinoDocumento } from '@/types/inquilino'

export default async function InquilinoEditarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data: inquilino } = await supabase.from('inquilinos').select('*').eq('id', id).single()
  if (!inquilino) notFound()

  const { data: documentos } = await supabase
    .from('inquilino_documentos')
    .select('*')
    .eq('inquilino_id', id)
    .order('criado_em', { ascending: true })

  return (
    <div>
      <Link href="/admin/gestao/inquilinos" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Voltar para inquilinos
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{(inquilino as Inquilino).nome}</h1>
      </div>

      <AdminInquilinoForm
        inquilino={inquilino as Inquilino}
        documentosIniciais={(documentos as InquilinoDocumento[]) ?? []}
      />
    </div>
  )
}
