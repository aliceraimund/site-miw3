-- Arquivamento externo do laudo: o PDF passa a ser guardado no Google Drive
-- e as fotos são liberadas do storage do Supabase depois disso.
-- Os dados da vistoria (itens, estados, observações) continuam no banco —
-- são texto e custam quase nada, e é deles que sai a comparação entrada × saída.

alter table public.vistorias
  add column if not exists laudo_url text,               -- link do PDF no Drive
  add column if not exists fotos_liberadas_em timestamptz; -- quando as fotos foram apagadas
