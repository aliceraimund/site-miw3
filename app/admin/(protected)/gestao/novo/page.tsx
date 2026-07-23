import Link from 'next/link'
import AdminGestaoNovoForm from '@/components/AdminGestaoNovoForm'

export default function GestaoNovoPage() {
  return (
    <div>
      <Link href="/admin/gestao" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Voltar para a gestão
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Cadastrar imóvel na gestão</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Para imóveis que você administra mas não anuncia (ex: já locados)
        </p>
      </div>

      <AdminGestaoNovoForm />
    </div>
  )
}
