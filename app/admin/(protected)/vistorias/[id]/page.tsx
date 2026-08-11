import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import VistoriaPreenchimento from '@/components/VistoriaPreenchimento'
import ArquivamentoPanel from '@/components/vistoria/ArquivamentoPanel'
import type { Vistoria, VistoriaItem } from '@/types/vistoria'

export default async function VistoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data: vistoria } = await supabase
    .from('vistorias')
    .select('*, imovel:imoveis(nome, endereco:endereco_completo)')
    .eq('id', id)
    .single()

  if (!vistoria) notFound()

  const { data: itens } = await supabase
    .from('vistoria_itens')
    .select('*, vistoria_fotos(*)')
    .eq('vistoria_id', id)
    .order('ordem')

  const lista = (itens ?? []) as VistoriaItem[]
  const totalFotos = lista.reduce((soma, it) => soma + (it.vistoria_fotos?.length ?? 0), 0)

  return (
    <div className="space-y-6">
      <VistoriaPreenchimento vistoria={vistoria as Vistoria} itensIniciais={lista} />
      <ArquivamentoPanel vistoria={vistoria as Vistoria} totalFotos={totalFotos} />
    </div>
  )
}
