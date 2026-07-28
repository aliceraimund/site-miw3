-- F0 — Reajustes (máquina de estados) e aditivos do contrato.

create table public.reajustes (
  id uuid primary key default gen_random_uuid(),
  contrato_id uuid not null references public.contratos(id) on delete cascade,
  data_base date not null,
  data_efeito date not null,
  valor_base numeric not null,
  percentual_acumulado numeric,
  percentual_aplicado numeric not null,
  valor_novo numeric not null,
  status text not null default 'projetado'
    check (status in ('pendente_indice', 'projetado', 'confirmado', 'aplicado', 'dispensado')),
  memoria_calculo jsonb not null,
  observacao text,
  aplicado_em timestamptz,
  criado_em timestamptz default now(),
  unique (contrato_id, data_base)
);

create table public.contrato_aditivos (
  id uuid primary key default gen_random_uuid(),
  contrato_id uuid not null references public.contratos(id) on delete cascade,
  numero integer not null,
  tipo text check (tipo in ('reajuste', 'prorrogacao', 'alteracao_partes', 'alteracao_valor', 'rescisao', 'outro')),
  data_efeito date not null,
  corpo_blocos jsonb,
  resumo text,
  criado_em timestamptz default now(),
  unique (contrato_id, numero)
);

alter table public.reajustes enable row level security;
alter table public.contrato_aditivos enable row level security;

create policy "auth_all_reajustes" on public.reajustes for all to authenticated using (true) with check (true);
create policy "auth_all_contrato_aditivos" on public.contrato_aditivos for all to authenticated using (true) with check (true);
