import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import ImageGallery from '@/components/ImageGallery'
import PriceDisplay from '@/components/PriceDisplay'
import { formatArea, STATUS_LABELS, STATUS_COLORS, DISPONIVEL_LABELS, DISPONIVEL_COLORS } from '@/lib/utils'
import type { Imovel } from '@/types/imovel'

export default async function ImovelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data: imovel } = await supabase
    .from('imoveis')
    .select('*')
    .eq('id', id)
    .single()

  if (!imovel) notFound()

  const i = imovel as Imovel

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Voltar para listagem
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <ImageGallery fotos={i.fotos ?? []} nome={i.nome} />

          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[i.status]}`}>
                {STATUS_LABELS[i.status]}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${DISPONIVEL_COLORS[i.disponivel_para]}`}>
                {DISPONIVEL_LABELS[i.disponivel_para]}
              </span>
              {i.destaque && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                  Destaque
                </span>
              )}
            </div>

            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-1">{i.tipo}</p>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{i.nome}</h1>
            <p className="text-slate-500 flex items-start gap-1.5">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {i.endereco_completo} — {i.bairro}, {i.cidade}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
              <p className="text-xs text-slate-500 mb-1">Área</p>
              <p className="font-bold text-slate-900">{formatArea(i.area_m2)}</p>
            </div>
            {i.quartos != null && (
              <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
                <p className="text-xs text-slate-500 mb-1">Quartos</p>
                <p className="font-bold text-slate-900">{i.quartos}</p>
              </div>
            )}
            {i.suites != null && (
              <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
                <p className="text-xs text-slate-500 mb-1">Suítes</p>
                <p className="font-bold text-slate-900">{i.suites}</p>
              </div>
            )}
            {i.banheiros != null && (
              <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
                <p className="text-xs text-slate-500 mb-1">Banheiros</p>
                <p className="font-bold text-slate-900">{i.banheiros}</p>
              </div>
            )}
            {i.vagas != null && (
              <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
                <p className="text-xs text-slate-500 mb-1">Vagas</p>
                <p className="font-bold text-slate-900">{i.vagas}</p>
              </div>
            )}
          </div>

          {i.descricao && (
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h2 className="font-semibold text-slate-900 mb-3">Descrição</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{i.descricao}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-24">
            <h2 className="font-semibold text-slate-900 mb-4 text-lg">Valores</h2>
            <PriceDisplay imovel={i} />
          </div>
        </div>
      </div>
    </div>
  )
}
