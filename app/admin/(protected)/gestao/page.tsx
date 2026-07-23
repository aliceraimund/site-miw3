import Link from 'next/link'
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
      <div className="flex flex-col items-start gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestão de imóveis</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Administração interna do patrimônio — ative a gestão em um imóvel para acessar a ficha completa
          </p>
        </div>
        <Link
          href="/admin/gestao/novo"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Cadastrar imóvel
        </Link>
      </div>

      <AdminGestaoList imoveis={lista} />
    </div>
  )
}
