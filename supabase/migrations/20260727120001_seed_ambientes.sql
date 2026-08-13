-- Seed dos ambientes padrão e seus itens (residencial e comercial).
-- `padrao` = vem pré-marcado ao criar a vistoria; os demais ficam disponíveis para adicionar.

-- O checklist antigo (por sistema) é DESATIVADO, não apagado: vistorias já
-- feitas guardam seus próprios itens e não são afetadas.
update public.vistoria_checklist_templates set ativo = false where ambiente_template_id is null;

insert into public.vistoria_ambiente_templates (tipo_imovel, nome, ordem, padrao) values
  ('residencial', 'Sala / Ambiente principal', 1, true),
  ('residencial', 'Cozinha', 2, true),
  ('residencial', 'Área de serviço / Lavanderia', 3, true),
  ('residencial', 'Dormitório 1', 4, true),
  ('residencial', 'Dormitório 2', 5, false),
  ('residencial', 'Dormitório 3', 6, false),
  ('residencial', 'Dormitório adicional / Escritório', 7, false),
  ('residencial', 'Banheiro 1', 8, true),
  ('residencial', 'Banheiro 2 / Suíte', 9, false),
  ('residencial', 'Lavabo', 10, false),
  ('residencial', 'Varanda / Sacada', 11, false),
  ('residencial', 'Outro ambiente', 12, false),
  ('residencial', 'Itens gerais do imóvel', 13, true),
  ('comercial', 'Recepção / Entrada', 1, true),
  ('comercial', 'Sala 1', 2, true),
  ('comercial', 'Copa / Cozinha', 3, true),
  ('comercial', 'Banheiro 1', 4, true),
  ('comercial', 'Itens gerais do imóvel', 5, true),
  ('comercial', 'Sala 2', 6, false),
  ('comercial', 'Sala 3', 7, false),
  ('comercial', 'Sala de reunião', 8, false),
  ('comercial', 'Banheiro 2', 9, false),
  ('comercial', 'Lavabo', 10, false),
  ('comercial', 'Depósito / Arquivo', 11, false),
  ('comercial', 'Área externa / Sacada', 12, false),
  ('comercial', 'Vestiário', 13, false),
  ('comercial', 'Galpão / Área produtiva', 14, false),
  ('comercial', 'Mezanino', 15, false),
  ('comercial', 'Doca / Carga e descarga', 16, false),
  ('comercial', 'Pátio / Estacionamento', 17, false)
on conflict (tipo_imovel, nome) do nothing;

-- residencial: Sala / Ambiente principal
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
select t.tipo_imovel, t.nome, i.item, i.ord, true, t.id
from public.vistoria_ambiente_templates t
cross join (values
  ('Pintura', 1),
  ('Paredes', 2),
  ('Teto', 3),
  ('Piso', 4),
  ('Rodapés', 5),
  ('Portas e batentes', 6),
  ('Fechaduras/maçanetas', 7),
  ('Janelas e vidros', 8),
  ('Tomadas/interruptores', 9),
  ('Iluminação/luminárias', 10),
  ('Armários/marcenaria', 11),
  ('Ar-condicionado', 12)
) as i(item, ord)
where t.tipo_imovel = 'residencial' and t.nome in ('Sala / Ambiente principal');

-- residencial: Cozinha
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
select t.tipo_imovel, t.nome, i.item, i.ord, true, t.id
from public.vistoria_ambiente_templates t
cross join (values
  ('Pintura', 1),
  ('Paredes/revestimentos', 2),
  ('Teto', 3),
  ('Piso', 4),
  ('Bancada', 5),
  ('Cuba', 6),
  ('Torneira', 7),
  ('Sifão/hidráulica', 8),
  ('Armários/gavetas/puxadores', 9),
  ('Tomadas/interruptores', 10),
  ('Cooktop/fogão', 11),
  ('Forno', 12),
  ('Coifa/exaustor', 13)
) as i(item, ord)
where t.tipo_imovel = 'residencial' and t.nome in ('Cozinha');

-- residencial: Área de serviço / Lavanderia
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
select t.tipo_imovel, t.nome, i.item, i.ord, true, t.id
from public.vistoria_ambiente_templates t
cross join (values
  ('Pintura', 1),
  ('Paredes/revestimentos', 2),
  ('Teto', 3),
  ('Piso', 4),
  ('Tanque', 5),
  ('Torneira', 6),
  ('Ralo', 7),
  ('Ponto da máquina', 8),
  ('Armários', 9),
  ('Aquecedor', 10)
) as i(item, ord)
where t.tipo_imovel = 'residencial' and t.nome in ('Área de serviço / Lavanderia');

