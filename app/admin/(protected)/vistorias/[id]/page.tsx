import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import VistoriaPreenchimento from '@/components/VistoriaPreenchimento'
import ArquivamentoPanel from '@/components/vistoria/ArquivamentoPanel'
import type { Vistoria, VistoriaItem, VistoriaAmbiente } from '@/types/vistoria'

export default async function VistoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data: vistoria } = await supabase
    .from('vistorias')
    .select('*, imovel:imoveis(nome, endereco:endereco_completo)')
    .eq('id', id)
    .single()

  if (!vistoria) notFound()

  const [{ data: itens }, { data: ambientes }] = await Promise.all([
    supabase.from('vistoria_itens').select('*, vistoria_fotos(*)').eq('vistoria_id', id).order('ordem'),
    supabase.from('vistoria_ambientes').select('*, vistoria_fotos(*)').eq('vistoria_id', id).order('ordem'),
  ])

  const { data: cfgDrive } = await supabase
    .from('configuracoes')
    .select('valor')
    .eq('chave', 'drive_vistorias_url')
    .maybeSingle()

  const lista = (itens ?? []) as VistoriaItem[]
  const listaAmb = (ambientes as VistoriaAmbiente[]) ?? []
  // Conta fotos de itens E de ambientes (as duas ocupam storage).
  const totalFotos =
    lista.reduce((soma, it) => soma + (it.vistoria_fotos?.length ?? 0), 0) +
    listaAmb.reduce((soma, a) => soma + (a.vistoria_fotos?.length ?? 0), 0)

  return (
    <div className="space-y-6">
      <VistoriaPreenchimento
        vistoria={vistoria as Vistoria}
        itensIniciais={lista}
        ambientesIniciais={listaAmb}
      />
      <ArquivamentoPanel
        vistoria={vistoria as Vistoria}
        totalFotos={totalFotos}
        driveUrl={(cfgDrive?.valor as string | null) ?? null}
      />
    </div>
  )
}
