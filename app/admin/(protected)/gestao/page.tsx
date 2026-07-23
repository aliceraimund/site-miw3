import { createServerClient } from '@/lib/supabase/server'
import AdminGestaoList from '@/components/AdminGestaoList'
import type { Imovel } from '@/types/imovel'
import type { ImovelGestao } from '@/types/gestao'

export default async function GestaoPage() {
  const supabase = await createServerClient()

  const { data: imoveis } = await supabase
    .from('imoveis')
    .select('*')
    .order('gerido', { ascending: false })
    .order('nome', { ascending: true })

  const { data: fichas } = await supabase
    .from('imovel_gestao')
    .select('imovel_id, situacao_gestao')

  const situacaoPorImovel = new Map(
    (fichas ?? []).map((f) => [f.imovel_id, f.situacao_gestao as ImovelGestao['situacao_gestao']])
  )

  const lista = ((imoveis ?? []) as Imovel[]).map((i) => ({
    ...i,
    situacao_gestao: situacaoPorImovel.get(i.id) ?? null,
  }))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Gestão de imóveis</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Administração interna do patrimônio — ative a gestão em um imóvel para acessar a ficha completa
        </p>
      </div>

      <AdminGestaoList imoveis={lista} />
    </div>
  )
}