-- residencial: Dormitório 1 / Dormitório 2 / Dormitório 3
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
select t.tipo_imovel, t.nome, i.item, i.ord, true, t.id
from public.vistoria_ambiente_templates t
cross join (values
  ('Pintura', 1),
  ('Paredes', 2),
  ('Teto', 3),
  ('Piso', 4),
  ('Rodapés', 5),
  ('Porta/fechadura', 6),
  ('Janela/vidros', 7),
  ('Tomadas/interruptores', 8),
  ('Armários', 9),
  ('Ar-condicionado', 10)
) as i(item, ord)
where t.tipo_imovel = 'residencial' and t.nome in ('Dormitório 1', 'Dormitório 2', 'Dormitório 3');

-- residencial: Dormitório adicional / Escritório
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
select t.tipo_imovel, t.nome, i.item, i.ord, true, t.id
from public.vistoria_ambiente_templates t
cross join (values
  ('Pintura', 1),
  ('Paredes', 2),
  ('Teto', 3),
  ('Piso', 4),
  ('Porta/fechadura', 5),
  ('Janela/vidros', 6),
  ('Tomadas/interruptores', 7),
  ('Armários', 8),
  ('Ar-condicionado', 9)
) as i(item, ord)
where t.tipo_imovel = 'residencial' and t.nome in ('Dormitório adicional / Escritório');

-- residencial: Banheiro 1 / Banheiro 2 / Suíte
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
select t.tipo_imovel, t.nome, i.item, i.ord, true, t.id
from public.vistoria_ambiente_templates t
cross join (values
  ('Pintura/teto', 1),
  ('Revestimentos', 2),
  ('Piso', 3),
  ('Vaso sanitário', 4),
  ('Assento sanitário', 5),
  ('Descarga', 6),
  ('Cuba/bancada', 7),
  ('Torneira', 8),
  ('Box', 9),
  ('Vidros', 10),
  ('Chuveiro', 11),
  ('Registros', 12),
  ('Ralo', 13),
  ('Espelho', 14),
  ('Armários', 15)
) as i(item, ord)
where t.tipo_imovel = 'residencial' and t.nome in ('Banheiro 1', 'Banheiro 2 / Suíte');

-- residencial: Lavabo
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
select t.tipo_imovel, t.nome, i.item, i.ord, true, t.id
from public.vistoria_ambiente_templates t
cross join (values
  ('Pintura', 1),
  ('Revestimentos', 2),
  ('Piso', 3),
  ('Vaso/assento', 4),
  ('Descarga', 5),
  ('Cuba/torneira', 6),
  ('Espelho', 7),
  ('Iluminação', 8)
) as i(item, ord)
where t.tipo_imovel = 'residencial' and t.nome in ('Lavabo');

-- residencial: Varanda / Sacada
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
select t.tipo_imovel, t.nome, i.item, i.ord, true, t.id
from public.vistoria_ambiente_templates t
cross join (values
  ('Pintura', 1),
  ('Paredes/teto', 2),
  ('Piso', 3),
  ('Ralos', 4),
  ('Guarda-corpo', 5),
  ('Envidraçamento', 6),
  ('Vidros/trilhos/travas', 7),
  ('Churrasqueira', 8),
  ('Pia/torneira', 9),
  ('Tomadas/iluminação', 10)
) as i(item, ord)
where t.tipo_imovel = 'residencial' and t.nome in ('Varanda / Sacada');

-- residencial: Outro ambiente
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
select t.tipo_imovel, t.nome, i.item, i.ord, true, t.id
from public.vistoria_ambiente_templates t
cross join (values
  ('Pintura', 1),
  ('Paredes', 2),
  ('Teto', 3),
  ('Piso', 4),
  ('Portas', 5),
  ('Janelas/vidros', 6),
  ('Instalação elétrica', 7)
) as i(item, ord)
where t.tipo_imovel = 'residencial' and t.nome in ('Outro ambiente');

