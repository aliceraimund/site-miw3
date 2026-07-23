import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import AdminOrdenarList from '@/components/AdminOrdenarList'
import type { Imovel } from '@/types/imovel'

export default async function OrdenarPage() {
  const supabase = await createServerClient()
  const { data: imoveis } = await supabase
    .from('imoveis')
    .select('*')
    .order('ordem', { ascending: true, nullsFirst: false })
    .order('destaque', { ascending: false })
    .order('criado_em', { ascending: false })

  return (
    <div>
      <div className="flex flex-col items-start gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ordem de exibição</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Defina a ordem em que os anúncios aparecem na página principal do site
          </p>
        </div>
        <Link
          href="/admin"
          className="text-sm text-slate-600 border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors"
        >
          Voltar para anúncios
        </Link>
      </div>

      <AdminOrdenarList imoveis={(imoveis ?? []) as Imovel[]} />
    </div>
  )
}
