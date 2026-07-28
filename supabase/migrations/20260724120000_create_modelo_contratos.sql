-- F0 — Modelos de contrato versionados.

create table public.modelo_contratos (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,
  nome text not null,
  categoria text check (categoria in ('residencial', 'comercial', 'industrial')),
  descricao text,
  ativo boolean default true,
  criado_em timestamptz default now()
);

create table public.modelo_contrato_versoes (
  id uuid primary key default gen_random_uuid(),
  modelo_id uuid not null references public.modelo_contratos(id) on delete cascade,
  versao integer not null,
  corpo_blocos jsonb not null,
  changelog text,
  status text default 'rascunho' check (status in ('rascunho', 'publicada', 'arquivada')),
  publicado_em timestamptz,
  criado_em timestamptz default now(),
  unique (modelo_id, versao)
);

create table public.modelo_variaveis (
  id uuid primary key default gen_random_uuid(),
  versao_id uuid not null references public.modelo_contrato_versoes(id) on delete cascade,
  chave text not null,
  label text not null,
  tipo text not null,
  origem text not null,
  caminho_origem text,
  obrigatoria boolean default true,
  valor_padrao text,
  grupo text,
  ordem integer default 0,
  unique (versao_id, chave)
);

alter table public.modelo_contratos enable row level security;
alter table public.modelo_contrato_versoes enable row level security;
alter table public.modelo_variaveis enable row level security;

create policy "auth_all_modelo_contratos" on public.modelo_contratos for all to authenticated using (true) with check (true);
create policy "auth_all_modelo_contrato_versoes" on public.modelo_contrato_versoes for all to authenticated using (true) with check (true);
create policy "auth_all_modelo_variaveis" on public.modelo_variaveis for all to authenticated using (true) with check (true);