-- residencial: Itens gerais do imóvel
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
select t.tipo_imovel, t.nome, i.item, i.ord, true, t.id
from public.vistoria_ambiente_templates t
cross join (values
  ('Porta principal', 1),
  ('Fechaduras', 2),
  ('Interfone', 3),
  ('Quadro elétrico', 4),
  ('Instalações hidráulicas', 5),
  ('Instalação de gás', 6),
  ('Aquecedor', 7),
  ('Ar-condicionado', 8),
  ('Envidraçamento', 9),
  ('Limpeza geral', 10),
  ('Pintura geral', 11)
) as i(item, ord)
where t.tipo_imovel = 'residencial' and t.nome in ('Itens gerais do imóvel');

-- comercial: Recepção / Entrada
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
select t.tipo_imovel, t.nome, i.item, i.ord, true, t.id
from public.vistoria_ambiente_templates t
cross join (values
  ('Pintura', 1),
  ('Paredes', 2),
  ('Teto/forro', 3),
  ('Piso', 4),
  ('Rodapés', 5),
  ('Porta principal', 6),
  ('Fechaduras', 7),
  ('Vidros/fachada', 8),
  ('Tomadas/interruptores', 9),
  ('Iluminação', 10),
  ('Ar-condicionado', 11)
) as i(item, ord)
where t.tipo_imovel = 'comercial' and t.nome in ('Recepção / Entrada');

-- comercial: Sala 1 / Sala 2 / Sala 3 / Sala de reunião
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
select t.tipo_imovel, t.nome, i.item, i.ord, true, t.id
from public.vistoria_ambiente_templates t
cross join (values
  ('Pintura', 1),
  ('Paredes', 2),
  ('Teto/forro', 3),
  ('Piso', 4),
  ('Rodapés', 5),
  ('Porta/fechadura', 6),
  ('Janelas/vidros', 7),
  ('Tomadas/interruptores', 8),
  ('Iluminação', 9),
  ('Ar-condicionado', 10),
  ('Cabeamento de rede', 11)
) as i(item, ord)
where t.tipo_imovel = 'comercial' and t.nome in ('Sala 1', 'Sala 2', 'Sala 3', 'Sala de reunião');

-- comercial: Copa / Cozinha
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
select t.tipo_imovel, t.nome, i.item, i.ord, true, t.id
from public.vistoria_ambiente_templates t
cross join (values
  ('Pintura', 1),
  ('Paredes/revestimentos', 2),
  ('Teto', 3),
  ('Piso', 4),
  ('Bancada', 5),
  ('Cuba', 6),
  ('Torneira', 7),
  ('Sifão/hidráulica', 8),
  ('Armários', 9),
  ('Tomadas/interruptores', 10)
) as i(item, ord)
where t.tipo_imovel = 'comercial' and t.nome in ('Copa / Cozinha');

-- comercial: Banheiro 1 / Banheiro 2
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
select t.tipo_imovel, t.nome, i.item, i.ord, true, t.id
from public.vistoria_ambiente_templates t
cross join (values
  ('Pintura/teto', 1),
  ('Revestimentos', 2),
  ('Piso', 3),
  ('Vaso sanitário', 4),
  ('Assento sanitário', 5),
  ('Descarga', 6),
  ('Cuba/bancada', 7),
  ('Torneira', 8),
  ('Registros', 9),
  ('Ralo', 10),
  ('Espelho', 11),
  ('Acessórios', 12)
) as i(item, ord)
where t.tipo_imovel = 'comercial' and t.nome in ('Banheiro 1', 'Banheiro 2');

-- comercial: Lavabo
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
select t.tipo_imovel, t.nome, i.item, i.ord, true, t.id
from public.vistoria_ambiente_templates t
cross join (values
  ('Pintura', 1),
  ('Revestimentos', 2),
  ('Piso', 3),
  ('Vaso/assento', 4),
  ('Descarga', 5),
  ('Cuba/torneira', 6),
  ('Espelho', 7),
  ('Iluminação', 8)
) as i(item, ord)
where t.tipo_imovel = 'comercial' and t.nome in ('Lavabo');

-- comercial: Depósito / Arquivo
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
select t.tipo_imovel, t.nome, i.item, i.ord, true, t.id
from public.vistoria_ambiente_templates t
cross join (values
  ('Pintura', 1),
  ('Paredes', 2),
  ('Teto', 3),
  ('Piso', 4),
  ('Porta/fechadura', 5),
  ('Prateleiras', 6),
  ('Iluminação', 7),
  ('Tomadas', 8)
) as i(item, ord)
where t.tipo_imovel = 'comercial' and t.nome in ('Depósito / Arquivo');

