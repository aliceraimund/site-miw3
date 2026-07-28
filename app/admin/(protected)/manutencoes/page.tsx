import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import AdminManutencaoList, { type ManutencaoComImovel } from '@/components/AdminManutencaoList'

export default async function ManutencoesPage() {
  const supabase = await createServerClient()
  const { data: manutencoes } = await supabase
    .from('manutencoes')
    .select('*, imovel:imoveis(nome)')
    .order('data_abertura', { ascending: false })

  return (
    <div>
      <div className="flex flex-col items-start gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manutenção</h1>
          <p className="text-slate-500 text-sm mt-0.5">{manutencoes?.length ?? 0} chamado(s)</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/manutencoes/relatorio"
            className="border border-slate-300 text-slate-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6h6v6m-9 4h12a2 2 0 002-2V7a2 2 0 00-2-2h-4l-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Relatório
          </Link>
          <Link
            href="/admin/manutencoes/novo"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo chamado
          </Link>
        </div>
      </div>

      <AdminManutencaoList manutencoes={(manutencoes ?? []) as ManutencaoComImovel[]} />
    </div>
  )
}
