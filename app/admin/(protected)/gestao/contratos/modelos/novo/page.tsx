import Link from 'next/link'
import AdminModeloForm from '@/components/AdminModeloForm'

export default function ModeloNovoPage() {
  return (
    <div>
      <Link href="/admin/gestao/contratos/modelos" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Voltar para modelos
      </Link>
      <div className="mb-6"><h1 className="text-2xl font-bold text-slate-900">Novo modelo de contrato</h1></div>
      <AdminModeloForm />
    </div>
  )
}
