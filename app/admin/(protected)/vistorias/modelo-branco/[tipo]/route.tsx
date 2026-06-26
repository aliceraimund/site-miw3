import { renderToBuffer } from '@react-pdf/renderer'
import { createServerClient } from '@/lib/supabase/server'
import ModeloBrancoDocument from '@/components/pdf/ModeloBrancoDocument'
import type { ChecklistTemplateItem, TipoImovelVistoria } from '@/types/vistoria'

interface Params {
  params: Promise<{ tipo: string }>
}

export async function GET(request: Request, { params }: Params) {
  const { tipo } = await params

  if (tipo !== 'residencial' && tipo !== 'comercial') {
    return new Response('Tipo inválido', { status: 400 })
  }

  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { data: templates } = await supabase
    .from('vistoria_checklist_templates')
    .select('*')
    .eq('tipo_imovel', tipo)
    .eq('ativo', true)
    .order('ordem')

  const itens = ((templates ?? []) as ChecklistTemplateItem[]).map((t) => ({ secao: t.secao, item: t.item }))

  const logoUrl = new URL('/logo-miw3.png', request.url).toString()

  const buffer = await renderToBuffer(
    <ModeloBrancoDocument tipoImovel={tipo as TipoImovelVistoria} itens={itens} logoUrl={logoUrl} />
  )

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="modelo-vistoria-${tipo}.pdf"`,
    },
  })
}
