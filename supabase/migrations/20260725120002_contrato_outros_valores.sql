-- R1 — Outros valores na fatura (config do contrato).
-- Geração de fatura e pagamento seguem FORA de escopo.

create table public.contrato_outros_valores (
  id uuid primary key default gen_random_uuid(),
  contrato_id uuid not null references public.contratos(id) on delete cascade,
  titulo text not null,
  valor numeric not null,
  qtd_parcelas integer default 0,        -- 0 = recorrente até o fim do contrato
  competencia_inicial text,              -- 'AAAA-MM'
  tipo text not null check (tipo in ('despesa', 'reembolso_positivo', 'reembolso_negativo', 'desconto')),
  descricao text,
  nome_link text,
  url_link text,
  criado_em timestamptz default now()
);
create index idx_contrato_outros_valores_contrato on public.contrato_outros_valores (contrato_id);

alter table public.contrato_outros_valores enable row level security;
create policy "auth_all_contrato_outros_valores" on public.contrato_outros_valores
  for all to authenticated using (true) with check (true);
