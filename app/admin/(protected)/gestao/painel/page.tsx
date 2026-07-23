import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import GestaoSubNav from '@/components/GestaoSubNav'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface ContratoVencendo {
  id: string
  data_fim: string | null
  imovel: { nome: string } | null
  inquilino: { nome: string } | null
}

interface ChamadoAberto {
  id: string
  titulo: string
  status: string
  imovel: { nome: string } | null
}

function Tile({ label, valor, href, cor }: { label: string; valor: number; href?: string; cor: string }) {
  const conteudo = (
    <div className="bg-white rounded-xl border border-slate-200 p-5 h-full hover:border-slate-300 transition-colors">
      <p className={`text-3xl font-bold ${cor}`}>{valor}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  )
  return href ? <Link href={href}>{conteudo}</Link> : conteudo
}

export default async function PainelPage() {
  const supabase = await createServerClient()

  const hoje = new Date()
  const limite60 = new Date(hoje)
  limite60.setDate(limite60.getDate() + 60)
  const hojeISO = hoje.toISOString().slice(0, 10)
  const limite60ISO = limite60.toISOString().slice(0, 10)

  const [
    geridos,
    fichas,
    inquilinos,
    contratosAtivos,
    vistoriasRascunho,
    contratosVencendo,
    chamadosAbertos,
  ] = await Promise.all([
    supabase.from('imoveis').select('*', { count: 'exact', head: true }).eq('gerido', true),
    supabase.from('imovel_gestao').select('situacao_gestao'),
    supabase.from('inquilinos').select('*', { count: 'exact', head: true }),
    supabase.from('contratos').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
    supabase.from('vistorias').select('*', { count: 'exact', head: true }).eq('status', 'rascunho'),
    supabase
      .from('contratos')
      .select('id, data_fim, imovel:imoveis(nome), inquilino:inquilinos(nome)')
      .eq('status', 'ativo')
      .not('data_fim', 'is', null)
      .gte('data_fim', hojeISO)
      .lte('data_fim', limite60ISO)
      .order('data_fim', { ascending: true }),
    supabase
      .from('manutencoes')
      .select('id, titulo, status, imovel:imoveis(nome)')
      .in('status', ['aberto', 'em_andamento'])
      .order('data_abertura', { ascending: false }),
  ])

  const situacoes = (fichas.data ?? []) as { situacao_gestao: string }[]
  const alugados = situacoes.filter((s) => s.situacao_gestao === 'alugado').length
  const disponiveis = situacoes.filter((s) => s.situacao_gestao === 'disponivel').length

  const vencendo = (contratosVencendo.data ?? []) as unknown as ContratoVencendo[]
  const chamados = (chamadosAbertos.data ?? []) as unknown as ChamadoAberto[]

  return (
    <div>
      <GestaoSubNav />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Painel de gestão</h1>
        <p className="text-slate-500 text-sm mt-0.5">Visão geral do patrimônio (a parte financeira fica no ERP)</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Tile label="Imóveis sob gestão" valor={geridos.count ?? 0} href="/admin/gestao" cor="text-slate-900" />
        <Tile label="Alugados" valor={alugados} cor="text-blue-600" />
        <Tile label="Disponíveis" valor={disponiveis} cor="text-green-600" />
        <Tile label="Inquilinos" valor={inquilinos.count ?? 0} href="/admin/gestao/inquilinos" cor="text-slate-900" />
        <Tile label="Contratos ativos" valor={contratosAtivos.count ?? 0} href="/admin/gestao/contratos" cor="text-slate-900" />
        <Tile label="Contratos vencendo (60 dias)" valor={vencendo.length} cor="text-amber-600" />
        <Tile label="Chamados em aberto" valor={chamados.length} href="/admin/manutencoes" cor="text-amber-600" />
        <Tile label="Vistorias em rascunho" valor={vistoriasRascunho.count ?? 0} href="/admin/vistorias" cor="text-slate-900" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contratos vencendo */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 text-base border-b border-slate-100 pb-3 mb-4">Contratos vencendo (próximos 60 dias)</h2>
          {vencendo.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhum contrato vencendo neste período.</p>
          ) : (
            <ul className="space-y-3">
              {vencendo.map((c) => (
                <li key={c.id}>
                  <Link href={`/admin/gestao/contratos/${c.id}`} className="flex items-center justify-between gap-3 hover:bg-slate-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{c.imovel?.nome ?? 'Imóvel'}</p>
                      <p className="text-xs text-slate-500 truncate">{c.inquilino?.nome ?? '—'}</p>
                    </div>
                    <span className="text-xs font-semibold text-amber-700 shrink-0">{c.data_fim ? formatDate(c.data_fim) : ''}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Chamados em aberto */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 text-base border-b border-slate-100 pb-3 mb-4">Chamados em aberto</h2>
          {chamados.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhum chamado em aberto.</p>
          ) : (
            <ul className="space-y-3">
              {chamados.map((m) => (
                <li key={m.id}>
                  <Link href={`/admin/manutencoes/${m.id}`} className="flex items-center justify-between gap-3 hover:bg-slate-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{m.titulo}</p>
                      <p className="text-xs text-slate-500 truncate">{m.imovel?.nome ?? '—'}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 shrink-0">
                      {m.status === 'em_andamento' ? 'Em andamento' : 'Aberto'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
