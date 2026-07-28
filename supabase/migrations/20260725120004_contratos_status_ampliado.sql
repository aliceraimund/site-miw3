-- R1 — Status ampliado (rótulos Pilota) mantendo os valores legados.
-- Não dropa valores existentes: 'ativo'/'encerrado'/'renovado' continuam válidos.

alter table public.contratos drop constraint if exists contratos_status_check;
alter table public.contratos add constraint contratos_status_check
  check (status in ('rascunho', 'vigente', 'rescindido', 'ativo', 'encerrado', 'renovado'));
