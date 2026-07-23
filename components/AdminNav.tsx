'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  userEmail: string
}

function icon(path: React.ReactNode) {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      {path}
    </svg>
  )
}

export default function AdminNav({ userEmail }: Props) {
  const router = useRouter()
  const pathname = usePathname() ?? ''

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const isVistorias = pathname.startsWith('/admin/vistorias')
  const isGestao = pathname.startsWith('/admin/gestao')
  const isManutencao = pathname.startsWith('/admin/manutencoes')
  const isAnuncios = !isVistorias && !isGestao && !isManutencao

  const itens = [
    {
      href: '/admin/gestao/painel',
      label: 'Gestão',
      ativo: isGestao,
      icon: icon(<><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>),
    },
    {
      href: '/admin',
      label: 'Anúncios',
      ativo: isAnuncios,
      icon: icon(<path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />),
    },
    {
      href: '/admin/manutencoes',
      label: 'Manutenção',
      ativo: isManutencao,
      icon: icon(<path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />),
    },
    {
      href: '/admin/vistorias',
      label: 'Vistorias',
      ativo: isVistorias,
      icon: icon(<path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />),
    },
  ]

  return (
    <nav className="sticky top-0 z-40 bg-slate-900 text-white border-b border-white/10 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-5 min-w-0">
          <Link href="/" className="flex items-center gap-2 shrink-0 group" title="Ver site">
            <span className="font-extrabold text-lg tracking-tight">MIW3</span>
            <span className="hidden md:inline text-[10px] font-medium uppercase tracking-[0.15em] text-slate-500 group-hover:text-slate-300 transition-colors">Admin</span>
          </Link>

          <div className="flex items-center gap-1 overflow-x-auto">
            {itens.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 shrink-0 px-3 py-2 rounded-lg text-sm transition-colors ${
                  item.ativo
                    ? 'bg-white text-slate-900 font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-slate-300 bg-white/5 rounded-full pl-1.5 pr-3 py-1">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center uppercase">
              {userEmail.charAt(0)}
            </span>
            <span className="text-xs max-w-[160px] truncate">{userEmail}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white border border-white/15 hover:border-white/30 rounded-lg px-3 py-1.5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
