-- R1 — Campos da aba Valores (estilo Pilota). Aditivos.

alter table public.contratos
  add column if not exists modalidade_cobranca text default 'pre_paga'
    check (modalidade_cobranca in ('pre_paga', 'pos_paga')),
  add column if not exists titulo_cobranca text default 'aluguel'
    check (titulo_cobranca in ('aluguel', 'temporada', 'prestacao_servico', 'mensalidade')),
  add column if not exists renovacao_automatica boolean default true;
