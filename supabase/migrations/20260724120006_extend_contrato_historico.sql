-- F0 — Estende a auditoria existente (contrato_historico) com os novos eventos.
-- Reaproveita a tabela atual; NÃO cria tabela genérica de auditoria.

alter table public.contrato_historico drop constraint if exists contrato_historico_tipo_evento_check;
alter table public.contrato_historico add constraint contrato_historico_tipo_evento_check
  check (tipo_evento in ('criacao', 'reajuste', 'renovacao', 'alteracao', 'encerramento',
                         'reajuste_projetado', 'reajuste_aplicado', 'aditivo', 'documento_gerado'));
