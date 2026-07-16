import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createServerClient } from '@/lib/supabase/server'
import ImageGallery from '@/components/ImageGallery'
import PriceDisplay from '@/components/PriceDisplay'
import WhatsAppFloat from '@/components/WhatsAppFloat'
import ShareButton from '@/components/ShareButton'
import { formatArea, STATUS_LABELS, STATUS_COLORS, DISPONIVEL_LABELS, DISPONIVEL_COLORS } from '@/lib/utils'
import type { Imovel } from '@/types/imovel'

const PHONE = '5511972793005'
const SITE_URL = 'https://miw3.com.br'

async function getImovel(id: string) {
  const supabase = await createServerClient()
  const { data } = await supabase.from('imoveis').select('*').eq('id', id).single()
  return data as Imovel | null
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const imovel = await getImovel(id)

  if (!imovel || !imovel.publicado) return {}

  const i = imovel
  const title = `${i.nome} — ${i.bairro}, ${i.cidade}`
  const description = `${i.tipo} em ${i.bairro}, ${i.cidade}. ${formatArea(i.area_m2)}${i.quartos != null ? `, ${i.quartos} quartos` : ''}. ${DISPONIVEL_LABELS[i.disponivel_para]} com a MIW3.`
  const image = i.fotos?.[0]

  return {
    title,
    description,
    alternates: {
      canonical: `/imovel/${i.id}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/imovel/${i.id}`,
      type: 'website',
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default async function ImovelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const imovel = await getImovel(id)

  if (!imovel || !imovel.publicado) notFound()

  const i = imovel
  const phone = i.whatsapp || PHONE

  const price = i.valor_livre_venda || i.valor_livre ? undefined : i.preco_venda ?? i.preco_locacao ?? undefined

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: i.nome,
    description: i.descricao ?? undefined,
    url: `${SITE_URL}/imovel/${i.id}`,
    image: i.fotos ?? undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: i.endereco_completo,
      addressLocality: i.cidade,
      addressRegion: 'SP',
      addressCountry: 'BR',
    },
    ...(price != null && {
      offers: {
        '@type': 'Offer',
        price,
        priceCurrency: 'BRL',
        availability: i.status === 'disponivel' ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
      },
    }),
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Voltar para listagem
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <ImageGallery fotos={i.fotos ?? []} nome={i.nome} />

          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[i.status]}`}>
                {STATUS_LABELS[i.status]}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${DISPONIVEL_COLORS[i.disponivel_para]}`}>
                {DISPONIVEL_LABELS[i.disponivel_para]}
              </span>
              {i.destaque && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                  Destaque
                </span>
              )}
            </div>

            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-1">{i.tipo}</p>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{i.nome}</h1>
            <p className="text-slate-500 flex items-start gap-1.5">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {i.endereco_completo} — {i.bairro}, {i.cidade}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
              <p className="text-xs text-slate-500 mb-1">Área</p>
              <p className="font-bold text-slate-900">{formatArea(i.area_m2)}</p>
            </div>
            {!!i.quartos && (
              <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
                <p className="text-xs text-slate-500 mb-1">Quartos</p>
                <p className="font-bold text-slate-900">{i.quartos}</p>
              </div>
            )}
            {!!i.suites && (
              <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
                <p className="text-xs text-slate-500 mb-1">Suítes</p>
                <p className="font-bold text-slate-900">{i.suites}</p>
              </div>
            )}
            {!!i.banheiros && (
              <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
                <p className="text-xs text-slate-500 mb-1">Banheiros</p>
                <p className="font-bold text-slate-900">{i.banheiros}</p>
              </div>
            )}
            {!!i.vagas && (
              <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
                <p className="text-xs text-slate-500 mb-1">Vagas</p>
                <p className="font-bold text-slate-900">{i.vagas}</p>
              </div>
            )}
          </div>

          {i.descricao && (
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h2 className="font-semibold text-slate-900 mb-3">Descrição</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{i.descricao}</p>
            </div>
          )}
        </div>

        <div className="space-y-4 sticky top-6 self-start">
          <ShareButton />
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div>
              <h2 className="font-semibold text-slate-900 mb-4 text-lg">Valores</h2>
              <PriceDisplay imovel={i} />
            </div>

            <a
              href={`https://wa.me/${phone}?text=${encodeURIComponent(`Olá, tudo bem? Tenho interesse no imóvel ${i.nome}!`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl py-3 transition-colors"
            >
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Tenho interesse
            </a>

            <div className="rounded-xl border border-slate-200 p-4 flex items-center justify-center">
              <Image src="/logo-miw3-preto.png" alt="MIW3" width={300} height={120} className="w-full h-auto" />
            </div>
          </div>

          {/* Map */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 pt-4 pb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm font-semibold text-slate-700">Localização</p>
            </div>
            <iframe
              title="Mapa"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(`${i.endereco_completo}, ${i.bairro}, ${i.cidade}`)}&output=embed&z=15`}
              className="w-full h-56 border-0"
              loading="lazy"
              allowFullScreen
            />
            <div className="px-4 py-3 space-y-2">
              <p className="text-xs text-slate-500 leading-snug">{i.endereco_completo} — {i.bairro}, {i.cidade}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${i.endereco_completo}, ${i.bairro}, ${i.cidade}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg py-2 transition-colors"
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Abrir no Google Maps
              </a>
            </div>
          </div>
        </div>

        <WhatsAppFloat phone={phone} message={`Olá, tudo bem? Tenho interesse no imóvel ${i.nome}!`} />
      </div>
    </div>
  )
}
