import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import AdminContratoWizard from '@/components/AdminContratoWizard'

export default async function ContratoNovoPage() {
  const supabase = await createServerClient()

  const [{ data: versoes }, { data: imoveis }, { data: inquilinos }, { data: tags }] = await Promise.all([
    supabase
      .from('modelo_contrato_versoes')
      .select('*, modelo:modelo_contratos(*)')
      .eq('status', 'publicada')
      .order('versao', { ascending: false }),
    supabase
      .from('imoveis')
      .select('id, nome, tipo, endereco_completo, categoria, bairro, cidade, area_m2, quartos, suites, banheiros, vagas, gestao:imovel_gestao(matricula, inscricao_municipal, area_construida, area_terreno)')
      .order('nome', { ascending: true }),
    supabase
      .from('inquilinos')
      .select('id, nome, tipo_pessoa, cpf_cnpj, rg, email, telefones, endereco')
      .order('nome', { ascending: true }),
    supabase.from('contrato_tags_sistema').select('*').order('grupo').order('ordem'),
  ])

  // Mantém apenas a maior versão publicada por modelo.
  const porModelo = new Map<string, NonNullable<typeof versoes>[number]>()
  for (const v of versoes ?? []) {
    const key = (v as { modelo_id: string }).modelo_id
    const atual = porModelo.get(key)
    if (!atual || (v as { versao: number }).versao > (atual as { versao: number }).versao) porModelo.set(key, v)
  }

  return (
    <div>
      <Link href="/admin/gestao/contratos" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Voltar para contratos
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Gerar contrato</h1>
        <p className="text-slate-500 text-sm mt-0.5">A partir de um modelo publicado</p>
      </div>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <AdminContratoWizard versoes={[...porModelo.values()] as any} imoveis={(imoveis ?? []) as any} inquilinos={(inquilinos ?? []) as any} tags={(tags ?? []) as any} />
    </div>
  )
}
