import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import AdminManutencaoForm from '@/components/AdminManutencaoForm'
import type { Manutencao, ManutencaoFoto } from '@/types/manutencao'

export default async function ManutencaoEditarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()

  const [{ data: manutencao }, { data: imoveis }, { data: fotos }] = await Promise.all([
    supabase.from('manutencoes').select('*').eq('id', id).single(),
    supabase.from('imoveis').select('id, nome, endereco_completo').order('nome', { ascending: true }),
    supabase.from('manutencao_fotos').select('*').eq('manutencao_id', id).order('criado_em', { ascending: true }),
  ])

  if (!manutencao) notFound()

  return (
    <div>
      <Link href="/admin/gestao/manutencoes" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Voltar para manutenção
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{(manutencao as Manutencao).titulo}</h1>
      </div>

      <AdminManutencaoForm
        manutencao={manutencao as Manutencao}
        imoveis={imoveis ?? []}
        fotosIniciais={(fotos as ManutencaoFoto[]) ?? []}
      />
    </div>
  )
}
