import { Suspense } from 'react'
import { createServerClient } from '@/lib/supabase/server'
import ComparadorSeletor from '@/components/ComparadorSeletor'
import ComparadorResultado from '@/components/ComparadorResultado'
import type { ImovelVistoria, Vistoria, VistoriaItem } from '@/types/vistoria'

interface Props {
  searchParams: Promise<{ imovel?: string; entrada?: string; saida?: string }>
}

export default async function CompararPage({ searchParams }: Props) {
  const { imovel, entrada, saida } = await searchParams
  const supabase = await createServerClient()

  const { data: imoveis } = await supabase.from('imoveis_vistoria').select('*').order('nome')

  let vistoriasDoImovel: Vistoria[] = []
  if (imovel) {
    const { data } = await supabase
      .from('vistorias')
      .select('*, imoveis_vistoria(*)')
      .eq('imovel_id', imovel)
      .order('data', { ascending: false })
    vistoriasDoImovel = (data ?? []) as Vistoria[]
  }

  let vistoriaEntrada: Vistoria | null = null
  let vistoriaSaida: Vistoria | null = null
  let itensEntrada: VistoriaItem[] = []
  let itensSaida: VistoriaItem[] = []

  if (entrada && saida) {
    const [ve, vs, ie, is_] = await Promise.all([
      supabase.from('vistorias').select('*, imoveis_vistoria(*)').eq('id', entrada).single(),
      supabase.from('vistorias').select('*, imoveis_vistoria(*)').eq('id', saida).single(),
      supabase.from('vistoria_itens').select('*, vistoria_fotos(*)').eq('vistoria_id', entrada).order('ordem'),
      supabase.from('vistoria_itens').select('*, vistoria_fotos(*)').eq('vistoria_id', saida).order('ordem'),
    ])
    vistoriaEntrada = ve.data as Vistoria | null
    vistoriaSaida = vs.data as Vistoria | null
    itensEntrada = (ie.data ?? []) as VistoriaItem[]
    itensSaida = (is_.data ?? []) as VistoriaItem[]
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Comparar entrada × saída</h1>
      <p className="text-slate-500 text-sm mb-6">
        Selecione o imóvel e as vistorias de entrada e saída para comparar item a item.
      </p>

      <Suspense fallback={null}>
        <ComparadorSeletor imoveis={(imoveis ?? []) as ImovelVistoria[]} vistoriasDoImovel={vistoriasDoImovel} />
      </Suspense>

      {vistoriaEntrada && vistoriaSaida && (
        <ComparadorResultado
          vistoriaEntrada={vistoriaEntrada}
          vistoriaSaida={vistoriaSaida}
          itensEntrada={itensEntrada}
          itensSaida={itensSaida}
        />
      )}
    </div>
  )
}
