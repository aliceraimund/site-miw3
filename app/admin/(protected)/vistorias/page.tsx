import { Suspense } from 'react'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import AdminVistoriaList from '@/components/AdminVistoriaList'
import AdminVistoriaFiltros from '@/components/AdminVistoriaFiltros'
import type { Vistoria, ImovelVistoria } from '@/types/vistoria'

interface Props {
  searchParams: Promise<{ imovel?: string; tipo?: string; status?: string }>
}

export default async function VistoriasPage({ searchParams }: Props) {
  const { imovel, tipo, status } = await searchParams
  const supabase = await createServerClient()

  let query = supabase
    .from('vistorias')
    .select('*, imovel:imoveis(nome, endereco:endereco_completo)')
    .order('criado_em', { ascending: false })

  if (imovel) query = query.eq('imovel_id', imovel)
  if (tipo) query = query.eq('tipo_vistoria', tipo)
  if (status) query = query.eq('status', status)

  const { data: vistorias } = await query
  const { data: imoveis } = await supabase.from('imoveis').select('id, nome, endereco:endereco_completo, categoria').order('nome')

  return (
    <div>
      <div className="flex flex-col items-start gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vistorias</h1>
          <p className="text-slate-500 text-sm mt-0.5">{vistorias?.length ?? 0} vistorias encontradas</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/vistorias/modelo-branco"
            className="text-sm text-slate-600 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Modelo em branco
          </Link>
          <Link
            href="/admin/vistorias/comparar"
            className="text-sm text-slate-600 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Comparar entrada × saída
          </Link>
          <Link
            href="/admin/vistorias/nova"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova vistoria
          </Link>
        </div>
      </div>

      <div className="mb-4">
        <Suspense fallback={null}>
          <AdminVistoriaFiltros imoveis={(imoveis ?? []) as ImovelVistoria[]} />
        </Suspense>
      </div>

      <AdminVistoriaList vistorias={(vistorias ?? []) as Vistoria[]} />
    </div>
  )
}
