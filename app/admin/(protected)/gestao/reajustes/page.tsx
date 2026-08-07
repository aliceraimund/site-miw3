import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import GestaoSubNav from '@/components/GestaoSubNav'
import AdminReajustesPanel, { type ReajusteComRelacoes } from '@/components/AdminReajustesPanel'
import type { Contrato } from '@/types/contrato'
import type { IndiceEconomico, IndiceValorMensal } from '@/types/indice'

export const dynamic = 'force-dynamic'

export default async function ReajustesPage() {
  const supabase = await createServerClient()

  const [{ data: reajustes }, { data: contratos }, { data: indices }, { data: valores }] = await Promise.all([
    supabase
      .from('reajustes')
      .select('*, contrato:contratos(id, valor_aluguel, indice_reajuste, imovel:imoveis(nome))')
      .order('data_base', { ascending: true }),
    supabase.from('contratos').select('*, imovel:imoveis(nome)').order('data_inicio', { ascending: true }),
    supabase.from('indices_economicos').select('*'),
    supabase.from('indice_valores_mensais').select('*'),
  ])

  return (
    <div>
      <GestaoSubNav />
      <div className="flex flex-col items-start gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reajustes</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            O sistema projeta; a aplicação é sempre confirmada por uma pessoa
          </p>
        </div>
        <Link
          href="/admin/gestao/indices"
          className="border border-slate-300 text-slate-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shrink-0"
        >
          Índices econômicos
        </Link>
      </div>

      <AdminReajustesPanel
        reajustes={(reajustes as ReajusteComRelacoes[]) ?? []}
        contratos={(contratos ?? []) as (Contrato & { imovel: { nome: string } | null })[]}
        indices={(indices as IndiceEconomico[]) ?? []}
        valores={(valores as IndiceValorMensal[]) ?? []}
      />
    </div>
  )
}
