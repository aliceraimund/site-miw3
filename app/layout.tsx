import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import './globals.css'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MIW3 – Imóveis Comerciais',
  description: 'Portfólio de imóveis comerciais MIW3. Galpões, salas comerciais, lojas e muito mais.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-50 text-slate-900 flex flex-col min-h-screen`}>
        <header className="bg-slate-900 shadow sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Image src="/logo-miw3.png" alt="MIW3" width={28} height={40} className="h-8 w-auto" />
              <span className="text-xl font-bold text-white tracking-tight">MIW3</span>
            </a>
            <span className="ml-3 text-slate-400 text-sm hidden sm:block">Imóveis Comerciais</span>
          </div>
        </header>
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  )
}
