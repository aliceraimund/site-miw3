-- Unifica as vistorias com o cadastro de imóveis: vistorias.imovel_id passa a
-- referenciar public.imoveis (em vez do cadastro separado imoveis_vistoria).
-- Seguro porque não há vistorias criadas.

alter table public.vistorias drop constraint if exists vistorias_imovel_id_fkey;

alter table public.vistorias
  add constraint vistorias_imovel_id_fkey
  foreign key (imovel_id) references public.imoveis(id) on delete restrict;

-- A tabela imoveis_vistoria deixa de ser usada pela aplicação. Mantida por
-- enquanto (não é referenciada por nenhuma outra tabela); pode ser removida
-- depois com: drop table public.imoveis_vistoria;
