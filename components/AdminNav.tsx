'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  userEmail: string
}

export default function AdminNav({ userEmail }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const isVistorias = pathname?.startsWith('/admin/vistorias')
  const isAnuncios = !isVistorias

  return (
    <nav className="bg-slate-900 text-white px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/" className="font-bold text-lg tracking-tight hover:text-slate-300 transition-colors">
          MIW3
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className={`text-sm transition-colors ${isAnuncios ? 'text-white font-semibold' : 'text-slate-300 hover:text-white'}`}
          >
            Anúncios
          </Link>
          <Link
            href="/admin/vistorias"
            className={`text-sm transition-colors ${isVistorias ? 'text-white font-semibold' : 'text-slate-300 hover:text-white'}`}
          >
            Vistorias
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-slate-400 hidden sm:block">{userEmail}</span>
        <button
          onClick={handleLogout}
          className="text-sm text-slate-300 hover:text-white transition-colors"
        >
          Sair
        </button>
      </div>
    </nav>
  )
}