-- comercial: Área externa / Sacada
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
select t.tipo_imovel, t.nome, i.item, i.ord, true, t.id
from public.vistoria_ambiente_templates t
cross join (values
  ('Pintura', 1),
  ('Paredes/teto', 2),
  ('Piso', 3),
  ('Ralos', 4),
  ('Guarda-corpo', 5),
  ('Vidros/esquadrias', 6),
  ('Iluminação', 7)
) as i(item, ord)
where t.tipo_imovel = 'comercial' and t.nome in ('Área externa / Sacada');

-- comercial: Vestiário
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
select t.tipo_imovel, t.nome, i.item, i.ord, true, t.id
from public.vistoria_ambiente_templates t
cross join (values
  ('Pintura', 1),
  ('Revestimentos', 2),
  ('Piso', 3),
  ('Armários/lockers', 4),
  ('Chuveiros', 5),
  ('Vaso/assento', 6),
  ('Cuba/torneira', 7),
  ('Ralo', 8),
  ('Iluminação', 9)
) as i(item, ord)
where t.tipo_imovel = 'comercial' and t.nome in ('Vestiário');

-- comercial: Galpão / Área produtiva
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
select t.tipo_imovel, t.nome, i.item, i.ord, true, t.id
from public.vistoria_ambiente_templates t
cross join (values
  ('Estrutura/cobertura', 1),
  ('Telhado/calhas', 2),
  ('Piso industrial', 3),
  ('Paredes', 4),
  ('Portões', 5),
  ('Iluminação', 6),
  ('Quadro elétrico', 7),
  ('Instalações hidráulicas', 8),
  ('Ventilação/exaustão', 9)
) as i(item, ord)
where t.tipo_imovel = 'comercial' and t.nome in ('Galpão / Área produtiva');

-- comercial: Mezanino
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
select t.tipo_imovel, t.nome, i.item, i.ord, true, t.id
from public.vistoria_ambiente_templates t
cross join (values
  ('Estrutura', 1),
  ('Piso', 2),
  ('Guarda-corpo', 3),
  ('Escada/acesso', 4),
  ('Iluminação', 5)
) as i(item, ord)
where t.tipo_imovel = 'comercial' and t.nome in ('Mezanino');

-- comercial: Doca / Carga e descarga
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
select t.tipo_imovel, t.nome, i.item, i.ord, true, t.id
from public.vistoria_ambiente_templates t
cross join (values
  ('Piso/rampa', 1),
  ('Portões/niveladores', 2),
  ('Proteções/batentes', 3),
  ('Iluminação', 4),
  ('Cobertura', 5)
) as i(item, ord)
where t.tipo_imovel = 'comercial' and t.nome in ('Doca / Carga e descarga');

-- comercial: Pátio / Estacionamento
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
select t.tipo_imovel, t.nome, i.item, i.ord, true, t.id
from public.vistoria_ambiente_templates t
cross join (values
  ('Piso/pavimentação', 1),
  ('Demarcação de vagas', 2),
  ('Portão/controle de acesso', 3),
  ('Iluminação', 4),
  ('Drenagem', 5),
  ('Muros/cercas', 6)
) as i(item, ord)
where t.tipo_imovel = 'comercial' and t.nome in ('Pátio / Estacionamento');

-- comercial: Itens gerais do imóvel
insert into public.vistoria_checklist_templates (tipo_imovel, secao, item, ordem, ativo, ambiente_template_id)
select t.tipo_imovel, t.nome, i.item, i.ord, true, t.id
from public.vistoria_ambiente_templates t
cross join (values
  ('Porta principal', 1),
  ('Fechaduras', 2),
  ('Interfone', 3),
  ('Quadro elétrico', 4),
  ('Instalações hidráulicas', 5),
  ('Instalação de gás', 6),
  ('Ar-condicionado (central)', 7),
  ('Sistema de incêndio / extintores', 8),
  ('Sinalização de emergência', 9),
  ('Limpeza geral', 10),
  ('Pintura geral', 11)
) as i(item, ord)
where t.tipo_imovel = 'comercial' and t.nome in ('Itens gerais do imóvel');

