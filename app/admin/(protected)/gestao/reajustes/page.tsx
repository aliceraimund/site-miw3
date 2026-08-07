import Link from 'next/link'
import GestaoSubNav from '@/components/GestaoSubNav'

export default function ReajustesPage() {
  return (
    <div>
      <GestaoSubNav />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Reajustes</h1>
        <p className="text-slate-500 text-sm mt-0.5">Fila de reajustes por situação</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <p className="text-slate-500 text-sm">
          O motor de reajuste e a série de índices econômicos ainda não foram implantados.
        </p>
        <p className="text-slate-400 text-xs mt-1">
          Cadastro de índices, projeção, confirmação e aplicação chegam na próxima fase.
        </p>
        <Link href="/admin/gestao/contratos" className="mt-4 inline-block text-blue-600 hover:underline text-sm">
          Voltar para contratos
        </Link>
      </div>
    </div>
  )
}
