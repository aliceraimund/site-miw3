import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import AdminManutencaoRelatorio from '@/components/AdminManutencaoRelatorio'

export default async function ManutencaoRelatorioPage() {
  const supabase = await createServerClient()
  const { data: imoveis } = await supabase.from('imoveis').select('id, nome').order('nome', { ascending: true })

  return (
    <div>
      <Link href="/admin/manutencoes" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Voltar para manutenção
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Relatório por imóvel</h1>
        <p className="text-slate-500 text-sm mt-0.5">Chamados de manutenção filtrados por imóvel, período e status</p>
      </div>

      <AdminManutencaoRelatorio imoveis={imoveis ?? []} />
    </div>
  )
}
