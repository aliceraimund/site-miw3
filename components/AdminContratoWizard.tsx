'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ContratoPreview from '@/components/contrato/ContratoPreview'
import type { ModeloContrato, ModeloContratoVersao, ModeloVariavel } from '@/types/modelo-contrato'
import type { Bloco } from '@/lib/contrato/blocos'
import { renderizarBlocos } from '@/lib/contrato/merge'
import { montarValores, type ImovelParaContrato, type ParteMontagem } from '@/lib/contrato/montar-valores'
import { pendenciasImovel, pendenciasParte } from '@/lib/contrato/cadastro-completo'
import type { ContratoTagSistema } from '@/types/contrato-tag'
import { montarDadosTags, preencherTagsSistema, verificarPendencias } from '@/lib/contrato/tags-sistema'

type VersaoPublicada = ModeloContratoVersao & { modelo: ModeloContrato | null }
type ImovelOpt = ImovelParaContrato & { id: string; nome: string; endereco_completo: string; categoria: string }
type InquilinoOpt = { id: string; nome: string; cpf_cnpj: string | null; rg: string | null; email: string | null; telefones: string | null; endereco: string | null }

interface Props {
  versoes: VersaoPublicada[]
  imoveis: ImovelOpt[]
  inquilinos: InquilinoOpt[]
  tags?: ContratoTagSistema[]
}

const PES_MAP_KEYS = new Set(['nome', 'cpf', 'cnpj', 'rg', 'email', 'telefone', 'endereco'])
const inputClass = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
const PASSOS_BLOCOS = ['Modelo', 'Imóvel', 'Partes', 'Variáveis', 'Preview']
const PASSOS_HTML = ['Modelo', 'Imóvel', 'Partes', 'Dados', 'Preview']

