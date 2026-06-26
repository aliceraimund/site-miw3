import Link from 'next/link'

export default function ModeloBrancoPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Modelo em branco</h1>
      <p className="text-slate-500 text-sm mb-6">
        Gere um formulário em branco do checklist para preenchimento manual em papel.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <Link
          href="/admin/vistorias/modelo-branco/residencial"
          target="_blank"
          className="bg-white rounded-xl border border-slate-200 p-6 hover:border-blue-400 hover:shadow-sm transition-all"
        >
          <h2 className="font-semibold text-slate-900 mb-1">Residencial</h2>
          <p className="text-sm text-slate-500">Checklist completo para imóveis residenciais.</p>
        </Link>
        <Link
          href="/admin/vistorias/modelo-branco/comercial"
          target="_blank"
          className="bg-white rounded-xl border border-slate-200 p-6 hover:border-blue-400 hover:shadow-sm transition-all"
        >
          <h2 className="font-semibold text-slate-900 mb-1">Comercial / Industrial</h2>
          <p className="text-sm text-slate-500">Checklist completo para imóveis comerciais ou industriais.</p>
        </Link>
      </div>
    </div>
  )
}
