import Link from 'next/link'
import AdminImovelForm from '@/components/AdminImovelForm'

export default function NovoImovelPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-slate-500 hover:text-slate-700 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Novo imóvel</h1>
      </div>
      <AdminImovelForm />
    </div>
  )
}
