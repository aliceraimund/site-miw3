'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Imovel } from '@/types/imovel'
import { SITUACAO_GESTAO_LABELS, SITUACAO_GESTAO_COLORS, type SituacaoGestao } from '@/types/gestao'

type ImovelComGestao = Imovel & { situacao_gestao: SituacaoGestao | null }

interface Props {
  imoveis: ImovelComGestao[]
}

export default function AdminGestaoList({ imoveis: initial }: Props) {
  const router = useRouter()
  const [imoveis, setImoveis] = useState(initial)
  const [busca, setBusca] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const geridos = useMemo(() => imoveis.filter((i) => i.gerido), [imoveis])
  const demais = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return imoveis
      .filter((i) => !i.gerido)
      .filter((i) => !termo || i.nome.toLowerCase().includes(termo) || i.endereco_completo.toLowerCase().includes(termo) || i.cidade.toLowerCase().includes(termo))
  }, [imoveis, busca])

  const ativarGestao = async (id: string) => {
    setTogglingId(id)
    const supabase = createClient()
    const { error } = await supabase.from('imoveis').update({ gerido: true }).eq('id', id)
    if (!error) {
      // Garante a ficha de gestão (1:1) e abre para preenchimento.
      await supabase.from('imovel_gestao').upsert({ imovel_id: id }, { onConflict: 'imovel_id' })
      router.push(`/admin/gestao/${id}`)
    }
    setTogglingId(null)
  }

  const desativarGestao = async (id: string) => {
    setTogglingId(id)
    const supabase = createClient()
    const { error } = await supabase.from('imoveis').update({ gerido: false }).eq('id', id)
    if (!error) {
      setImoveis((prev) => prev.map((i) => (i.id === id ? { ...i, gerido: false } : i)))
    }
    setTogglingId(null)
  }

  return (
    <div className="space-y-8">
      {/* Imóveis sob gestão */}
      <section>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">
          Sob gestão <span className="text-slate-400 font-normal">({geridos.length})</span>
        </h2>
        {geridos.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-500">
            Nenhum imóvel sob gestão ainda. Ative a gestão em um imóvel abaixo.
          </div>
        ) : (
          <div className="space-y-3">
            {geridos.map((imovel) => (
              <div key={imovel.id} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {imovel.situacao_gestao && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SITUACAO_GESTAO_COLORS[imovel.situacao_gestao]}`}>
                        {SITUACAO_GESTAO_LABELS[imovel.situacao_gestao]}
                      </span>
                    )}
                    {!imovel.publicado && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Fora do site</span>
                    )}
                  </div>
                  <p className="font-semibold text-slate-900 truncate">{imovel.nome}</p>
                  <p className="text-sm text-slate-500 truncate">{imovel.tipo} · {imovel.endereco_completo} — {imovel.cidade}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/admin/gestao/${imovel.id}`}
                    className="text-xs text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors font-medium"
                  >
                    Abrir ficha
                  </Link>
                  <Link
                    href={`/admin/imoveis/${imovel.id}/editar`}
                    className="text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors"
                  >
                    Editar anúncio
                  </Link>
                  <button
                    onClick={() => desativarGestao(imovel.id)}
                    disabled={togglingId === imovel.id}
                    className="text-xs text-slate-500 hover:text-red-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Remove o imóvel da gestão (não apaga o anúncio nem os dados)"
                  >
                    {togglingId === imovel.id ? '...' : 'Tirar da gestão'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Demais imóveis (para ativar gestão) */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
          <h2 className="text-sm font-semibold text-slate-700">
            Demais imóveis <span className="text-slate-400 font-normal">({demais.length})</span>
          </h2>
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar imóvel..."
            className="sm:ml-auto w-full sm:w-64 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {demais.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-500">
            Nenhum imóvel encontrado.
          </div>
        ) : (
          <div className="space-y-2">
            {demais.map((imovel) => (
              <div key={imovel.id} className="bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">{imovel.nome}</p>
                  <p className="text-xs text-slate-500 truncate">{imovel.endereco_completo} — {imovel.cidade}</p>
                </div>
                <button
                  onClick={() => ativarGestao(imovel.id)}
                  disabled={togglingId === imovel.id}
                  className="shrink-0 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                >
                  {togglingId === imovel.id ? 'Ativando...' : 'Ativar gestão'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
