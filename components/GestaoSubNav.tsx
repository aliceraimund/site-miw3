'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ITENS = [
  { href: '/admin/gestao/painel', label: 'Painel', match: (p: string) => p.startsWith('/admin/gestao/painel') },
  {
    href: '/admin/gestao',
    label: 'Imóveis',
    match: (p: string) =>
      p === '/admin/gestao' ||
      (p.startsWith('/admin/gestao/') &&
        !p.startsWith('/admin/gestao/painel') &&
        !p.startsWith('/admin/gestao/inquilinos') &&
        !p.startsWith('/admin/gestao/contratos')),
  },
  { href: '/admin/gestao/inquilinos', label: 'Inquilinos', match: (p: string) => p.startsWith('/admin/gestao/inquilinos') },
  { href: '/admin/gestao/contratos', label: 'Contratos', match: (p: string) => p.startsWith('/admin/gestao/contratos') },
]

export default function GestaoSubNav() {
  const pathname = usePathname() ?? ''
  return (
    <div className="flex gap-1 mb-6 border-b border-slate-200">
      {ITENS.map((item) => {
        const ativo = item.match(pathname)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              ativo ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}
