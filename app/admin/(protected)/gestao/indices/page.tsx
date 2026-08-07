import { createServerClient } from '@/lib/supabase/server'
import GestaoSubNav from '@/components/GestaoSubNav'
import AdminIndicesPanel from '@/components/AdminIndicesPanel'
import type { IndiceEconomico, IndiceValorMensal } from '@/types/indice'

export const dynamic = 'force-dynamic'

export default async function IndicesPage() {
  const supabase = await createServerClient()
  const [{ data: indices }, { data: valores }] = await Promise.all([
    supabase.from('indices_economicos').select('*').order('codigo'),
    supabase.from('indice_valores_mensais').select('*').order('ano_mes'),
  ])

  return (
    <div>
      <GestaoSubNav />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Índices econômicos</h1>
        <p className="text-slate-500 text-sm mt-0.5">Série mensal usada nos reajustes — informe a variação de cada mês</p>
      </div>

      <AdminIndicesPanel
        indices={(indices as IndiceEconomico[]) ?? []}
        valores={(valores as IndiceValorMensal[]) ?? []}
      />
    </div>
  )
}
