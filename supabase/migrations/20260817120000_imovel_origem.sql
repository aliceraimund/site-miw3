-- Origem do anúncio: imóvel da carteira própria da MIW3 ou de corretor parceiro.
-- Os anúncios que já existem passam a valer como carteira própria (default).

alter table public.imoveis
  add column if not exists origem text not null default 'propria';

alter table public.imoveis
  drop constraint if exists imoveis_origem_check;

alter table public.imoveis
  add constraint imoveis_origem_check check (origem in ('propria', 'parceiro'));

create index if not exists imoveis_origem_idx on public.imoveis (origem);

comment on column public.imoveis.origem is
  'propria = imóvel da carteira própria da MIW3; parceiro = imóvel de corretor parceiro divulgado no site.';
