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

  // O modelo impresso traz os ambientes padrão do tipo de imóvel, na ordem em
  // que a vistoria é feita; os demais ambientes ficam disponíveis no sistema.
  const { data: ambientes } = await supabase
    .from('vistoria_ambiente_templates')
    .select('id, nome')
    .eq('tipo_imovel', tipo)
    .eq('ativo', true)
    .eq('padrao', true)
    .order('ordem')

  const listaAmbientes = (ambientes ?? []) as { id: string; nome: string }[]

  const { data: templates } = await supabase
    .from('vistoria_checklist_templates')
    .select('*')
    .eq('tipo_imovel', tipo)
    .eq('ativo', true)
    .order('ordem')

  const lista = (templates ?? []) as ChecklistTemplateItem[]

  const itens = listaAmbientes.length > 0
    ? listaAmbientes.flatMap((a) =>
        lista.filter((t) => t.ambiente_template_id === a.id).map((t) => ({ secao: a.nome, item: t.item }))
      )
    : lista.map((t) => ({ secao: t.secao, item: t.item })) // checklist antigo, por sistema

  const logoUrl = new URL('/logo-miw3-preto.png', request.url).toString()

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
