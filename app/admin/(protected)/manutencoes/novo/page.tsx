import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import AdminManutencaoForm from '@/components/AdminManutencaoForm'

export default async function ManutencaoNovaPage() {
  const supabase = await createServerClient()
  const { data: imoveis } = await supabase
    .from('imoveis')
    .select('id, nome, endereco_completo')
    .order('nome', { ascending: true })

  return (
    <div>
      <Link href="/admin/manutencoes" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Voltar para manutenção
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Novo chamado</h1>
      </div>

      <AdminManutencaoForm imoveis={imoveis ?? []} />
    </div>
  )
}
