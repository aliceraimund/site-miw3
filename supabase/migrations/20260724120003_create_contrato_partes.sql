-- F0 — Partes do contrato (múltiplos locatários/fiadores). O locador segue
-- implícito (MIW3), não vira entidade. contratos.inquilino_id continua existindo
-- como locatário principal.

create table public.contrato_partes (
  id uuid primary key default gen_random_uuid(),
  contrato_id uuid not null references public.contratos(id) on delete cascade,
  inquilino_id uuid not null references public.inquilinos(id) on delete restrict,
  papel text not null check (papel in ('locatario', 'fiador')),
  ordem integer default 0,
  unique (contrato_id, inquilino_id, papel)
);

alter table public.contrato_partes enable row level security;
create policy "auth_all_contrato_partes" on public.contrato_partes
  for all to authenticated using (true) with check (true);

-- Backfill: locatário principal atual como parte (idempotente).
insert into public.contrato_partes (contrato_id, inquilino_id, papel, ordem)
select c.id, c.inquilino_id, 'locatario', 0
from public.contratos c
where c.inquilino_id is not null
  and not exists (
    select 1 from public.contrato_partes p
    where p.contrato_id = c.id and p.inquilino_id = c.inquilino_id and p.papel = 'locatario'
  );
