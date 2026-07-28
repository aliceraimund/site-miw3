-- R1 — Documento em HTML (estilo Pilota) em colunas PARALELAS.
-- corpo_blocos (jsonb) e contratos.corpo_gerado (jsonb) permanecem INTACTOS:
-- versões/contratos antigos seguem renderizando pelo caminho legado.

alter table public.modelo_contrato_versoes
  add column if not exists corpo_html text,
  add column if not exists formato text default 'html' check (formato in ('html', 'blocos'));

alter table public.contratos
  add column if not exists corpo_gerado_html text;

-- Backfill: versões que já existem foram escritas no formato de blocos.
update public.modelo_contrato_versoes
set formato = 'blocos'
where corpo_html is null and corpo_blocos is not null;
