import { renderToBuffer } from '@react-pdf/renderer'
import { createServerClient } from '@/lib/supabase/server'
import LaudoDocument, { type LaudoAmbientePdf, type LaudoItemPdf } from '@/components/pdf/LaudoDocument'
import type { Vistoria, VistoriaItem, VistoriaAmbiente, VistoriaFoto } from '@/types/vistoria'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { data: vistoria } = await supabase
    .from('vistorias')
    .select('*, imovel:imoveis(nome, endereco:endereco_completo)')
    .eq('id', id)
    .single()

  if (!vistoria) {
    return new Response('Vistoria não encontrada', { status: 404 })
  }

  const [{ data: itensData }, { data: ambientesData }] = await Promise.all([
    supabase.from('vistoria_itens').select('*, vistoria_fotos(*)').eq('vistoria_id', id).order('ordem'),
    supabase.from('vistoria_ambientes').select('*, vistoria_fotos(*)').eq('vistoria_id', id).order('ordem'),
  ])

  const itens = (itensData ?? []) as VistoriaItem[]
  const ambientes = (ambientesData ?? []) as VistoriaAmbiente[]

  // Os links assinados são gerados uma única vez por foto e reaproveitados.
  const assinar = async (fotos: VistoriaFoto[]): Promise<string[]> => {
    const urls = await Promise.all(
      fotos.map(async (foto) => {
        const { data } = await supabase.storage.from('vistorias').createSignedUrl(foto.storage_path, 300)
        return data?.signedUrl ?? null
      })
    )
    return urls.filter((url): url is string => Boolean(url))
  }

  const montarItem = async (item: VistoriaItem): Promise<LaudoItemPdf> => ({
    item: item.item,
    estado: item.estado,
    observacao: item.observacao,
    fotos: await assinar(item.vistoria_fotos ?? []),
  })

  let blocos: LaudoAmbientePdf[]

  if (ambientes.length > 0) {
    blocos = await Promise.all(
      ambientes.map(async (ambiente) => ({
        nome: ambiente.nome,
        observacao: ambiente.observacao,
        fotos: await assinar(ambiente.vistoria_fotos ?? []),
        itens: await Promise.all(itens.filter((i) => i.ambiente_id === ambiente.id).map(montarItem)),
      }))
    )
    // Vistorias migradas podem ter itens sem ambiente — agrupados pela seção antiga.
    const soltos = itens.filter((i) => !i.ambiente_id || !ambientes.some((a) => a.id === i.ambiente_id))
    for (const secao of Array.from(new Set(soltos.map((i) => i.secao)))) {
      blocos.push({
        nome: secao,
        observacao: null,
        fotos: [],
        itens: await Promise.all(soltos.filter((i) => i.secao === secao).map(montarItem)),
      })
    }
  } else {
    // Vistorias anteriores ao módulo de ambientes: agrupa pela seção do checklist.
    blocos = await Promise.all(
      Array.from(new Set(itens.map((i) => i.secao))).map(async (secao) => ({
        nome: secao,
        observacao: null,
        fotos: [],
        itens: await Promise.all(itens.filter((i) => i.secao === secao).map(montarItem)),
      }))
    )
  }

  const logoUrl = new URL('/logo-miw3-preto.png', request.url).toString()

  const buffer = await renderToBuffer(
    <LaudoDocument vistoria={vistoria as Vistoria} ambientes={blocos} logoUrl={logoUrl} />
  )

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="laudo-${id}.pdf"`,
    },
  })
}
