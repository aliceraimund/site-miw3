import { renderToBuffer } from '@react-pdf/renderer'
import { createServerClient } from '@/lib/supabase/server'
import LaudoDocument, { type LaudoItemPdf } from '@/components/pdf/LaudoDocument'
import type { Vistoria, VistoriaItem } from '@/types/vistoria'

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
    .select('*, imoveis_vistoria(*)')
    .eq('id', id)
    .single()

  if (!vistoria) {
    return new Response('Vistoria não encontrada', { status: 404 })
  }

  const { data: itensData } = await supabase
    .from('vistoria_itens')
    .select('*, vistoria_fotos(*)')
    .eq('vistoria_id', id)
    .order('ordem')

  const itens = (itensData ?? []) as VistoriaItem[]

  const itensPdf: LaudoItemPdf[] = await Promise.all(
    itens.map(async (item) => {
      const fotos = item.vistoria_fotos ?? []
      const urls = await Promise.all(
        fotos.map(async (foto) => {
          const { data } = await supabase.storage.from('vistorias').createSignedUrl(foto.storage_path, 300)
          return data?.signedUrl ?? null
        })
      )
      return {
        secao: item.secao,
        item: item.item,
        estado: item.estado,
        observacao: item.observacao,
        fotos: urls.filter((url): url is string => Boolean(url)),
      }
    })
  )

  const logoUrl = new URL('/logo-miw3-preto.png', request.url).toString()

  const buffer = await renderToBuffer(
    <LaudoDocument vistoria={vistoria as Vistoria} itens={itensPdf} logoUrl={logoUrl} />
  )

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="laudo-${id}.pdf"`,
    },
  })
}
