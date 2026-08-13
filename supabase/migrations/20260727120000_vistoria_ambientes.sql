-- Vistoria por AMBIENTE (cômodo), não por sistema.
-- O vistoriador percorre o imóvel cômodo a cômodo; os ambientes de cada
-- vistoria são editáveis (renomear, adicionar, remover).

-- Ambientes padrão por tipo de imóvel. `padrao` = vem pré-marcado na criação;
-- os demais ficam disponíveis para adicionar (ex.: galpão, mezanino, doca).
create table public.vistoria_ambiente_templates (
  id uuid primary key default gen_random_uuid(),
  tipo_imovel text not null check (tipo_imovel in ('residencial', 'comercial')),
  nome text not null,
  ordem integer not null,
  padrao boolean not null default true,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  unique (tipo_imovel, nome)
);
create index idx_vistoria_ambiente_templates_tipo on public.vistoria_ambiente_templates (tipo_imovel, ordem);

-- Liga cada item de checklist ao ambiente a que pertence.
alter table public.vistoria_checklist_templates
  add column if not exists ambiente_template_id uuid references public.vistoria_ambiente_templates(id) on delete cascade;

-- Ambientes DAQUELA vistoria — é o que o vistoriador edita.
create table public.vistoria_ambientes (
  id uuid primary key default gen_random_uuid(),
  vistoria_id uuid not null references public.vistorias(id) on delete cascade,
  nome text not null,
  ordem integer not null default 0,
  observacao text,
  criado_em timestamptz not null default now()
);
create index idx_vistoria_ambientes_vistoria on public.vistoria_ambientes (vistoria_id, ordem);

alter table public.vistoria_itens
  add column if not exists ambiente_id uuid references public.vistoria_ambientes(id) on delete cascade;
create index if not exists idx_vistoria_itens_ambiente on public.vistoria_itens (ambiente_id);

-- Fotos passam a poder pertencer ao AMBIENTE (foto geral do cômodo) ou ao item.
alter table public.vistoria_fotos
  add column if not exists vistoria_ambiente_id uuid references public.vistoria_ambientes(id) on delete cascade;
alter table public.vistoria_fotos alter column vistoria_item_id drop not null;
create index if not exists idx_vistoria_fotos_ambiente on public.vistoria_fotos (vistoria_ambiente_id);

-- Escala de estados do modelo em papel: NOVA / BOA / REGULAR / DANIFICADA / N-Z
alter table public.vistoria_itens drop constraint if exists vistoria_itens_estado_check;
update public.vistoria_itens
set estado = case estado
  when 'bom' then 'boa'
  when 'avaria' then 'danificada'
  when 'na' then 'nz'
  else estado
end
where estado in ('bom', 'avaria', 'na');
alter table public.vistoria_itens add constraint vistoria_itens_estado_check
  check (estado in ('nova', 'boa', 'regular', 'danificada', 'nz'));

alter table public.vistoria_ambiente_templates enable row level security;
alter table public.vistoria_ambientes enable row level security;
create policy "auth_all_vistoria_ambiente_templates" on public.vistoria_ambiente_templates
  for all to authenticated using (true) with check (true);
create policy "auth_all_vistoria_ambientes" on public.vistoria_ambientes
  for all to authenticated using (true) with check (true);
