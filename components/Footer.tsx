import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <Image src="/logo-miw3.png" alt="MIW3" width={160} height={64} className="h-16 w-auto opacity-90" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 text-sm">
            <a
              href="tel:+5511972793005"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              +55 (11) 97279-3005
            </a>
            <a
              href="mailto:contato.miw3@gmail.com"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              contato.miw3@gmail.com
            </a>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-700 pt-6 text-xs text-slate-500 flex items-center justify-between">
          <span>© {new Date().getFullYear()} MIW3. Todos os direitos reservados.</span>
          <a href="/admin/login" className="hover:text-slate-300 transition-colors">Área administrativa</a>
        </div>
      </div>
    </footer>
  )
}
