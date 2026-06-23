import type { MetadataRoute } from 'next'
import { createServerClient } from '@/lib/supabase/server'

const BASE_URL = 'https://miw3.com.br'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createServerClient()

  const { data: imoveis } = await supabase
    .from('imoveis')
    .select('id, criado_em')
    .eq('publicado', true)

  const imoveisEntries: MetadataRoute.Sitemap = (imoveis ?? []).map((imovel) => ({
    url: `${BASE_URL}/imovel/${imovel.id}`,
    lastModified: imovel.criado_em ? new Date(imovel.criado_em) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...imoveisEntries,
  ]
}
