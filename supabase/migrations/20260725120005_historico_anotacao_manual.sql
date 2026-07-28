-- R1 — Histórico manual (anotações livres, ex.: decisão de renovação).

alter table public.contrato_historico drop constraint if exists contrato_historico_tipo_evento_check;
alter table public.contrato_historico add constraint contrato_historico_tipo_evento_check
  check (tipo_evento in ('criacao', 'reajuste', 'renovacao', 'alteracao', 'encerramento',
                         'reajuste_projetado', 'reajuste_aplicado', 'aditivo',
                         'documento_gerado', 'anotacao_manual'));
