-- Unifica as vistorias com o cadastro de imóveis: vistorias.imovel_id passa a
-- referenciar public.imoveis (em vez do cadastro separado imoveis_vistoria).

-- Traz para a base unificada os imóveis do cadastro antigo que já possuem
-- vistoria, preservando o mesmo id para manter o vínculo. Entram como geridos
-- e fora do site (publicado = false), prontos para completar na aba Gestão.
insert into public.imoveis (id, nome, tipo, categoria, endereco_completo, bairro, cidade, disponivel_para, area_m2, publicado, gerido)
select iv.id, iv.nome, initcap(iv.tipo), iv.tipo, iv.endereco, '', '', 'locacao', 0, false, true
from public.imoveis_vistoria iv
where iv.id in (select imovel_id from public.vistorias)
  and not exists (select 1 from public.imoveis i where i.id = iv.id);

alter table public.vistorias drop constraint if exists vistorias_imovel_id_fkey;

alter table public.vistorias
  add constraint vistorias_imovel_id_fkey
  foreign key (imovel_id) references public.imoveis(id) on delete restrict;

-- A tabela imoveis_vistoria deixa de ser usada pela aplicação. Mantida por
-- enquanto (não é referenciada por nenhuma outra tabela); pode ser removida
-- depois com: drop table public.imoveis_vistoria;
