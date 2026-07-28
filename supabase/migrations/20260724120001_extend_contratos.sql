-- F0 — Estende contratos (aditivo). indice_reajuste e valor_aluguel já existem
-- e continuam; valor_aluguel passa a ser cache do valor corrente (fonte da
-- verdade = contrato_vigencias_valor).

alter table public.contratos
  add column if not exists modelo_versao_id uuid references public.modelo_contrato_versoes(id),
  add column if not exists valores_variaveis jsonb,
  add column if not exists corpo_gerado jsonb,
  add column if not exists dia_vencimento_primeiro date,
  add column if not exists regime_primeiro_mes text default 'integral'
    check (regime_primeiro_mes in ('pro_rata', 'integral', 'carencia')),
  add column if not exists periodicidade_reajuste_meses integer default 12,
  add column if not exists defasagem_indice_meses integer default 2,
  add column if not exists trava_deflacao boolean default true,
  add column if not exists percentual_minimo_reajuste numeric,
  add column if not exists percentual_maximo_reajuste numeric,
  add column if not exists percentual_fixo_reajuste numeric,
  add column if not exists indice_correcao_mora text default 'igpm',
  add column if not exists multa_mora_percentual numeric default 10,
  add column if not exists juros_mensal_percentual numeric default 1,
  add column if not exists tipo_garantia text default 'nenhuma'
    check (tipo_garantia in ('fiador', 'caucao', 'titulo_capitalizacao', 'seguro_fianca', 'nenhuma')),
  add column if not exists garantia_detalhes jsonb;
