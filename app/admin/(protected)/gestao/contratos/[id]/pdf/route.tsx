import { renderToBuffer } from '@react-pdf/renderer'
import { createServerClient } from '@/lib/supabase/server'
import ContratoDocument from '@/components/pdf/ContratoDocument'
import ContratoHtmlDocument from '@/components/pdf/ContratoHtmlDocument'
import type { BlocoResolvido } from '@/lib/contrato/merge'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data: contrato } = await supabase
    .from('contratos')
    .select('id, corpo_gerado, corpo_gerado_html')
    .eq('id', id)
    .single()

  if (!contrato) return new Response('Contrato não encontrado', { status: 404 })

  const logoUrl = new URL('/logo-miw3-preto.png', request.url).toString()
  const html = (contrato.corpo_gerado_html as string | null) ?? ''

  let buffer: Buffer
  if (html.trim()) {
    // Caminho novo: documento em HTML.
    buffer = await renderToBuffer(<ContratoHtmlDocument html={html} logoUrl={logoUrl} titulo={`Contrato ${id}`} />)
  } else {
    // Fallback legado: snapshot em blocos (jsonb).
    const corpo = contrato.corpo_gerado as { blocos?: BlocoResolvido[] } | null
    const blocos = corpo?.blocos ?? []
    if (blocos.length === 0) {
      return new Response('Contrato ainda não tem documento gerado.', { status: 409 })
    }
    buffer = await renderToBuffer(<ContratoDocument blocos={blocos} logoUrl={logoUrl} titulo={`Contrato ${id}`} />)
  }

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="contrato-${id}.pdf"`,
    },
  })
}
