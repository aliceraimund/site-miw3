import { renderToBuffer } from '@react-pdf/renderer'
import { createServerClient } from '@/lib/supabase/server'
import ManutencaoRelatorioDocument, { type LinhaRelatorio } from '@/components/pdf/ManutencaoRelatorioDocument'
import { MANUTENCAO_STATUS_LABELS, type ManutencaoStatus } from '@/types/manutencao'

export async function GET(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const url = new URL(request.url)
  const imovelId = url.searchParams.get('imovel') ?? ''
  const de = url.searchParams.get('de') ?? ''
  const ate = url.searchParams.get('ate') ?? ''
  const status = url.searchParams.get('status') ?? ''

  if (!imovelId) return new Response('Imóvel é obrigatório.', { status: 400 })

  const { data: imovel } = await supabase.from('imoveis').select('nome').eq('id', imovelId).single()

  let query = supabase
    .from('manutencoes')
    .select('data_abertura, titulo, status, custo_estimado, custo_real, data_inicio, data_conclusao_estimada, data_conclusao_real')
    .eq('imovel_id', imovelId)
    .order('data_abertura', { ascending: false })
  if (de) query = query.gte('data_abertura', de)
  if (ate) query = query.lte('data_abertura', ate)
  if (status) query = query.eq('status', status)

  const { data: rows } = await query
  const linhas: LinhaRelatorio[] = (rows ?? []).map((r) => ({
    ...r,
    status: MANUTENCAO_STATUS_LABELS[r.status as ManutencaoStatus] ?? r.status,
  }))

  const totalEstimado = linhas.reduce((s, l) => s + (l.custo_estimado ?? 0), 0)
  const totalReal = linhas.reduce((s, l) => s + (l.custo_real ?? 0), 0)

  const periodo = de || ate ? `${de || '...'} até ${ate || '...'}` : 'todos os períodos'
  const geradoEm = new Date().toLocaleString('pt-BR')
  const logoUrl = new URL('/logo-miw3-preto.png', request.url).toString()

  const buffer = await renderToBuffer(
    <ManutencaoRelatorioDocument
      imovelNome={imovel?.nome ?? 'Imóvel'}
      periodo={periodo}
      geradoEm={geradoEm}
      linhas={linhas}
      totalEstimado={totalEstimado}
      totalReal={totalReal}
      logoUrl={logoUrl}
    />
  )

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="relatorio-manutencao.pdf"`,
    },
  })
}
