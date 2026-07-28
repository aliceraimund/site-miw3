-- R1 — Tags de sistema (registro global). Alimenta o painel "Tags Disponíveis"
-- e o auto-preenchimento de {chave} no documento.
-- caminho_origem: 'tabela.coluna' | 'const.<chave>' (constantes da MIW3 no código).

create table public.contrato_tags_sistema (
  id uuid primary key default gen_random_uuid(),
  chave text unique not null,
  label text not null,
  grupo text not null,
  caminho_origem text not null,
  ordem integer default 0
);

alter table public.contrato_tags_sistema enable row level security;
create policy "auth_all_contrato_tags_sistema" on public.contrato_tags_sistema
  for all to authenticated using (true) with check (true);

insert into public.contrato_tags_sistema (chave, label, grupo, caminho_origem, ordem) values
  -- Proprietário (constantes MIW3 no código)
  ('proprietario_razao_social',   'Razão social',        'proprietario', 'const.razaoSocial',   1),
  ('proprietario_cnpj',           'CNPJ',                'proprietario', 'const.cnpj',          2),
  ('proprietario_endereco',       'Endereço',            'proprietario', 'const.endereco',      3),
  ('proprietario_cidade',         'Cidade',              'proprietario', 'const.cidade',        4),
  ('proprietario_comarca',        'Comarca',             'proprietario', 'const.comarca',       5),
  ('proprietario_banco',          'Banco',               'proprietario', 'const.banco',         6),
  ('proprietario_agencia',        'Agência',             'proprietario', 'const.agencia',       7),
  ('proprietario_conta',          'Conta',               'proprietario', 'const.conta',         8),
  ('proprietario_favorecido',     'Favorecido',          'proprietario', 'const.favorecido',    9),
  ('proprietario_pix',            'Chave PIX',           'proprietario', 'const.chavePix',     10),

  -- Inquilino (locatário principal; múltiplos vêm de contrato_partes)
  ('inquilino_nome',              'Nome',                'inquilino', 'inquilinos.nome',        1),
  ('inquilino_nomes',             'Nomes (todos)',       'inquilino', 'partes.nomes',           2),
  ('inquilino_tipo_pessoa',       'Tipo de pessoa',      'inquilino', 'inquilinos.tipo_pessoa', 3),
  ('inquilino_cpf_cnpj',          'CPF/CNPJ',            'inquilino', 'inquilinos.cpf_cnpj',    4),
  ('inquilino_rg',                'RG / Inscrição',      'inquilino', 'inquilinos.rg',          5),
  ('inquilino_telefones',         'Telefones',           'inquilino', 'inquilinos.telefones',   6),
  ('inquilino_email',             'E-mail',              'inquilino', 'inquilinos.email',       7),
  ('inquilino_endereco',          'Endereço',            'inquilino', 'inquilinos.endereco',    8),

  -- Imóvel (imoveis + imovel_gestao)
  ('imovel_nome',                 'Nome/identificação',  'imovel', 'imoveis.nome',              1),
  ('imovel_tipo',                 'Tipo',                'imovel', 'imoveis.tipo',              2),
  ('imovel_categoria',            'Categoria',           'imovel', 'imoveis.categoria',         3),
  ('imovel_endereco',             'Endereço completo',   'imovel', 'imoveis.endereco_completo', 4),
  ('imovel_bairro',               'Bairro',              'imovel', 'imoveis.bairro',            5),
  ('imovel_cidade',               'Cidade',              'imovel', 'imoveis.cidade',            6),
  ('imovel_area',                 'Área (m²)',           'imovel', 'imoveis.area_m2',           7),
  ('imovel_quartos',              'Quartos',             'imovel', 'imoveis.quartos',           8),
  ('imovel_suites',               'Suítes',              'imovel', 'imoveis.suites',            9),
  ('imovel_banheiros',            'Banheiros',           'imovel', 'imoveis.banheiros',        10),
  ('imovel_vagas',                'Vagas',               'imovel', 'imoveis.vagas',            11),
  ('imovel_matricula',            'Matrícula',           'imovel', 'imovel_gestao.matricula',  12),
  ('imovel_inscricao_municipal',  'Inscrição municipal', 'imovel', 'imovel_gestao.inscricao_municipal', 13),
  ('imovel_area_construida',      'Área construída',     'imovel', 'imovel_gestao.area_construida', 14),
  ('imovel_area_terreno',         'Área do terreno',     'imovel', 'imovel_gestao.area_terreno', 15),

  -- Contrato
  ('contrato_tipo',               'Tipo',                'contrato', 'contratos.tipo',                     1),
  ('contrato_data_inicio',        'Início da vigência',  'contrato', 'contratos.data_inicio',              2),
  ('contrato_data_fim',           'Fim da vigência',     'contrato', 'contratos.data_fim',                 3),
  ('contrato_valor_aluguel',      'Valor do aluguel',    'contrato', 'contratos.valor_aluguel',            4),
  ('contrato_valor_aluguel_extenso', 'Aluguel por extenso', 'contrato', 'calc.valorAluguelExtenso',        5),
  ('contrato_dia_vencimento',     'Dia de vencimento',   'contrato', 'contratos.dia_vencimento',           6),
  ('contrato_indice_reajuste',    'Índice de reajuste',  'contrato', 'contratos.indice_reajuste',          7),
  ('contrato_mes_reajuste',       'Mês do reajuste',     'contrato', 'contratos.mes_reajuste',             8),
  ('contrato_periodicidade_reajuste', 'Periodicidade do reajuste (meses)', 'contrato', 'contratos.periodicidade_reajuste_meses', 9),
  ('contrato_percentual_minimo',  'Piso de reajuste (%)', 'contrato', 'contratos.percentual_minimo_reajuste', 10),
  ('contrato_multa_mora',         'Multa de mora (%)',   'contrato', 'contratos.multa_mora_percentual',    11),
  ('contrato_juros_mensal',       'Juros mensais (%)',   'contrato', 'contratos.juros_mensal_percentual',  12),
  ('contrato_indice_mora',        'Índice de correção da mora', 'contrato', 'contratos.indice_correcao_mora', 13),
  ('contrato_tipo_garantia',      'Tipo de garantia',    'contrato', 'contratos.tipo_garantia',            14),
  ('contrato_titulo_cobranca',    'Título da cobrança',  'contrato', 'contratos.titulo_cobranca',          15),
  ('contrato_modalidade_cobranca','Modalidade de cobrança', 'contrato', 'contratos.modalidade_cobranca',   16),
  ('contrato_data_hoje',          'Data de hoje (extenso)', 'contrato', 'calc.dataHojeExtenso',            17)
on conflict (chave) do nothing;
