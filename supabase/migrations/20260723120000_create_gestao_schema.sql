-- Módulo de Gestão de Imóveis (interno). Unifica com a tabela "imoveis":
-- um imóvel = uma linha em "imoveis"; dados sigilosos ficam em tabelas
-- companheiras com RLS apenas para authenticated.

-- Flag que marca o imóvel como "sob gestão" (a exibição no site segue usando "publicado").
alter table public.imoveis add column if not exists gerido boolean not null default false;

-- Ficha de gestão (1:1 com o imóvel)
create table public.imovel_gestao (
  imovel_id uuid primary key references public.imoveis(id) on delete cascade,
  matricula text,
  inscricao_municipal text,
  area_construida numeric,
  area_terreno numeric,
  situacao_gestao text not null default 'disponivel'
    check (situacao_gestao in ('disponivel', 'alugado', 'temporada', 'indisponivel')),
  observacoes text,
  atualizado_em timestamptz not null default now()
);

-- Contas/taxas do imóvel, com o responsável pelo pagamento (sem controle financeiro)
create table public.imovel_contas (
  id uuid primary key default gen_random_uuid(),
  imovel_id uuid not null references public.imoveis(id) on delete cascade,
  tipo text not null
    check (tipo in ('iptu', 'agua', 'energia', 'gas', 'internet', 'condominio', 'lixo', 'outros')),
  numero_identificacao text,
  responsavel text not null default 'proprietario'
    check (responsavel in ('proprietario', 'inquilino', 'incluso')),
  observacao text,
  criado_em timestamptz not null default now()
);
create index idx_imovel_contas_imovel on public.imovel_contas (imovel_id);

-- Documentos do imóvel (bucket privado "gestao")
create table public.imovel_documentos (
  id uuid primary key default gen_random_uuid(),
  imovel_id uuid not null references public.imoveis(id) on delete cascade,
  storage_path text not null,
  nome text not null,
  tipo text,
  criado_em timestamptz not null default now()
);
create index idx_imovel_documentos_imovel on public.imovel_documentos (imovel_id);

-- Inquilinos
create table public.inquilinos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo_pessoa text not null default 'fisica' check (tipo_pessoa in ('fisica', 'juridica')),
  cpf_cnpj text,
  rg text,
  telefones text,
  email text,
  endereco text,
  observacoes text,
  criado_em timestamptz not null default now()
);

create table public.inquilino_documentos (
  id uuid primary key default gen_random_uuid(),
  inquilino_id uuid not null references public.inquilinos(id) on delete cascade,
  storage_path text not null,
  nome text not null,
  criado_em timestamptz not null default now()
);
create index idx_inquilino_documentos_inquilino on public.inquilino_documentos (inquilino_id);

-- Contratos (liga imóvel + inquilino). Valores são de referência; pagamentos ficam no ERP.
create table public.contratos (
  id uuid primary key default gen_random_uuid(),
  imovel_id uuid not null references public.imoveis(id) on delete restrict,
  inquilino_id uuid not null references public.inquilinos(id) on delete restrict,
  tipo text not null check (tipo in ('residencial', 'comercial', 'temporada')),
  data_inicio date not null,
  data_fim date,
  valor_aluguel numeric,
  dia_vencimento integer check (dia_vencimento between 1 and 31),
  indice_reajuste text check (indice_reajuste in ('igpm', 'ipca', 'incc', 'outro', 'nenhum')),
  mes_reajuste integer check (mes_reajuste between 1 and 12),
  status text not null default 'ativo' check (status in ('ativo', 'encerrado', 'renovado')),
  observacoes text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index idx_contratos_imovel on public.contratos (imovel_id);
create index idx_contratos_inquilino on public.contratos (inquilino_id);

create table public.contrato_historico (
  id uuid primary key default gen_random_uuid(),
  contrato_id uuid not null references public.contratos(id) on delete cascade,
  tipo_evento text not null
    check (tipo_evento in ('criacao', 'reajuste', 'renovacao', 'alteracao', 'encerramento')),
  descricao text,
  valor_anterior numeric,
  valor_novo numeric,
  data date not null default current_date,
  criado_em timestamptz not null default now()
);
create index idx_contrato_historico_contrato on public.contrato_historico (contrato_id);

create table public.contrato_documentos (
  id uuid primary key default gen_random_uuid(),
  contrato_id uuid not null references public.contratos(id) on delete cascade,
  storage_path text not null,
  nome text not null,
  criado_em timestamptz not null default now()
);
create index idx_contrato_documentos_contrato on public.contrato_documentos (contrato_id);

-- Manutenções / chamados
create table public.manutencoes (
  id uuid primary key default gen_random_uuid(),
  imovel_id uuid not null references public.imoveis(id) on delete cascade,
  contrato_id uuid references public.contratos(id) on delete set null,
  titulo text not null,
  descricao text,
  prestador text,
  solicitante text,
  status text not null default 'aberto'
    check (status in ('aberto', 'em_andamento', 'concluido', 'cancelado')),
  custo_referencia numeric,
  data_abertura date not null default current_date,
  data_conclusao date,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index idx_manutencoes_imovel on public.manutencoes (imovel_id);

create table public.manutencao_fotos (
  id uuid primary key default gen_random_uuid(),
  manutencao_id uuid not null references public.manutencoes(id) on delete cascade,
  storage_path text not null,
  legenda text,
  criado_em timestamptz not null default now()
);
create index idx_manutencao_fotos_manutencao on public.manutencao_fotos (manutencao_id);

-- RLS: todas as tabelas de gestão são internas (só authenticated).
alter table public.imovel_gestao enable row level security;
alter table public.imovel_contas enable row level security;
alter table public.imovel_documentos enable row level security;
alter table public.inquilinos enable row level security;
alter table public.inquilino_documentos enable row level security;
alter table public.contratos enable row level security;
alter table public.contrato_historico enable row level security;
alter table public.contrato_documentos enable row level security;
alter table public.manutencoes enable row level security;
alter table public.manutencao_fotos enable row level security;

create policy "auth_all_imovel_gestao" on public.imovel_gestao for all to authenticated using (true) with check (true);
create policy "auth_all_imovel_contas" on public.imovel_contas for all to authenticated using (true) with check (true);
create policy "auth_all_imovel_documentos" on public.imovel_documentos for all to authenticated using (true) with check (true);
create policy "auth_all_inquilinos" on public.inquilinos for all to authenticated using (true) with check (true);
create policy "auth_all_inquilino_documentos" on public.inquilino_documentos for all to authenticated using (true) with check (true);
create policy "auth_all_contratos" on public.contratos for all to authenticated using (true) with check (true);
create policy "auth_all_contrato_historico" on public.contrato_historico for all to authenticated using (true) with check (true);
create policy "auth_all_contrato_documentos" on public.contrato_documentos for all to authenticated using (true) with check (true);
create policy "auth_all_manutencoes" on public.manutencoes for all to authenticated using (true) with check (true);
create policy "auth_all_manutencao_fotos" on public.manutencao_fotos for all to authenticated using (true) with check (true);
