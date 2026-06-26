import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

const SITE_URL = 'https://miw3.com.br'
const SITE_DESCRIPTION = 'Portfólio de imóveis MIW3: apartamentos, galpões, salas comerciais, lojas e terrenos para venda e locação. Encontre o imóvel ideal.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'MIW3 Imóveis – Apartamentos, Galpões, Salas e Terrenos',
    template: '%s | MIW3 Imóveis',
  },
  description: SITE_DESCRIPTION,
  keywords: ['MIW3', 'MIW3 imóveis', 'imóveis à venda', 'imóveis para locação', 'apartamentos', 'galpões', 'salas comerciais', 'terrenos'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'MIW3 Imóveis',
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: 'MIW3 Imóveis',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: '/hero-bg.png', width: 1717, height: 916, alt: 'MIW3 Imóveis' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MIW3 Imóveis',
    description: SITE_DESCRIPTION,
    images: ['/hero-bg.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: 'GZ8vKW8b2z9BjXRbCMr_Ihu43gc49RMl6Lr-a9xpuHc',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-50 text-slate-900 flex flex-col min-h-screen`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'RealEstateAgent',
              name: 'MIW3',
              url: SITE_URL,
              image: `${SITE_URL}/logo-miw3.png`,
              telephone: '+551135651505',
              email: 'contato.miw3@gmail.com',
              areaServed: 'BR',
            }),
          }}
        />
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  )
}
