import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import AdminContratoList, { type ContratoComRelacoes } from '@/components/AdminContratoList'
import GestaoSubNav from '@/components/GestaoSubNav'

export default async function ContratosPage() {
  const supabase = await createServerClient()
  const { data: contratos } = await supabase
    .from('contratos')
    .select('*, imovel:imoveis(nome, endereco_completo), inquilino:inquilinos(nome)')
    .order('status', { ascending: true })
    .order('data_inicio', { ascending: false })

  return (
    <div>
      <GestaoSubNav />
      <div className="flex flex-col items-start gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contratos</h1>
          <p className="text-slate-500 text-sm mt-0.5">{contratos?.length ?? 0} contrato(s)</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/gestao/contratos/modelos"
            className="border border-slate-300 text-slate-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Modelos
          </Link>
          <Link
            href="/admin/gestao/contratos/novo"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo contrato
          </Link>
        </div>
      </div>

      <AdminContratoList contratos={(contratos ?? []) as ContratoComRelacoes[]} />
    </div>
  )
}
