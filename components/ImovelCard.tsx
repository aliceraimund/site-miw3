import Link from 'next/link'
import Image from 'next/image'
import { type Imovel } from '@/types/imovel'
import { formatArea, STATUS_LABELS, STATUS_COLORS, DISPONIVEL_LABELS, DISPONIVEL_COLORS } from '@/lib/utils'
import PriceDisplay from './PriceDisplay'

interface Props {
  imovel: Imovel
}

export default function ImovelCard({ imovel }: Props) {
  const mainPhoto = imovel.fotos?.[0]

  return (
    <Link href={`/imovel/${imovel.id}`} className="group block bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all overflow-hidden">
      <div className="relative h-52 bg-slate-100 overflow-hidden">
        {mainPhoto ? (
          <Image
            src={mainPhoto}
            alt={imovel.nome}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[imovel.status]}`}>
            {STATUS_LABELS[imovel.status]}
          </span>
          {imovel.destaque && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Destaque
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DISPONIVEL_COLORS[imovel.disponivel_para]}`}>
            {DISPONIVEL_LABELS[imovel.disponivel_para]}
          </span>
        </div>
      </div>

      <div className="p-4">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">{imovel.tipo}</p>
        <h3 className="font-semibold text-slate-900 text-base leading-snug mb-1 line-clamp-2">{imovel.nome}</h3>
        <p className="text-sm text-slate-500 mb-3 line-clamp-1">{imovel.endereco_completo}</p>

        <div className="flex flex-wrap gap-3 text-sm text-slate-600 mb-4 pb-4 border-b border-slate-100">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            {formatArea(imovel.area_m2)}
          </span>
          {imovel.quartos != null && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {imovel.quartos} {imovel.quartos === 1 ? 'quarto' : 'quartos'}
            </span>
          )}
          {imovel.banheiros != null && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {imovel.banheiros} WC
            </span>
          )}
          {imovel.vagas != null && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {imovel.vagas} {imovel.vagas === 1 ? 'vaga' : 'vagas'}
            </span>
          )}
        </div>

        <PriceDisplay imovel={imovel} compact />
      </div>
    </Link>
  )
}
