-- F0 — Vigências de valor: fonte da verdade do aluguel (histórico imutável).

create table public.contrato_vigencias_valor (
  id uuid primary key default gen_random_uuid(),
  contrato_id uuid not null references public.contratos(id) on delete cascade,
  inicio date not null,
  fim date,
  valor_aluguel numeric not null,
  valor_condominio numeric default 0,
  valor_iptu numeric default 0,
  outros_encargos jsonb,
  origem text not null check (origem in ('inicial', 'reajuste', 'aditivo', 'correcao')),
  reajuste_id uuid,
  criado_em timestamptz default now()
);
create index on public.contrato_vigencias_valor (contrato_id, inicio);

alter table public.contrato_vigencias_valor enable row level security;
create policy "auth_all_contrato_vigencias_valor" on public.contrato_vigencias_valor
  for all to authenticated using (true) with check (true);

-- Backfill: exatamente 1 vigência 'inicial' por contrato existente (idempotente).
insert into public.contrato_vigencias_valor (contrato_id, inicio, valor_aluguel, origem)
select c.id, c.data_inicio, c.valor_aluguel, 'inicial'
from public.contratos c
where c.valor_aluguel is not null
  and not exists (
    select 1 from public.contrato_vigencias_valor v
    where v.contrato_id = c.id and v.origem = 'inicial'
  );
