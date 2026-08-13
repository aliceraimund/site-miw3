-- Seed dos ambientes padrão e seus itens (residencial e comercial).
-- `padrao` = vem pré-marcado ao criar a vistoria; os demais ficam disponíveis para adicionar.

-- O checklist antigo (organizado por sistema) é desativado, não apagado:
-- vistorias já feitas guardam seus próprios itens e não são afetadas.
update public.vistoria_checklist_templates set ativo = false where ambiente_template_id is null;

insert into public.vistoria_ambiente_templates (tipo_imovel, nome, ordem, padrao) values ('residencial', 'Sala / Ambiente principal', 1, true) on conflict (tipo_imovel, nome) do nothing;
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
values
  ('residencial', 'Sala / Ambiente principal', 'Pintura', 1, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Sala / Ambiente principal')),
  ('residencial', 'Sala / Ambiente principal', 'Paredes', 2, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Sala / Ambiente principal')),
  ('residencial', 'Sala / Ambiente principal', 'Teto', 3, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Sala / Ambiente principal')),
  ('residencial', 'Sala / Ambiente principal', 'Piso', 4, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Sala / Ambiente principal')),
  ('residencial', 'Sala / Ambiente principal', 'Rodapés', 5, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Sala / Ambiente principal')),
  ('residencial', 'Sala / Ambiente principal', 'Portas e batentes', 6, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Sala / Ambiente principal')),
  ('residencial', 'Sala / Ambiente principal', 'Fechaduras/maçanetas', 7, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Sala / Ambiente principal')),
  ('residencial', 'Sala / Ambiente principal', 'Janelas e vidros', 8, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Sala / Ambiente principal')),
  ('residencial', 'Sala / Ambiente principal', 'Tomadas/interruptores', 9, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Sala / Ambiente principal')),
  ('residencial', 'Sala / Ambiente principal', 'Iluminação/luminárias', 10, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Sala / Ambiente principal')),
  ('residencial', 'Sala / Ambiente principal', 'Armários/marcenaria', 11, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Sala / Ambiente principal')),
  ('residencial', 'Sala / Ambiente principal', 'Ar-condicionado', 12, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Sala / Ambiente principal'));

insert into public.vistoria_ambiente_templates (tipo_imovel, nome, ordem, padrao) values ('residencial', 'Cozinha', 2, true) on conflict (tipo_imovel, nome) do nothing;
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
values
  ('residencial', 'Cozinha', 'Pintura', 1, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Cozinha')),
  ('residencial', 'Cozinha', 'Paredes/revestimentos', 2, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Cozinha')),
  ('residencial', 'Cozinha', 'Teto', 3, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Cozinha')),
  ('residencial', 'Cozinha', 'Piso', 4, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Cozinha')),
  ('residencial', 'Cozinha', 'Bancada', 5, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Cozinha')),
  ('residencial', 'Cozinha', 'Cuba', 6, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Cozinha')),
  ('residencial', 'Cozinha', 'Torneira', 7, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Cozinha')),
  ('residencial', 'Cozinha', 'Sifão/hidráulica', 8, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Cozinha')),
  ('residencial', 'Cozinha', 'Armários/gavetas/puxadores', 9, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Cozinha')),
  ('residencial', 'Cozinha', 'Tomadas/interruptores', 10, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Cozinha')),
  ('residencial', 'Cozinha', 'Cooktop/fogão', 11, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Cozinha')),
  ('residencial', 'Cozinha', 'Forno', 12, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Cozinha')),
  ('residencial', 'Cozinha', 'Coifa/exaustor', 13, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Cozinha'));

insert into public.vistoria_ambiente_templates (tipo_imovel, nome, ordem, padrao) values ('residencial', 'Área de serviço / Lavanderia', 3, true) on conflict (tipo_imovel, nome) do nothing;
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
values
  ('residencial', 'Área de serviço / Lavanderia', 'Pintura', 1, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Área de serviço / Lavanderia')),
  ('residencial', 'Área de serviço / Lavanderia', 'Paredes/revestimentos', 2, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Área de serviço / Lavanderia')),
  ('residencial', 'Área de serviço / Lavanderia', 'Teto', 3, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Área de serviço / Lavanderia')),
  ('residencial', 'Área de serviço / Lavanderia', 'Piso', 4, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Área de serviço / Lavanderia')),
  ('residencial', 'Área de serviço / Lavanderia', 'Tanque', 5, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Área de serviço / Lavanderia')),
  ('residencial', 'Área de serviço / Lavanderia', 'Torneira', 6, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Área de serviço / Lavanderia')),
  ('residencial', 'Área de serviço / Lavanderia', 'Ralo', 7, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Área de serviço / Lavanderia')),
  ('residencial', 'Área de serviço / Lavanderia', 'Ponto da máquina', 8, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Área de serviço / Lavanderia')),
  ('residencial', 'Área de serviço / Lavanderia', 'Armários', 9, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Área de serviço / Lavanderia')),
  ('residencial', 'Área de serviço / Lavanderia', 'Aquecedor', 10, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Área de serviço / Lavanderia'));

insert into public.vistoria_ambiente_templates (tipo_imovel, nome, ordem, padrao) values ('residencial', 'Dormitório 1', 4, true) on conflict (tipo_imovel, nome) do nothing;
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
values
  ('residencial', 'Dormitório 1', 'Pintura', 1, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório 1')),
  ('residencial', 'Dormitório 1', 'Paredes', 2, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório 1')),
  ('residencial', 'Dormitório 1', 'Teto', 3, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório 1')),
  ('residencial', 'Dormitório 1', 'Piso', 4, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório 1')),
  ('residencial', 'Dormitório 1', 'Rodapés', 5, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório 1')),
  ('residencial', 'Dormitório 1', 'Porta/fechadura', 6, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório 1')),
  ('residencial', 'Dormitório 1', 'Janela/vidros', 7, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório 1')),
  ('residencial', 'Dormitório 1', 'Tomadas/interruptores', 8, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório 1')),
  ('residencial', 'Dormitório 1', 'Armários', 9, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório 1')),
  ('residencial', 'Dormitório 1', 'Ar-condicionado', 10, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório 1'));

insert into public.vistoria_ambiente_templates (tipo_imovel, nome, ordem, padrao) values ('residencial', 'Dormitório 2', 5, false) on conflict (tipo_imovel, nome) do nothing;
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
values
  ('residencial', 'Dormitório 2', 'Pintura', 1, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório 2')),
  ('residencial', 'Dormitório 2', 'Paredes', 2, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório 2')),
  ('residencial', 'Dormitório 2', 'Teto', 3, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório 2')),
  ('residencial', 'Dormitório 2', 'Piso', 4, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório 2')),
  ('residencial', 'Dormitório 2', 'Rodapés', 5, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório 2')),
  ('residencial', 'Dormitório 2', 'Porta/fechadura', 6, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório 2')),
  ('residencial', 'Dormitório 2', 'Janela/vidros', 7, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório 2')),
  ('residencial', 'Dormitório 2', 'Tomadas/interruptores', 8, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório 2')),
  ('residencial', 'Dormitório 2', 'Armários', 9, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório 2')),
  ('residencial', 'Dormitório 2', 'Ar-condicionado', 10, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório 2'));

insert into public.vistoria_ambiente_templates (tipo_imovel, nome, ordem, padrao) values ('residencial', 'Dormitório 3', 6, false) on conflict (tipo_imovel, nome) do nothing;
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
values
  ('residencial', 'Dormitório 3', 'Pintura', 1, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório 3')),
  ('residencial', 'Dormitório 3', 'Paredes', 2, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório 3')),
  ('residencial', 'Dormitório 3', 'Teto', 3, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório 3')),
  ('residencial', 'Dormitório 3', 'Piso', 4, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório 3')),
  ('residencial', 'Dormitório 3', 'Rodapés', 5, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório 3')),
  ('residencial', 'Dormitório 3', 'Porta/fechadura', 6, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório 3')),
  ('residencial', 'Dormitório 3', 'Janela/vidros', 7, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório 3')),
  ('residencial', 'Dormitório 3', 'Tomadas/interruptores', 8, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório 3')),
  ('residencial', 'Dormitório 3', 'Armários', 9, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório 3')),
  ('residencial', 'Dormitório 3', 'Ar-condicionado', 10, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório 3'));

insert into public.vistoria_ambiente_templates (tipo_imovel, nome, ordem, padrao) values ('residencial', 'Dormitório adicional / Escritório', 7, false) on conflict (tipo_imovel, nome) do nothing;
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
values
  ('residencial', 'Dormitório adicional / Escritório', 'Pintura', 1, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório adicional / Escritório')),
  ('residencial', 'Dormitório adicional / Escritório', 'Paredes', 2, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório adicional / Escritório')),
  ('residencial', 'Dormitório adicional / Escritório', 'Teto', 3, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório adicional / Escritório')),
  ('residencial', 'Dormitório adicional / Escritório', 'Piso', 4, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório adicional / Escritório')),
  ('residencial', 'Dormitório adicional / Escritório', 'Porta/fechadura', 5, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório adicional / Escritório')),
  ('residencial', 'Dormitório adicional / Escritório', 'Janela/vidros', 6, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório adicional / Escritório')),
  ('residencial', 'Dormitório adicional / Escritório', 'Tomadas/interruptores', 7, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório adicional / Escritório')),
  ('residencial', 'Dormitório adicional / Escritório', 'Armários', 8, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório adicional / Escritório')),
  ('residencial', 'Dormitório adicional / Escritório', 'Ar-condicionado', 9, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Dormitório adicional / Escritório'));

insert into public.vistoria_ambiente_templates (tipo_imovel, nome, ordem, padrao) values ('residencial', 'Banheiro 1', 8, true) on conflict (tipo_imovel, nome) do nothing;
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
values
  ('residencial', 'Banheiro 1', 'Pintura/teto', 1, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Banheiro 1')),
  ('residencial', 'Banheiro 1', 'Revestimentos', 2, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Banheiro 1')),
  ('residencial', 'Banheiro 1', 'Piso', 3, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Banheiro 1')),
  ('residencial', 'Banheiro 1', 'Vaso sanitário', 4, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Banheiro 1')),
  ('residencial', 'Banheiro 1', 'Assento sanitário', 5, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Banheiro 1')),
  ('residencial', 'Banheiro 1', 'Descarga', 6, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Banheiro 1')),
  ('residencial', 'Banheiro 1', 'Cuba/bancada', 7, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Banheiro 1')),
  ('residencial', 'Banheiro 1', 'Torneira', 8, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Banheiro 1')),
  ('residencial', 'Banheiro 1', 'Box', 9, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Banheiro 1')),
  ('residencial', 'Banheiro 1', 'Vidros', 10, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Banheiro 1')),
  ('residencial', 'Banheiro 1', 'Chuveiro', 11, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Banheiro 1')),
  ('residencial', 'Banheiro 1', 'Registros', 12, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Banheiro 1')),
  ('residencial', 'Banheiro 1', 'Ralo', 13, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Banheiro 1')),
  ('residencial', 'Banheiro 1', 'Espelho', 14, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Banheiro 1')),
  ('residencial', 'Banheiro 1', 'Armários', 15, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Banheiro 1'));

insert into public.vistoria_ambiente_templates (tipo_imovel, nome, ordem, padrao) values ('residencial', 'Banheiro 2 / Suíte', 9, false) on conflict (tipo_imovel, nome) do nothing;
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
values
  ('residencial', 'Banheiro 2 / Suíte', 'Pintura/teto', 1, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Banheiro 2 / Suíte')),
  ('residencial', 'Banheiro 2 / Suíte', 'Revestimentos', 2, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Banheiro 2 / Suíte')),
  ('residencial', 'Banheiro 2 / Suíte', 'Piso', 3, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Banheiro 2 / Suíte')),
  ('residencial', 'Banheiro 2 / Suíte', 'Vaso sanitário', 4, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Banheiro 2 / Suíte')),
  ('residencial', 'Banheiro 2 / Suíte', 'Assento sanitário', 5, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Banheiro 2 / Suíte')),
  ('residencial', 'Banheiro 2 / Suíte', 'Descarga', 6, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Banheiro 2 / Suíte')),
  ('residencial', 'Banheiro 2 / Suíte', 'Cuba/bancada', 7, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Banheiro 2 / Suíte')),
  ('residencial', 'Banheiro 2 / Suíte', 'Torneira', 8, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Banheiro 2 / Suíte')),
  ('residencial', 'Banheiro 2 / Suíte', 'Box', 9, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Banheiro 2 / Suíte')),
  ('residencial', 'Banheiro 2 / Suíte', 'Vidros', 10, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Banheiro 2 / Suíte')),
  ('residencial', 'Banheiro 2 / Suíte', 'Chuveiro', 11, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Banheiro 2 / Suíte')),
  ('residencial', 'Banheiro 2 / Suíte', 'Registros', 12, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Banheiro 2 / Suíte')),
  ('residencial', 'Banheiro 2 / Suíte', 'Ralo', 13, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Banheiro 2 / Suíte')),
  ('residencial', 'Banheiro 2 / Suíte', 'Espelho', 14, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Banheiro 2 / Suíte')),
  ('residencial', 'Banheiro 2 / Suíte', 'Armários', 15, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Banheiro 2 / Suíte'));

insert into public.vistoria_ambiente_templates (tipo_imovel, nome, ordem, padrao) values ('residencial', 'Lavabo', 10, false) on conflict (tipo_imovel, nome) do nothing;
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
values
  ('residencial', 'Lavabo', 'Pintura', 1, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Lavabo')),
  ('residencial', 'Lavabo', 'Revestimentos', 2, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Lavabo')),
  ('residencial', 'Lavabo', 'Piso', 3, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Lavabo')),
  ('residencial', 'Lavabo', 'Vaso/assento', 4, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Lavabo')),
  ('residencial', 'Lavabo', 'Descarga', 5, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Lavabo')),
  ('residencial', 'Lavabo', 'Cuba/torneira', 6, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Lavabo')),
  ('residencial', 'Lavabo', 'Espelho', 7, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Lavabo')),
  ('residencial', 'Lavabo', 'Iluminação', 8, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Lavabo'));

insert into public.vistoria_ambiente_templates (tipo_imovel, nome, ordem, padrao) values ('residencial', 'Varanda / Sacada', 11, false) on conflict (tipo_imovel, nome) do nothing;
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
values
  ('residencial', 'Varanda / Sacada', 'Pintura', 1, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Varanda / Sacada')),
  ('residencial', 'Varanda / Sacada', 'Paredes/teto', 2, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Varanda / Sacada')),
  ('residencial', 'Varanda / Sacada', 'Piso', 3, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Varanda / Sacada')),
  ('residencial', 'Varanda / Sacada', 'Ralos', 4, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Varanda / Sacada')),
  ('residencial', 'Varanda / Sacada', 'Guarda-corpo', 5, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Varanda / Sacada')),
  ('residencial', 'Varanda / Sacada', 'Envidraçamento', 6, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Varanda / Sacada')),
  ('residencial', 'Varanda / Sacada', 'Vidros/trilhos/travas', 7, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Varanda / Sacada')),
  ('residencial', 'Varanda / Sacada', 'Churrasqueira', 8, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Varanda / Sacada')),
  ('residencial', 'Varanda / Sacada', 'Pia/torneira', 9, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Varanda / Sacada')),
  ('residencial', 'Varanda / Sacada', 'Tomadas/iluminação', 10, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Varanda / Sacada'));

insert into public.vistoria_ambiente_templates (tipo_imovel, nome, ordem, padrao) values ('residencial', 'Outro ambiente', 12, false) on conflict (tipo_imovel, nome) do nothing;
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
values
  ('residencial', 'Outro ambiente', 'Pintura', 1, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Outro ambiente')),
  ('residencial', 'Outro ambiente', 'Paredes', 2, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Outro ambiente')),
  ('residencial', 'Outro ambiente', 'Teto', 3, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Outro ambiente')),
  ('residencial', 'Outro ambiente', 'Piso', 4, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Outro ambiente')),
  ('residencial', 'Outro ambiente', 'Portas', 5, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Outro ambiente')),
  ('residencial', 'Outro ambiente', 'Janelas/vidros', 6, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Outro ambiente')),
  ('residencial', 'Outro ambiente', 'Instalação elétrica', 7, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Outro ambiente'));

insert into public.vistoria_ambiente_templates (tipo_imovel, nome, ordem, padrao) values ('residencial', 'Itens gerais do imóvel', 13, true) on conflict (tipo_imovel, nome) do nothing;
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
values
  ('residencial', 'Itens gerais do imóvel', 'Porta principal', 1, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Itens gerais do imóvel')),
  ('residencial', 'Itens gerais do imóvel', 'Fechaduras', 2, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Itens gerais do imóvel')),
  ('residencial', 'Itens gerais do imóvel', 'Interfone', 3, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Itens gerais do imóvel')),
  ('residencial', 'Itens gerais do imóvel', 'Quadro elétrico', 4, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Itens gerais do imóvel')),
  ('residencial', 'Itens gerais do imóvel', 'Instalações hidráulicas', 5, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Itens gerais do imóvel')),
  ('residencial', 'Itens gerais do imóvel', 'Instalação de gás', 6, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Itens gerais do imóvel')),
  ('residencial', 'Itens gerais do imóvel', 'Aquecedor', 7, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Itens gerais do imóvel')),
  ('residencial', 'Itens gerais do imóvel', 'Ar-condicionado', 8, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Itens gerais do imóvel')),
  ('residencial', 'Itens gerais do imóvel', 'Envidraçamento', 9, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Itens gerais do imóvel')),
  ('residencial', 'Itens gerais do imóvel', 'Limpeza geral', 10, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Itens gerais do imóvel')),
  ('residencial', 'Itens gerais do imóvel', 'Pintura geral', 11, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='residencial' and nome='Itens gerais do imóvel'));

insert into public.vistoria_ambiente_templates (tipo_imovel, nome, ordem, padrao) values ('comercial', 'Recepção / Entrada', 1, true) on conflict (tipo_imovel, nome) do nothing;
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
values
  ('comercial', 'Recepção / Entrada', 'Pintura', 1, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Recepção / Entrada')),
  ('comercial', 'Recepção / Entrada', 'Paredes', 2, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Recepção / Entrada')),
  ('comercial', 'Recepção / Entrada', 'Teto/forro', 3, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Recepção / Entrada')),
  ('comercial', 'Recepção / Entrada', 'Piso', 4, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Recepção / Entrada')),
  ('comercial', 'Recepção / Entrada', 'Rodapés', 5, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Recepção / Entrada')),
  ('comercial', 'Recepção / Entrada', 'Porta principal', 6, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Recepção / Entrada')),
  ('comercial', 'Recepção / Entrada', 'Fechaduras', 7, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Recepção / Entrada')),
  ('comercial', 'Recepção / Entrada', 'Vidros/fachada', 8, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Recepção / Entrada')),
  ('comercial', 'Recepção / Entrada', 'Tomadas/interruptores', 9, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Recepção / Entrada')),
  ('comercial', 'Recepção / Entrada', 'Iluminação', 10, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Recepção / Entrada')),
  ('comercial', 'Recepção / Entrada', 'Ar-condicionado', 11, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Recepção / Entrada'));

insert into public.vistoria_ambiente_templates (tipo_imovel, nome, ordem, padrao) values ('comercial', 'Sala 1', 2, true) on conflict (tipo_imovel, nome) do nothing;
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
values
  ('comercial', 'Sala 1', 'Pintura', 1, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 1')),
  ('comercial', 'Sala 1', 'Paredes', 2, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 1')),
  ('comercial', 'Sala 1', 'Teto/forro', 3, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 1')),
  ('comercial', 'Sala 1', 'Piso', 4, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 1')),
  ('comercial', 'Sala 1', 'Rodapés', 5, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 1')),
  ('comercial', 'Sala 1', 'Porta/fechadura', 6, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 1')),
  ('comercial', 'Sala 1', 'Janelas/vidros', 7, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 1')),
  ('comercial', 'Sala 1', 'Tomadas/interruptores', 8, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 1')),
  ('comercial', 'Sala 1', 'Iluminação', 9, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 1')),
  ('comercial', 'Sala 1', 'Ar-condicionado', 10, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 1')),
  ('comercial', 'Sala 1', 'Cabeamento de rede', 11, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 1'));

insert into public.vistoria_ambiente_templates (tipo_imovel, nome, ordem, padrao) values ('comercial', 'Copa / Cozinha', 3, true) on conflict (tipo_imovel, nome) do nothing;
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
values
  ('comercial', 'Copa / Cozinha', 'Pintura', 1, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Copa / Cozinha')),
  ('comercial', 'Copa / Cozinha', 'Paredes/revestimentos', 2, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Copa / Cozinha')),
  ('comercial', 'Copa / Cozinha', 'Teto', 3, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Copa / Cozinha')),
  ('comercial', 'Copa / Cozinha', 'Piso', 4, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Copa / Cozinha')),
  ('comercial', 'Copa / Cozinha', 'Bancada', 5, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Copa / Cozinha')),
  ('comercial', 'Copa / Cozinha', 'Cuba', 6, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Copa / Cozinha')),
  ('comercial', 'Copa / Cozinha', 'Torneira', 7, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Copa / Cozinha')),
  ('comercial', 'Copa / Cozinha', 'Sifão/hidráulica', 8, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Copa / Cozinha')),
  ('comercial', 'Copa / Cozinha', 'Armários', 9, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Copa / Cozinha')),
  ('comercial', 'Copa / Cozinha', 'Tomadas/interruptores', 10, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Copa / Cozinha'));

insert into public.vistoria_ambiente_templates (tipo_imovel, nome, ordem, padrao) values ('comercial', 'Banheiro 1', 4, true) on conflict (tipo_imovel, nome) do nothing;
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
values
  ('comercial', 'Banheiro 1', 'Pintura/teto', 1, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Banheiro 1')),
  ('comercial', 'Banheiro 1', 'Revestimentos', 2, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Banheiro 1')),
  ('comercial', 'Banheiro 1', 'Piso', 3, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Banheiro 1')),
  ('comercial', 'Banheiro 1', 'Vaso sanitário', 4, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Banheiro 1')),
  ('comercial', 'Banheiro 1', 'Assento sanitário', 5, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Banheiro 1')),
  ('comercial', 'Banheiro 1', 'Descarga', 6, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Banheiro 1')),
  ('comercial', 'Banheiro 1', 'Cuba/bancada', 7, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Banheiro 1')),
  ('comercial', 'Banheiro 1', 'Torneira', 8, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Banheiro 1')),
  ('comercial', 'Banheiro 1', 'Registros', 9, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Banheiro 1')),
  ('comercial', 'Banheiro 1', 'Ralo', 10, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Banheiro 1')),
  ('comercial', 'Banheiro 1', 'Espelho', 11, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Banheiro 1')),
  ('comercial', 'Banheiro 1', 'Acessórios', 12, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Banheiro 1'));

insert into public.vistoria_ambiente_templates (tipo_imovel, nome, ordem, padrao) values ('comercial', 'Itens gerais do imóvel', 5, true) on conflict (tipo_imovel, nome) do nothing;
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
values
  ('comercial', 'Itens gerais do imóvel', 'Porta principal', 1, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Itens gerais do imóvel')),
  ('comercial', 'Itens gerais do imóvel', 'Fechaduras', 2, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Itens gerais do imóvel')),
  ('comercial', 'Itens gerais do imóvel', 'Interfone', 3, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Itens gerais do imóvel')),
  ('comercial', 'Itens gerais do imóvel', 'Quadro elétrico', 4, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Itens gerais do imóvel')),
  ('comercial', 'Itens gerais do imóvel', 'Instalações hidráulicas', 5, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Itens gerais do imóvel')),
  ('comercial', 'Itens gerais do imóvel', 'Instalação de gás', 6, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Itens gerais do imóvel')),
  ('comercial', 'Itens gerais do imóvel', 'Ar-condicionado (central)', 7, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Itens gerais do imóvel')),
  ('comercial', 'Itens gerais do imóvel', 'Sistema de incêndio / extintores', 8, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Itens gerais do imóvel')),
  ('comercial', 'Itens gerais do imóvel', 'Sinalização de emergência', 9, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Itens gerais do imóvel')),
  ('comercial', 'Itens gerais do imóvel', 'Limpeza geral', 10, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Itens gerais do imóvel')),
  ('comercial', 'Itens gerais do imóvel', 'Pintura geral', 11, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Itens gerais do imóvel'));

insert into public.vistoria_ambiente_templates (tipo_imovel, nome, ordem, padrao) values ('comercial', 'Sala 2', 6, false) on conflict (tipo_imovel, nome) do nothing;
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
values
  ('comercial', 'Sala 2', 'Pintura', 1, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 2')),
  ('comercial', 'Sala 2', 'Paredes', 2, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 2')),
  ('comercial', 'Sala 2', 'Teto/forro', 3, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 2')),
  ('comercial', 'Sala 2', 'Piso', 4, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 2')),
  ('comercial', 'Sala 2', 'Rodapés', 5, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 2')),
  ('comercial', 'Sala 2', 'Porta/fechadura', 6, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 2')),
  ('comercial', 'Sala 2', 'Janelas/vidros', 7, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 2')),
  ('comercial', 'Sala 2', 'Tomadas/interruptores', 8, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 2')),
  ('comercial', 'Sala 2', 'Iluminação', 9, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 2')),
  ('comercial', 'Sala 2', 'Ar-condicionado', 10, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 2')),
  ('comercial', 'Sala 2', 'Cabeamento de rede', 11, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 2'));

insert into public.vistoria_ambiente_templates (tipo_imovel, nome, ordem, padrao) values ('comercial', 'Sala 3', 7, false) on conflict (tipo_imovel, nome) do nothing;
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
values
  ('comercial', 'Sala 3', 'Pintura', 1, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 3')),
  ('comercial', 'Sala 3', 'Paredes', 2, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 3')),
  ('comercial', 'Sala 3', 'Teto/forro', 3, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 3')),
  ('comercial', 'Sala 3', 'Piso', 4, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 3')),
  ('comercial', 'Sala 3', 'Rodapés', 5, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 3')),
  ('comercial', 'Sala 3', 'Porta/fechadura', 6, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 3')),
  ('comercial', 'Sala 3', 'Janelas/vidros', 7, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 3')),
  ('comercial', 'Sala 3', 'Tomadas/interruptores', 8, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 3')),
  ('comercial', 'Sala 3', 'Iluminação', 9, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 3')),
  ('comercial', 'Sala 3', 'Ar-condicionado', 10, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 3')),
  ('comercial', 'Sala 3', 'Cabeamento de rede', 11, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala 3'));

insert into public.vistoria_ambiente_templates (tipo_imovel, nome, ordem, padrao) values ('comercial', 'Sala de reunião', 8, false) on conflict (tipo_imovel, nome) do nothing;
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
values
  ('comercial', 'Sala de reunião', 'Pintura', 1, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala de reunião')),
  ('comercial', 'Sala de reunião', 'Paredes', 2, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala de reunião')),
  ('comercial', 'Sala de reunião', 'Teto/forro', 3, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala de reunião')),
  ('comercial', 'Sala de reunião', 'Piso', 4, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala de reunião')),
  ('comercial', 'Sala de reunião', 'Rodapés', 5, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala de reunião')),
  ('comercial', 'Sala de reunião', 'Porta/fechadura', 6, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala de reunião')),
  ('comercial', 'Sala de reunião', 'Janelas/vidros', 7, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala de reunião')),
  ('comercial', 'Sala de reunião', 'Tomadas/interruptores', 8, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala de reunião')),
  ('comercial', 'Sala de reunião', 'Iluminação', 9, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala de reunião')),
  ('comercial', 'Sala de reunião', 'Ar-condicionado', 10, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala de reunião')),
  ('comercial', 'Sala de reunião', 'Cabeamento de rede', 11, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Sala de reunião'));

insert into public.vistoria_ambiente_templates (tipo_imovel, nome, ordem, padrao) values ('comercial', 'Banheiro 2', 9, false) on conflict (tipo_imovel, nome) do nothing;
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
values
  ('comercial', 'Banheiro 2', 'Pintura/teto', 1, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Banheiro 2')),
  ('comercial', 'Banheiro 2', 'Revestimentos', 2, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Banheiro 2')),
  ('comercial', 'Banheiro 2', 'Piso', 3, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Banheiro 2')),
  ('comercial', 'Banheiro 2', 'Vaso sanitário', 4, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Banheiro 2')),
  ('comercial', 'Banheiro 2', 'Assento sanitário', 5, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Banheiro 2')),
  ('comercial', 'Banheiro 2', 'Descarga', 6, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Banheiro 2')),
  ('comercial', 'Banheiro 2', 'Cuba/bancada', 7, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Banheiro 2')),
  ('comercial', 'Banheiro 2', 'Torneira', 8, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Banheiro 2')),
  ('comercial', 'Banheiro 2', 'Registros', 9, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Banheiro 2')),
  ('comercial', 'Banheiro 2', 'Ralo', 10, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Banheiro 2')),
  ('comercial', 'Banheiro 2', 'Espelho', 11, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Banheiro 2')),
  ('comercial', 'Banheiro 2', 'Acessórios', 12, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Banheiro 2'));

insert into public.vistoria_ambiente_templates (tipo_imovel, nome, ordem, padrao) values ('comercial', 'Lavabo', 10, false) on conflict (tipo_imovel, nome) do nothing;
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
values
  ('comercial', 'Lavabo', 'Pintura', 1, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Lavabo')),
  ('comercial', 'Lavabo', 'Revestimentos', 2, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Lavabo')),
  ('comercial', 'Lavabo', 'Piso', 3, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Lavabo')),
  ('comercial', 'Lavabo', 'Vaso/assento', 4, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Lavabo')),
  ('comercial', 'Lavabo', 'Descarga', 5, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Lavabo')),
  ('comercial', 'Lavabo', 'Cuba/torneira', 6, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Lavabo')),
  ('comercial', 'Lavabo', 'Espelho', 7, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Lavabo')),
  ('comercial', 'Lavabo', 'Iluminação', 8, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Lavabo'));

insert into public.vistoria_ambiente_templates (tipo_imovel, nome, ordem, padrao) values ('comercial', 'Depósito / Arquivo', 11, false) on conflict (tipo_imovel, nome) do nothing;
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
values
  ('comercial', 'Depósito / Arquivo', 'Pintura', 1, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Depósito / Arquivo')),
  ('comercial', 'Depósito / Arquivo', 'Paredes', 2, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Depósito / Arquivo')),
  ('comercial', 'Depósito / Arquivo', 'Teto', 3, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Depósito / Arquivo')),
  ('comercial', 'Depósito / Arquivo', 'Piso', 4, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Depósito / Arquivo')),
  ('comercial', 'Depósito / Arquivo', 'Porta/fechadura', 5, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Depósito / Arquivo')),
  ('comercial', 'Depósito / Arquivo', 'Prateleiras', 6, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Depósito / Arquivo')),
  ('comercial', 'Depósito / Arquivo', 'Iluminação', 7, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Depósito / Arquivo')),
  ('comercial', 'Depósito / Arquivo', 'Tomadas', 8, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Depósito / Arquivo'));

insert into public.vistoria_ambiente_templates (tipo_imovel, nome, ordem, padrao) values ('comercial', 'Área externa / Sacada', 12, false) on conflict (tipo_imovel, nome) do nothing;
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
values
  ('comercial', 'Área externa / Sacada', 'Pintura', 1, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Área externa / Sacada')),
  ('comercial', 'Área externa / Sacada', 'Paredes/teto', 2, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Área externa / Sacada')),
  ('comercial', 'Área externa / Sacada', 'Piso', 3, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Área externa / Sacada')),
  ('comercial', 'Área externa / Sacada', 'Ralos', 4, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Área externa / Sacada')),
  ('comercial', 'Área externa / Sacada', 'Guarda-corpo', 5, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Área externa / Sacada')),
  ('comercial', 'Área externa / Sacada', 'Vidros/esquadrias', 6, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Área externa / Sacada')),
  ('comercial', 'Área externa / Sacada', 'Iluminação', 7, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Área externa / Sacada'));

insert into public.vistoria_ambiente_templates (tipo_imovel, nome, ordem, padrao) values ('comercial', 'Vestiário', 13, false) on conflict (tipo_imovel, nome) do nothing;
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
values
  ('comercial', 'Vestiário', 'Pintura', 1, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Vestiário')),
  ('comercial', 'Vestiário', 'Revestimentos', 2, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Vestiário')),
  ('comercial', 'Vestiário', 'Piso', 3, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Vestiário')),
  ('comercial', 'Vestiário', 'Armários/lockers', 4, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Vestiário')),
  ('comercial', 'Vestiário', 'Chuveiros', 5, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Vestiário')),
  ('comercial', 'Vestiário', 'Vaso/assento', 6, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Vestiário')),
  ('comercial', 'Vestiário', 'Cuba/torneira', 7, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Vestiário')),
  ('comercial', 'Vestiário', 'Ralo', 8, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Vestiário')),
  ('comercial', 'Vestiário', 'Iluminação', 9, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Vestiário'));

insert into public.vistoria_ambiente_templates (tipo_imovel, nome, ordem, padrao) values ('comercial', 'Galpão / Área produtiva', 14, false) on conflict (tipo_imovel, nome) do nothing;
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
values
  ('comercial', 'Galpão / Área produtiva', 'Estrutura/cobertura', 1, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Galpão / Área produtiva')),
  ('comercial', 'Galpão / Área produtiva', 'Telhado/calhas', 2, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Galpão / Área produtiva')),
  ('comercial', 'Galpão / Área produtiva', 'Piso industrial', 3, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Galpão / Área produtiva')),
  ('comercial', 'Galpão / Área produtiva', 'Paredes', 4, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Galpão / Área produtiva')),
  ('comercial', 'Galpão / Área produtiva', 'Portões', 5, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Galpão / Área produtiva')),
  ('comercial', 'Galpão / Área produtiva', 'Iluminação', 6, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Galpão / Área produtiva')),
  ('comercial', 'Galpão / Área produtiva', 'Quadro elétrico', 7, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Galpão / Área produtiva')),
  ('comercial', 'Galpão / Área produtiva', 'Instalações hidráulicas', 8, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Galpão / Área produtiva')),
  ('comercial', 'Galpão / Área produtiva', 'Ventilação/exaustão', 9, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Galpão / Área produtiva'));

insert into public.vistoria_ambiente_templates (tipo_imovel, nome, ordem, padrao) values ('comercial', 'Mezanino', 15, false) on conflict (tipo_imovel, nome) do nothing;
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
values
  ('comercial', 'Mezanino', 'Estrutura', 1, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Mezanino')),
  ('comercial', 'Mezanino', 'Piso', 2, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Mezanino')),
  ('comercial', 'Mezanino', 'Guarda-corpo', 3, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Mezanino')),
  ('comercial', 'Mezanino', 'Escada/acesso', 4, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Mezanino')),
  ('comercial', 'Mezanino', 'Iluminação', 5, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Mezanino'));

insert into public.vistoria_ambiente_templates (tipo_imovel, nome, ordem, padrao) values ('comercial', 'Doca / Carga e descarga', 16, false) on conflict (tipo_imovel, nome) do nothing;
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
values
  ('comercial', 'Doca / Carga e descarga', 'Piso/rampa', 1, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Doca / Carga e descarga')),
  ('comercial', 'Doca / Carga e descarga', 'Portões/niveladores', 2, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Doca / Carga e descarga')),
  ('comercial', 'Doca / Carga e descarga', 'Proteções/batentes', 3, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Doca / Carga e descarga')),
  ('comercial', 'Doca / Carga e descarga', 'Iluminação', 4, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Doca / Carga e descarga')),
  ('comercial', 'Doca / Carga e descarga', 'Cobertura', 5, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Doca / Carga e descarga'));

insert into public.vistoria_ambiente_templates (tipo_imovel, nome, ordem, padrao) values ('comercial', 'Pátio / Estacionamento', 17, false) on conflict (tipo_imovel, nome) do nothing;
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
values
  ('comercial', 'Pátio / Estacionamento', 'Piso/pavimentação', 1, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Pátio / Estacionamento')),
  ('comercial', 'Pátio / Estacionamento', 'Demarcação de vagas', 2, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Pátio / Estacionamento')),
  ('comercial', 'Pátio / Estacionamento', 'Portão/controle de acesso', 3, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Pátio / Estacionamento')),
  ('comercial', 'Pátio / Estacionamento', 'Iluminação', 4, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Pátio / Estacionamento')),
  ('comercial', 'Pátio / Estacionamento', 'Drenagem', 5, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Pátio / Estacionamento')),
  ('comercial', 'Pátio / Estacionamento', 'Muros/cercas', 6, true, (select id from public.vistoria_ambiente_templates where tipo_imovel='comercial' and nome='Pátio / Estacionamento'));

