-- Módulo de Vistorias: tabelas aditivas, não altera a tabela "imoveis" existente.

-- Templates editáveis dos checklists (residencial / comercial)
create table public.vistoria_checklist_templates (
  id uuid primary key default gen_random_uuid(),
  tipo_imovel text not null check (tipo_imovel in ('residencial', 'comercial')),
  secao text not null,
  item text not null,
  ordem integer not null,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  unique (tipo_imovel, secao, item, ordem)
);

create index idx_vistoria_checklist_templates_tipo on public.vistoria_checklist_templates (tipo_imovel, ordem);

-- Registro de imóveis para vistoria, independente dos anúncios públicos (tabela "imoveis")
create table public.imoveis_vistoria (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  endereco text not null,
  tipo text not null check (tipo in ('residencial', 'comercial')),
  criado_em timestamptz not null default now()
);

-- Cabeçalho de cada vistoria (entrada ou saída)
create table public.vistorias (
  id uuid primary key default gen_random_uuid(),
  imovel_id uuid not null references public.imoveis_vistoria(id) on delete restrict,
  tipo_vistoria text not null check (tipo_vistoria in ('entrada', 'saida')),
  data date not null default current_date,
  vistoriador text,
  locatario text,
  medidores jsonb not null default '{}'::jsonb,
  chaves jsonb not null default '[]'::jsonb,
  observacoes text,
  status text not null default 'rascunho' check (status in ('rascunho', 'concluida')),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index idx_vistorias_imovel on public.vistorias (imovel_id);

-- Itens de cada vistoria (snapshot do checklist no momento da criação da vistoria).
-- secao + item + ordem é a chave estável usada na comparação entrada x saída.
create table public.vistoria_itens (
  id uuid primary key default gen_random_uuid(),
  vistoria_id uuid not null references public.vistorias(id) on delete cascade,
  template_item_id uuid references public.vistoria_checklist_templates(id) on delete set null,
  secao text not null,
  item text not null,
  ordem integer not null,
  estado text check (estado in ('bom', 'regular', 'avaria', 'na')),
  observacao text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index idx_vistoria_itens_vistoria on public.vistoria_itens (vistoria_id);
create index idx_vistoria_itens_chave on public.vistoria_itens (vistoria_id, secao, item, ordem);

-- Fotos de cada item
create table public.vistoria_fotos (
  id uuid primary key default gen_random_uuid(),
  vistoria_item_id uuid not null references public.vistoria_itens(id) on delete cascade,
  storage_path text not null,
  legenda text,
  criado_em timestamptz not null default now()
);

create index idx_vistoria_fotos_item on public.vistoria_fotos (vistoria_item_id);

-- RLS: só authenticated, sem acesso anônimo (área interna do admin, diferente de "imoveis" que é público).
alter table public.vistoria_checklist_templates enable row level security;
alter table public.imoveis_vistoria enable row level security;
alter table public.vistorias enable row level security;
alter table public.vistoria_itens enable row level security;
alter table public.vistoria_fotos enable row level security;

create policy "auth_all_vistoria_checklist_templates" on public.vistoria_checklist_templates
  for all to authenticated using (true) with check (true);

create policy "auth_all_imoveis_vistoria" on public.imoveis_vistoria
  for all to authenticated using (true) with check (true);

create policy "auth_all_vistorias" on public.vistorias
  for all to authenticated using (true) with check (true);

create policy "auth_all_vistoria_itens" on public.vistoria_itens
  for all to authenticated using (true) with check (true);

create policy "auth_all_vistoria_fotos" on public.vistoria_fotos
  for all to authenticated using (true) with check (true);
