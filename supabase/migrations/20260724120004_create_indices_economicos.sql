-- F0 — Índices econômicos (série mensal informada manualmente).

create table public.indices_economicos (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,
  nome text not null,
  fonte text,
  ativo boolean default true
);

create table public.indice_valores_mensais (
  id uuid primary key default gen_random_uuid(),
  indice_id uuid not null references public.indices_economicos(id),
  ano_mes text not null,
  variacao_percentual numeric not null,
  informado_em timestamptz default now(),
  unique (indice_id, ano_mes)
);

alter table public.indices_economicos enable row level security;
alter table public.indice_valores_mensais enable row level security;

create policy "auth_all_indices_economicos" on public.indices_economicos for all to authenticated using (true) with check (true);
create policy "auth_all_indice_valores_mensais" on public.indice_valores_mensais for all to authenticated using (true) with check (true);
