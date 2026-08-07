'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import DadosContratoPanel from '@/components/contrato/DadosContratoPanel'
import DocumentoPanel from '@/components/contrato/DocumentoPanel'
import AssinaturasPanel from '@/components/contrato/AssinaturasPanel'
import OutrosValoresPanel from '@/components/contrato/OutrosValoresPanel'
import GarantiasPanel from '@/components/contrato/GarantiasPanel'
import HistoricoPanel from '@/components/contrato/HistoricoPanel'
import AnexosPanel, { type ContratoDocumento } from '@/components/contrato/AnexosPanel'
import { type Contrato, type ContratoHistorico, CONTRATO_STATUS_LABELS, CONTRATO_STATUS_COLORS } from '@/types/contrato'
import type { ContratoTagSistema } from '@/types/contrato-tag'
import type { ContratoOutroValor } from '@/types/contrato-outros-valores'
import { codigoContrato } from '@/lib/contrato/datas'

type AbaTopo = 'dados' | 'outros' | 'garantias' | 'anexos' | 'historicos'
type SubAba = 'geral' | 'valores' | 'documento' | 'assinaturas'

const ABAS: { key: AbaTopo; label: string }[] = [
  { key: 'dados', label: 'Dados do contrato' },
  { key: 'outros', label: 'Outros valores na fatura' },
  { key: 'garantias', label: 'Garantias' },
  { key: 'anexos', label: 'Anexos' },
  { key: 'historicos', label: 'Históricos' },
]

const SUBABAS: { key: SubAba; label: string }[] = [
  { key: 'geral', label: 'Geral' },
  { key: 'valores', label: 'Valores' },
  { key: 'documento', label: 'Documento' },
  { key: 'assinaturas', label: 'Assinaturas' },
]

interface Props {
  contrato: Contrato
  imovelNome: string
  inquilinoNome: string
  tags: ContratoTagSistema[]
  outrosValores: ContratoOutroValor[]
  historico: ContratoHistorico[]
  documentos: ContratoDocumento[]
}

export default function AdminContratoAbas({ contrato, imovelNome, inquilinoNome, tags, outrosValores, historico, documentos }: Props) {
  const router = useRouter()
  const [aba, setAba] = useState<AbaTopo>('dados')
  const [subaba, setSubaba] = useState<SubAba>('geral')
  const [confirmando, setConfirmando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)

  const ehRascunho = contrato.status === 'rascunho'
  const assinados = documentos.filter((d) => d.nome.startsWith('Assinado — '))
  const anexosGerais = documentos.filter((d) => !d.nome.startsWith('Assinado — '))

  const excluir = async () => {
    setExcluindo(true)
    const supabase = createClient()
    const { error } = await supabase.from('contratos').delete().eq('id', contrato.id)
    if (error) { setExcluindo(false); setConfirmando(false); return }
    router.push('/admin/gestao/contratos')
    router.refresh()
  }

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-xs text-slate-500 bg-slate-100 rounded px-2 py-1">{codigoContrato(contrato.id)}</span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CONTRATO_STATUS_COLORS[contrato.status]}`}>
          {CONTRATO_STATUS_LABELS[contrato.status]}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <a href="/admin/gestao/reajustes" className="text-sm text-slate-600 border border-slate-300 rounded-lg px-3 py-1.5 hover:bg-slate-50">
            Ver reajustes
          </a>
          {confirmando ? (
            <div className="flex items-center gap-1">
              <button onClick={excluir} disabled={excluindo} className="text-sm text-white bg-red-600 rounded-lg px-3 py-1.5 hover:bg-red-700 disabled:opacity-50">
                {excluindo ? 'Excluindo...' : 'Confirmar exclusão'}
              </button>
              <button onClick={() => setConfirmando(false)} className="text-sm text-slate-500 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50">Cancelar</button>
            </div>
          ) : (
            <button onClick={() => setConfirmando(true)} className="text-sm text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50">Excluir</button>
          )}
        </div>
      </div>

      {ehRascunho && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
          Este contrato está em <strong>rascunho</strong> — não gera cobranças nem conta como locação ativa.
          Resolva as pendências do documento e torne-o vigente na aba <strong>Assinaturas</strong>.
        </div>
      )}

      {/* Abas de topo */}
      <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
        {ABAS.map((a) => (
          <button
            key={a.key}
            onClick={() => setAba(a.key)}
            className={`shrink-0 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${aba === a.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {aba === 'dados' && (
          <div className="space-y-5">
            <div className="flex gap-1 flex-wrap">
              {SUBABAS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSubaba(s.key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${subaba === s.key ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {(subaba === 'geral' || subaba === 'valores') && (
              <DadosContratoPanel contrato={contrato} aba={subaba} imovelNome={imovelNome} inquilinoNome={inquilinoNome} />
            )}
            {subaba === 'documento' && <DocumentoPanel contrato={contrato} tags={tags} />}
            {subaba === 'assinaturas' && (
              <AssinaturasPanel contrato={contrato} documentos={assinados} chavesTags={tags.map((t) => t.chave)} />
            )}
          </div>
        )}

        {aba === 'outros' && <OutrosValoresPanel contratoId={contrato.id} iniciais={outrosValores} />}
        {aba === 'garantias' && <GarantiasPanel contrato={contrato} />}
        {aba === 'anexos' && (
          <AnexosPanel contratoId={contrato.id} iniciais={anexosGerais} titulo="Anexos" descricao="Documentos complementares do contrato." />
        )}
        {aba === 'historicos' && <HistoricoPanel contratoId={contrato.id} iniciais={historico} />}
      </div>
    </div>
  )
}
