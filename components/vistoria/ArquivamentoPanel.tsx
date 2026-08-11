'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatarBytes } from '@/lib/imagem'
import type { Vistoria } from '@/types/vistoria'

interface Props {
  vistoria: Vistoria
  totalFotos: number
}

const inputClass = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

export default function ArquivamentoPanel({ vistoria, totalFotos }: Props) {
  const router = useRouter()
  const [laudoUrl, setLaudoUrl] = useState(vistoria.laudo_url ?? '')
  const [liberadas, setLiberadas] = useState(vistoria.fotos_liberadas_em)
  const [salvando, setSalvando] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [liberando, setLiberando] = useState(false)
  const [msg, setMsg] = useState('')
  const [erro, setErro] = useState('')

  const salvarLink = async () => {
    setSalvando(true); setMsg(''); setErro('')
    const supabase = createClient()
    const { error } = await supabase
      .from('vistorias')
      .update({ laudo_url: laudoUrl.trim() || null, atualizado_em: new Date().toISOString() })
      .eq('id', vistoria.id)
    setSalvando(false)
    if (error) { setErro(error.message); return }
    setMsg('Link salvo.')
    router.refresh()
  }

  const liberarEspaco = async () => {
    setLiberando(true); setMsg(''); setErro('')
    const supabase = createClient()

    // 1) Todos os caminhos das fotos desta vistoria
    const { data: fotos, error: erroBusca } = await supabase
      .from('vistoria_fotos')
      .select('id, storage_path, vistoria_item_id, vistoria_itens!inner(vistoria_id)')
      .eq('vistoria_itens.vistoria_id', vistoria.id)

    if (erroBusca) { setErro(erroBusca.message); setLiberando(false); return }

    const caminhos = (fotos ?? []).map((f) => (f as { storage_path: string }).storage_path).filter(Boolean)
    if (caminhos.length === 0) {
      setErro('Nenhuma foto encontrada para liberar.')
      setLiberando(false)
      return
    }

    // 2) Remove os arquivos do storage (em lotes, para não estourar a chamada)
    for (let i = 0; i < caminhos.length; i += 50) {
      const { error } = await supabase.storage.from('vistorias').remove(caminhos.slice(i, i + 50))
      if (error) { setErro(`Erro ao remover arquivos: ${error.message}`); setLiberando(false); return }
    }

    // 3) Remove os registros das fotos (os itens e estados PERMANECEM)
    const ids = (fotos ?? []).map((f) => (f as { id: string }).id)
    await supabase.from('vistoria_fotos').delete().in('id', ids)

    // 4) Marca a vistoria como arquivada
    const agora = new Date().toISOString()
    await supabase.from('vistorias').update({ fotos_liberadas_em: agora, atualizado_em: agora }).eq('id', vistoria.id)

    setLiberadas(agora)
    setLiberando(false)
    setConfirmando(false)
    setMsg(`${caminhos.length} foto(s) removidas do armazenamento.`)
    router.refresh()
  }

  const jaLiberada = !!liberadas
  const estimativa = totalFotos * 350_000 // ~350 KB por foto comprimida

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      <div>
        <h2 className="font-semibold text-slate-900 text-base">Arquivamento do laudo</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          O PDF fica guardado no Google Drive. Depois de salvá-lo lá, libere as fotos do armazenamento do site —
          os itens, estados e observações continuam aqui e a comparação entrada × saída segue funcionando.
        </p>
      </div>

      {/* Passo 1 — gerar e guardar */}
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={`/admin/vistorias/${vistoria.id}/laudo`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-50"
        >
          1. Gerar laudo PDF
        </a>
        <span className="text-xs text-slate-400">→ salve no Drive → cole o link abaixo</span>
      </div>

      {/* Passo 2 — link do Drive */}
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs text-slate-500 flex-1 min-w-[240px]">
          2. Link do laudo no Google Drive
          <input
            value={laudoUrl}
            onChange={(e) => setLaudoUrl(e.target.value)}
            placeholder="https://drive.google.com/..."
            className={inputClass}
          />
        </label>
        <button onClick={salvarLink} disabled={salvando} className="text-sm font-semibold text-blue-600 border border-blue-200 rounded-lg px-4 py-2 hover:bg-blue-50 disabled:opacity-50">
          {salvando ? 'Salvando...' : 'Salvar link'}
        </button>
        {vistoria.laudo_url && (
          <a href={vistoria.laudo_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Abrir</a>
        )}
      </div>

      {/* Passo 3 — liberar espaço */}
      <div className="border-t border-slate-100 pt-4">
        {jaLiberada ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Fotos já liberadas do armazenamento em {new Date(liberadas!).toLocaleDateString('pt-BR')}.
            {!vistoria.laudo_url && <span className="text-amber-700"> Atenção: nenhum link do Drive foi salvo.</span>}
          </div>
        ) : totalFotos === 0 ? (
          <p className="text-sm text-slate-400">Esta vistoria não tem fotos armazenadas.</p>
        ) : confirmando ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
            <p className="text-sm text-red-800">
              <strong>Confirmar:</strong> apagar {totalFotos} foto(s) do armazenamento. Isso é <strong>irreversível</strong> —
              certifique-se de que o PDF já está salvo no Drive. Os itens e observações da vistoria não são afetados.
            </p>
            <div className="flex items-center gap-2">
              <button onClick={liberarEspaco} disabled={liberando} className="text-sm font-semibold text-white bg-red-600 rounded-lg px-4 py-2 hover:bg-red-700 disabled:opacity-50">
                {liberando ? 'Liberando...' : 'Sim, apagar as fotos'}
              </button>
              <button onClick={() => setConfirmando(false)} className="text-sm text-slate-600 border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-50">
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setConfirmando(true)}
              disabled={!laudoUrl.trim()}
              title={!laudoUrl.trim() ? 'Salve antes o link do laudo no Drive' : undefined}
              className="text-sm font-semibold text-red-600 border border-red-200 rounded-lg px-4 py-2 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              3. Liberar espaço ({totalFotos} fotos)
            </button>
            <span className="text-xs text-slate-400">libera cerca de {formatarBytes(estimativa)}</span>
          </div>
        )}
      </div>

      {msg && <p className="text-sm text-green-600">{msg}</p>}
      {erro && <p className="text-sm text-red-600">{erro}</p>}
    </div>
  )
}
