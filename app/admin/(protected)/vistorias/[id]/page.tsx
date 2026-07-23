import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import VistoriaPreenchimento from '@/components/VistoriaPreenchimento'
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

  return <VistoriaPreenchimento vistoria={vistoria as Vistoria} itensIniciais={(itens ?? []) as VistoriaItem[]} />
}