export default function AdminContratoWizard({ versoes, imoveis, inquilinos, tags = [] }: Props) {
  const router = useRouter()
  const [passo, setPasso] = useState(0)
  const [versaoId, setVersaoId] = useState('')
  const [variaveis, setVariaveis] = useState<ModeloVariavel[]>([])
  const [imovelId, setImovelId] = useState('')
  const [locatarioIds, setLocatarioIds] = useState<string[]>([])
  const [fiadorIds, setFiadorIds] = useState<string[]>([])
  const [globalManual, setGlobalManual] = useState<Record<string, string>>({})
  const [parteManual, setParteManual] = useState<Record<string, Record<string, string>>>({})
  const [carregandoVars, setCarregandoVars] = useState(false)
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState('')

  // Dados básicos do contrato (formato HTML — alimentam o registro e as tags)
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [valorAluguel, setValorAluguel] = useState('')
  const [diaVencimento, setDiaVencimento] = useState('')

  const versao = versoes.find((v) => v.id === versaoId) ?? null
  const imovel = imoveis.find((i) => i.id === imovelId) ?? null
  const blocos = (versao?.corpo_blocos?.blocos as Bloco[]) ?? []
  const ehHtml = versao ? versao.formato !== 'blocos' : true
  const PASSOS = ehHtml ? PASSOS_HTML : PASSOS_BLOCOS

  // Documento com as tags de sistema já preenchidas (formato HTML).
  const htmlPreenchido = useMemo(() => {
    if (!ehHtml || !versao?.corpo_html) return ''
    const locatarios = locatarioIds.map((id) => inquilinos.find((i) => i.id === id)).filter(Boolean) as InquilinoOpt[]
    const dados = montarDadosTags(tags, {
      contrato: {
        tipo: (versao.modelo?.categoria ?? 'residencial') === 'residencial' ? 'residencial' : 'comercial',
        data_inicio: dataInicio, data_fim: dataFim,
        valor_aluguel: valorAluguel ? Number(valorAluguel) : null,
        dia_vencimento: diaVencimento ? Number(diaVencimento) : null,
      },
      imovel: imovel as Record<string, unknown> | null,
      imovelGestao: (imovel?.gestao ?? null) as Record<string, unknown> | null,
      inquilino: (locatarios[0] ?? null) as Record<string, unknown> | null,
      locatarios,
    })
    return preencherTagsSistema(versao.corpo_html, dados)
  }, [ehHtml, versao, tags, imovel, locatarioIds, inquilinos, dataInicio, dataFim, valorAluguel, diaVencimento])

  const pendencias = useMemo(
    () => (htmlPreenchido ? verificarPendencias(htmlPreenchido, tags.map((t) => t.chave)) : { preencher: [], desconhecidas: [] }),
    [htmlPreenchido, tags]
  )

  const escolherVersao = async (id: string) => {
    setVersaoId(id)
    setCarregandoVars(true)
    const supabase = createClient()
    const { data } = await supabase.from('modelo_variaveis').select('*').eq('versao_id', id).order('ordem', { ascending: true })
    setVariaveis((data as ModeloVariavel[]) ?? [])
    setCarregandoVars(false)
  }

  // Variáveis manuais globais (CONST/MAN), agrupadas.
  const manuaisGlobais = useMemo(() => variaveis.filter((v) => v.origem === 'CONST' || v.origem === 'MAN'), [variaveis])
  const gruposManuais = useMemo(() => {
    const m = new Map<string, ModeloVariavel[]>()
    for (const v of manuaisGlobais) { const g = v.grupo ?? 'Outros'; if (!m.has(g)) m.set(g, []); m.get(g)!.push(v) }
    return [...m.entries()]
  }, [manuaisGlobais])

  // Sufixos PES sem mapeamento (nacionalidade, estadoCivil, ...) → manual por locatário.
  const sufixosManuaisParte = useMemo(() => {
    return variaveis
      .filter((v) => v.chave.startsWith('locatarios.'))
      .map((v) => ({ suf: v.chave.slice('locatarios.'.length), label: v.label }))
      .filter((s) => !PES_MAP_KEYS.has(s.suf))
  }, [variaveis])

  const montar = () => {
    const locatarios: ParteMontagem[] = locatarioIds
      .map((id) => inquilinos.find((i) => i.id === id))
      .filter(Boolean)
      .map((inq) => ({ inquilino: inq as InquilinoOpt, manual: parteManual[(inq as InquilinoOpt).id] ?? {} }))
    const fiadores: ParteMontagem[] = fiadorIds
      .map((id) => inquilinos.find((i) => i.id === id))
      .filter(Boolean)
      .map((inq) => ({ inquilino: inq as InquilinoOpt, manual: parteManual[(inq as InquilinoOpt).id] ?? {} }))
    return montarValores({ variaveis, imovel, locatarios, fiadores, globalManual })
  }

  const valores = useMemo(() => (versao ? montar() : {}), [versao, imovel, locatarioIds, fiadorIds, globalManual, parteManual, variaveis]) // eslint-disable-line react-hooks/exhaustive-deps

  const gerar = async () => {
    if (!versao || !imovel || locatarioIds.length === 0) {
      setErro('Selecione modelo, imóvel e ao menos um locatário.')
      return
    }
    setGerando(true)
    setErro('')
    const supabase = createClient()

    const categoria = versao.modelo?.categoria ?? 'residencial'
    const tipo = categoria === 'residencial' ? 'residencial' : 'comercial'
    const inicio = (ehHtml ? dataInicio : globalManual['prazo.dataInicio']) || new Date().toISOString().slice(0, 10)

    // Contratos nascem como RASCUNHO — só vão a "vigente" após a verificação pré-voo.
    const payload: Record<string, unknown> = {
      imovel_id: imovel.id,
      inquilino_id: locatarioIds[0],
      tipo,
      data_inicio: inicio,
      status: 'rascunho',
      modelo_versao_id: versao.id,
      data_fim: ehHtml ? dataFim || null : null,
      valor_aluguel: ehHtml && valorAluguel ? Number(valorAluguel) : null,
      dia_vencimento: ehHtml && diaVencimento ? Number(diaVencimento) : null,
      corpo_gerado_html: ehHtml ? htmlPreenchido : null,
      valores_variaveis: ehHtml ? null : valores,
      corpo_gerado: ehHtml ? null : { blocos: renderizarBlocos(blocos, valores) },
    }

    const { data: contrato, error } = await supabase
      .from('contratos')
      .insert(payload)
      .select('id')
      .single()

    if (error || !contrato) {
      setErro(error?.message ?? 'Erro ao gerar o contrato.')
      setGerando(false)
      return
    }

    // Partes (múltiplos locatários/fiadores).
    const partes = [
      ...locatarioIds.map((iid, idx) => ({ contrato_id: contrato.id, inquilino_id: iid, papel: 'locatario', ordem: idx })),
      ...fiadorIds.map((iid, idx) => ({ contrato_id: contrato.id, inquilino_id: iid, papel: 'fiador', ordem: idx })),
    ]
    await supabase.from('contrato_partes').insert(partes)

    await supabase.from('contrato_historico').insert({ contrato_id: contrato.id, tipo_evento: 'documento_gerado', descricao: `Gerado a partir do modelo ${versao.modelo?.codigo ?? ''} v${versao.versao}` })

    // Imóvel entra na gestão. A situação só vira "alugado" quando o contrato
    // passa a vigente (o contrato nasce como rascunho).
    await supabase.from('imoveis').update({ gerido: true }).eq('id', imovel.id)
    await supabase.from('imovel_gestao').upsert({ imovel_id: imovel.id }, { onConflict: 'imovel_id' })

    router.push(`/admin/gestao/contratos/${contrato.id}`)
  }

  const podeAvancar = () => {
    if (passo === 0) return !!versaoId && !carregandoVars
    if (passo === 1) return !!imovelId
    if (passo === 2) return locatarioIds.length > 0
    return true
  }

  if (versoes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-500">
        Nenhum modelo publicado. Publique um modelo em{' '}
        <a href="/admin/gestao/contratos/modelos" className="text-blue-600 hover:underline">Modelos</a> antes de gerar um contrato.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {PASSOS.map((p, i) => (
          <div key={p} className="flex items-center gap-2 shrink-0">
            <span className={`w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center ${i === passo ? 'bg-blue-600 text-white' : i < passo ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>{i + 1}</span>
            <span className={`text-sm ${i === passo ? 'font-semibold text-slate-900' : 'text-slate-400'}`}>{p}</span>
            {i < PASSOS.length - 1 && <span className="text-slate-300">→</span>}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {/* Passo 0 — Modelo */}
        {passo === 0 && (
          <div className="space-y-2">
            <h2 className="font-semibold text-slate-900 text-base mb-3">Escolha o modelo publicado</h2>
            {versoes.map((v) => (
              <label key={v.id} className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer ${versaoId === v.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                <input type="radio" name="versao" checked={versaoId === v.id} onChange={() => escolherVersao(v.id)} />
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 truncate">{v.modelo?.nome ?? 'Modelo'} <span className="text-slate-400 text-xs">v{v.versao}</span></p>
                  <code className="text-xs text-slate-500">{v.modelo?.codigo}</code>
                </div>
              </label>
            ))}
          </div>
        )}

        {/* Passo 1 — Imóvel */}
        {passo === 1 && (
          <div className="space-y-2">
            <h2 className="font-semibold text-slate-900 text-base mb-3">Escolha o imóvel</h2>
            {imoveis.map((im) => {
              const pend = pendenciasImovel(variaveis, im)
              const bloqueado = pend.length > 0
              return (
                <label key={im.id} className={`flex items-start gap-3 border rounded-lg p-3 ${bloqueado ? 'opacity-60 cursor-not-allowed border-slate-200' : imovelId === im.id ? 'border-blue-500 bg-blue-50 cursor-pointer' : 'border-slate-200 hover:bg-slate-50 cursor-pointer'}`}>
                  <input type="radio" name="imovel" disabled={bloqueado} checked={imovelId === im.id} onChange={() => setImovelId(im.id)} className="mt-1" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 truncate">{im.nome}</p>
                    <p className="text-xs text-slate-500 truncate">{im.endereco_completo}</p>
                    {bloqueado && (
                      <p className="text-xs text-amber-700 mt-1"><span className="font-semibold">Cadastro incompleto:</span> {pend.map((p) => p.label).join(', ')}</p>
                    )}
                  </div>
                </label>
              )
            })}
          </div>
        )}

        {/* Passo 2 — Partes */}
        {passo === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-semibold text-slate-900 text-base mb-2">Locatários</h2>
              <div className="space-y-1">
                {inquilinos.map((inq) => {
                  const pend = pendenciasParte(variaveis, inq)
                  const bloqueado = pend.length > 0
                  const checked = locatarioIds.includes(inq.id)
                  return (
                    <label key={inq.id} className={`flex items-start gap-3 border rounded-lg p-2.5 ${bloqueado ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-50'} ${checked ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}>
                      <input type="checkbox" disabled={bloqueado} checked={checked} onChange={(e) => setLocatarioIds((prev) => e.target.checked ? [...prev, inq.id] : prev.filter((x) => x !== inq.id))} className="mt-1" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{inq.nome}</p>
                        {bloqueado && <p className="text-xs text-amber-700">Cadastro incompleto: {pend.map((p) => p.label).join(', ')}</p>}
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-base mb-2">Fiadores <span className="text-slate-400 text-sm font-normal">(opcional)</span></h2>
              <div className="space-y-1">
                {inquilinos.filter((i) => !locatarioIds.includes(i.id)).map((inq) => (
                  <label key={inq.id} className={`flex items-center gap-3 border rounded-lg p-2.5 cursor-pointer hover:bg-slate-50 ${fiadorIds.includes(inq.id) ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}>
                    <input type="checkbox" checked={fiadorIds.includes(inq.id)} onChange={(e) => setFiadorIds((prev) => e.target.checked ? [...prev, inq.id] : prev.filter((x) => x !== inq.id))} />
                    <span className="text-sm text-slate-900 truncate">{inq.nome}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Passo 3 (HTML) — Dados do contrato */}
        {passo === 3 && ehHtml && (
          <div className="space-y-5">
            <h2 className="font-semibold text-slate-900 text-base">Dados do contrato</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <label className="text-xs text-slate-500">
                Início da vigência
                <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className={inputClass} />
              </label>
              <label className="text-xs text-slate-500">
                Fim da vigência
                <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className={inputClass} />
              </label>
              <label className="text-xs text-slate-500">
                Valor do aluguel (R$)
                <input type="number" inputMode="decimal" value={valorAluguel} onChange={(e) => setValorAluguel(e.target.value)} className={inputClass} placeholder="0" />
              </label>
              <label className="text-xs text-slate-500">
                Dia de vencimento
                <input type="number" min={1} max={31} value={diaVencimento} onChange={(e) => setDiaVencimento(e.target.value)} className={inputClass} placeholder="Ex: 10" />
              </label>
            </div>
            <p className="text-xs text-slate-400">
              Estes dados preenchem as tags de contrato no documento. Os demais campos ficam disponíveis na ficha do contrato depois de gerado.
            </p>
          </div>
        )}

        {/* Passo 3 (blocos) — Variáveis */}
        {passo === 3 && !ehHtml && (
          <div className="space-y-5">
            <h2 className="font-semibold text-slate-900 text-base">Preencha as variáveis</h2>
            {sufixosManuaisParte.length > 0 && locatarioIds.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Por locatário</p>
                {locatarioIds.map((id) => {
                  const inq = inquilinos.find((i) => i.id === id)!
                  return (
                    <div key={id} className="mb-3 border border-slate-100 rounded-lg p-3">
                      <p className="text-sm font-medium text-slate-700 mb-2">{inq.nome}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {sufixosManuaisParte.map((s) => (
                          <label key={s.suf} className="text-xs text-slate-500">
                            {s.label}
                            <input value={parteManual[id]?.[s.suf] ?? ''} onChange={(e) => setParteManual((prev) => ({ ...prev, [id]: { ...prev[id], [s.suf]: e.target.value } }))} className={inputClass} />
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {gruposManuais.map(([grupo, lista]) => (
              <div key={grupo}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">{grupo}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {lista.map((v) => (
                    <label key={v.id} className="text-xs text-slate-500">
                      {v.label}{v.obrigatoria && <span className="text-red-500"> *</span>}
                      <input value={globalManual[v.chave] ?? ''} onChange={(e) => setGlobalManual((prev) => ({ ...prev, [v.chave]: e.target.value }))} className={inputClass} placeholder={v.chave} />
                    </label>
                  ))}
                </div>
              </div>
            ))}
            {manuaisGlobais.length === 0 && sufixosManuaisParte.length === 0 && <p className="text-sm text-slate-400">Nenhuma variável manual neste modelo.</p>}
          </div>
        )}

        {/* Passo 4 — Preview */}
        {passo === 4 && (
          <div>
            <h2 className="font-semibold text-slate-900 text-base mb-3">Pré-visualização</h2>
            {ehHtml && pendencias.preencher.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 mb-3">
                <p className="font-semibold mb-1">Campos manuais pendentes ({pendencias.preencher.length}):</p>
                <p className="text-xs">{pendencias.preencher.join('  ·  ')}</p>
                <p className="text-xs mt-1">O contrato será criado como <strong>rascunho</strong>. Edite o documento na ficha do contrato e resolva estes campos antes de torná-lo vigente.</p>
              </div>
            )}
            <div className="border border-slate-200 rounded-lg p-6 max-h-[520px] overflow-y-auto">
              {ehHtml ? (
                <div className="doc-html text-sm text-slate-800 [&_h1]:text-center [&_h1]:font-bold [&_h1]:my-3 [&_h2]:font-bold [&_h2]:my-2 [&_p]:text-justify [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6" dangerouslySetInnerHTML={{ __html: htmlPreenchido }} />
              ) : (
                <ContratoPreview blocos={blocos} valores={valores} />
              )}
            </div>
          </div>
        )}
      </div>

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <div className="flex items-center justify-between">
        <button type="button" onClick={() => (passo === 0 ? router.push('/admin/gestao/contratos') : setPasso(passo - 1))} className="px-5 py-2.5 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">
          {passo === 0 ? 'Cancelar' : 'Voltar'}
        </button>
        {passo < PASSOS.length - 1 ? (
          <button type="button" onClick={() => setPasso(passo + 1)} disabled={!podeAvancar()} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
            Avançar
          </button>
        ) : (
          <button type="button" onClick={gerar} disabled={gerando} className="bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50">
            {gerando ? 'Gerando...' : 'Gerar contrato'}
          </button>
        )}
      </div>
    </div>
  )
}
