// Catálogo inicial de variáveis para um modelo residencial (com título de
// capitalização). Usado para semear modelo_variaveis de uma versão.
// origem: CONST (constante MIW3) | MAN (manual) | IMV (imóvel) | PES (pessoa) | CALC (derivada)

export interface VariavelCatalogo {
  chave: string
  label: string
  tipo: string
  origem: 'CONST' | 'MAN' | 'IMV' | 'PES' | 'CALC'
  caminho_origem?: string
  obrigatoria?: boolean
  grupo: string
}

export const CATALOGO_RESIDENCIAL: VariavelCatalogo[] = [
  // Partes — Locador (constantes MIW3)
  { chave: 'locador.razaoSocial', label: 'Locador — razão social', tipo: 'texto', origem: 'CONST', grupo: 'Partes' },
  { chave: 'locador.cnpj', label: 'Locador — CNPJ', tipo: 'texto', origem: 'CONST', grupo: 'Partes' },
  { chave: 'locador.endereco', label: 'Locador — endereço', tipo: 'texto', origem: 'CONST', grupo: 'Partes' },
  { chave: 'locador.cidade', label: 'Locador — cidade', tipo: 'texto', origem: 'CONST', grupo: 'Partes' },
  { chave: 'locador.comarca', label: 'Locador — comarca', tipo: 'texto', origem: 'CONST', grupo: 'Partes' },
  // Partes — Locatários (lista) e por locatário
  { chave: 'locatarios', label: 'Locatários (lista)', tipo: 'lista', origem: 'PES', grupo: 'Partes' },
  { chave: 'locatarios.nome', label: 'Locatário — nome', tipo: 'texto', origem: 'PES', caminho_origem: 'inquilinos.nome', grupo: 'Partes', obrigatoria: false },
  { chave: 'locatarios.nacionalidade', label: 'Locatário — nacionalidade', tipo: 'texto', origem: 'PES', grupo: 'Partes', obrigatoria: false },
  { chave: 'locatarios.estadoCivil', label: 'Locatário — estado civil', tipo: 'texto', origem: 'PES', grupo: 'Partes', obrigatoria: false },
  { chave: 'locatarios.profissao', label: 'Locatário — profissão', tipo: 'texto', origem: 'PES', grupo: 'Partes', obrigatoria: false },
  { chave: 'locatarios.cpf', label: 'Locatário — CPF', tipo: 'texto', origem: 'PES', caminho_origem: 'inquilinos.cpf_cnpj', grupo: 'Partes', obrigatoria: false },
  { chave: 'locatarios.rg', label: 'Locatário — RG', tipo: 'texto', origem: 'PES', caminho_origem: 'inquilinos.rg', grupo: 'Partes', obrigatoria: false },
  { chave: 'locatarios.email', label: 'Locatário — e-mail', tipo: 'texto', origem: 'PES', caminho_origem: 'inquilinos.email', grupo: 'Partes', obrigatoria: false },
  { chave: 'locatarios.telefone', label: 'Locatário — telefone', tipo: 'texto', origem: 'PES', caminho_origem: 'inquilinos.telefones', grupo: 'Partes', obrigatoria: false },
  { chave: 'locatarios.qtd', label: 'Qtd. de locatários', tipo: 'numero', origem: 'CALC', grupo: 'Partes' },
  { chave: 'fiadores', label: 'Fiadores (lista)', tipo: 'lista', origem: 'PES', grupo: 'Partes', obrigatoria: false },
  { chave: 'testemunhas', label: 'Testemunhas (lista)', tipo: 'lista', origem: 'MAN', grupo: 'Partes', obrigatoria: false },
  { chave: 'qtdTestemunhas', label: 'Qtd. de testemunhas', tipo: 'numero', origem: 'CONST', grupo: 'Partes', obrigatoria: false },

  // Imóvel
  { chave: 'imovel.logradouro', label: 'Imóvel — logradouro', tipo: 'texto', origem: 'IMV', grupo: 'Imóvel' },
  { chave: 'imovel.numero', label: 'Imóvel — número', tipo: 'texto', origem: 'IMV', grupo: 'Imóvel', obrigatoria: false },
  { chave: 'imovel.complemento', label: 'Imóvel — complemento', tipo: 'texto', origem: 'IMV', grupo: 'Imóvel', obrigatoria: false },
  { chave: 'imovel.torre', label: 'Imóvel — torre', tipo: 'texto', origem: 'IMV', grupo: 'Imóvel', obrigatoria: false },
  { chave: 'imovel.nomeTorre', label: 'Imóvel — nome da torre', tipo: 'texto', origem: 'IMV', grupo: 'Imóvel', obrigatoria: false },
  { chave: 'imovel.condominio', label: 'Imóvel — condomínio', tipo: 'texto', origem: 'IMV', grupo: 'Imóvel', obrigatoria: false },
  { chave: 'imovel.bairro', label: 'Imóvel — bairro', tipo: 'texto', origem: 'IMV', grupo: 'Imóvel', obrigatoria: false },
  { chave: 'imovel.cidade', label: 'Imóvel — cidade', tipo: 'texto', origem: 'IMV', grupo: 'Imóvel' },
  { chave: 'imovel.uf', label: 'Imóvel — UF', tipo: 'texto', origem: 'IMV', grupo: 'Imóvel', obrigatoria: false },
  { chave: 'imovel.cep', label: 'Imóvel — CEP', tipo: 'texto', origem: 'IMV', grupo: 'Imóvel', obrigatoria: false },
  { chave: 'imovel.qtdVagas', label: 'Imóvel — qtd. de vagas', tipo: 'numero', origem: 'IMV', caminho_origem: 'imoveis.vagas', grupo: 'Imóvel', obrigatoria: false },
  { chave: 'imovel.identificacaoVagas', label: 'Imóvel — identificação das vagas', tipo: 'texto', origem: 'MAN', grupo: 'Imóvel', obrigatoria: false },
  { chave: 'imovel.matricula', label: 'Imóvel — matrícula', tipo: 'texto', origem: 'IMV', caminho_origem: 'imovel_gestao.matricula', grupo: 'Imóvel', obrigatoria: false },
  { chave: 'imovel.inscricaoIptu', label: 'Imóvel — inscrição IPTU', tipo: 'texto', origem: 'IMV', caminho_origem: 'imovel_gestao.inscricao_municipal', grupo: 'Imóvel', obrigatoria: false },
  { chave: 'imovel.finalidade', label: 'Imóvel — finalidade', tipo: 'texto', origem: 'MAN', grupo: 'Imóvel', obrigatoria: false },
  { chave: 'imovel.temAquecedorAgua', label: 'Flag — aquecedor de água', tipo: 'booleano', origem: 'IMV', grupo: 'Imóvel', obrigatoria: false },
  { chave: 'imovel.temArCondicionado', label: 'Flag — ar-condicionado', tipo: 'booleano', origem: 'IMV', grupo: 'Imóvel', obrigatoria: false },
  { chave: 'imovel.temSacadaEnvidracada', label: 'Flag — sacada envidraçada', tipo: 'booleano', origem: 'IMV', grupo: 'Imóvel', obrigatoria: false },
  { chave: 'imovel.temVaga', label: 'Flag — vaga', tipo: 'booleano', origem: 'IMV', grupo: 'Imóvel', obrigatoria: false },
  { chave: 'imovel.temRegulamentoInterno', label: 'Flag — regulamento interno', tipo: 'booleano', origem: 'IMV', grupo: 'Imóvel', obrigatoria: false },

  // Prazo
  { chave: 'prazo.meses', label: 'Prazo — meses', tipo: 'numero', origem: 'MAN', grupo: 'Prazo' },
  { chave: 'prazo.mesesExtenso', label: 'Prazo — meses por extenso', tipo: 'texto', origem: 'CALC', grupo: 'Prazo', obrigatoria: false },
  { chave: 'prazo.dataInicio', label: 'Prazo — data de início', tipo: 'data', origem: 'MAN', grupo: 'Prazo' },
  { chave: 'prazo.dataFim', label: 'Prazo — data de fim', tipo: 'data', origem: 'CALC', grupo: 'Prazo', obrigatoria: false },
  { chave: 'prazo.diaVencimento', label: 'Prazo — dia de vencimento', tipo: 'numero', origem: 'MAN', grupo: 'Prazo', obrigatoria: false },
  { chave: 'prazo.dataPrimeiroVencimento', label: 'Prazo — 1º vencimento', tipo: 'data', origem: 'MAN', grupo: 'Prazo', obrigatoria: false },
  { chave: 'prazo.prorrogacaoPresumidaDias', label: 'Prazo — prorrogação presumida (dias)', tipo: 'numero', origem: 'CONST', grupo: 'Prazo', obrigatoria: false },

  // Valores / pagamento
  { chave: 'valores.aluguel', label: 'Valor do aluguel', tipo: 'moeda', origem: 'MAN', grupo: 'Valores' },
  { chave: 'valores.aluguelExtenso', label: 'Aluguel por extenso', tipo: 'texto', origem: 'CALC', grupo: 'Valores', obrigatoria: false },
  { chave: 'valores.condominio', label: 'Valor do condomínio', tipo: 'moeda', origem: 'MAN', grupo: 'Valores', obrigatoria: false },
  { chave: 'valores.iptu', label: 'Valor do IPTU', tipo: 'moeda', origem: 'MAN', grupo: 'Valores', obrigatoria: false },
  { chave: 'valores.responsavelCondominio', label: 'Responsável pelo condomínio', tipo: 'texto', origem: 'MAN', grupo: 'Valores', obrigatoria: false },
  { chave: 'valores.responsavelIptu', label: 'Responsável pelo IPTU', tipo: 'texto', origem: 'MAN', grupo: 'Valores', obrigatoria: false },
  { chave: 'pagamento.forma', label: 'Forma de pagamento', tipo: 'texto', origem: 'CONST', grupo: 'Valores', obrigatoria: false },
  { chave: 'pagamento.banco', label: 'Banco', tipo: 'texto', origem: 'CONST', grupo: 'Valores', obrigatoria: false },
  { chave: 'pagamento.agencia', label: 'Agência', tipo: 'texto', origem: 'CONST', grupo: 'Valores', obrigatoria: false },
  { chave: 'pagamento.conta', label: 'Conta', tipo: 'texto', origem: 'CONST', grupo: 'Valores', obrigatoria: false },
  { chave: 'pagamento.favorecido', label: 'Favorecido', tipo: 'texto', origem: 'CONST', grupo: 'Valores', obrigatoria: false },
  { chave: 'pagamento.chavePix', label: 'Chave Pix', tipo: 'texto', origem: 'CONST', grupo: 'Valores', obrigatoria: false },

  // Reajuste
  { chave: 'reajuste.indice', label: 'Reajuste — índice', tipo: 'texto', origem: 'MAN', grupo: 'Reajuste', obrigatoria: false },
  { chave: 'reajuste.periodicidadeMeses', label: 'Reajuste — periodicidade (meses)', tipo: 'numero', origem: 'MAN', grupo: 'Reajuste', obrigatoria: false },
  { chave: 'reajuste.percentualMinimo', label: 'Reajuste — piso (%)', tipo: 'numero', origem: 'MAN', grupo: 'Reajuste', obrigatoria: false },
  { chave: 'reajuste.percentualMaximo', label: 'Reajuste — teto (%)', tipo: 'numero', origem: 'MAN', grupo: 'Reajuste', obrigatoria: false },
  { chave: 'reajuste.textoIndiceSubstitutivo', label: 'Reajuste — índice substitutivo', tipo: 'texto', origem: 'CONST', grupo: 'Reajuste', obrigatoria: false },

  // Mora / multas
  { chave: 'mora.multaPercentual', label: 'Multa de mora (%)', tipo: 'numero', origem: 'MAN', grupo: 'Mora', obrigatoria: false },
  { chave: 'mora.jurosMensalPercentual', label: 'Juros mensais (%)', tipo: 'numero', origem: 'MAN', grupo: 'Mora', obrigatoria: false },
  { chave: 'mora.indiceCorrecao', label: 'Índice de correção da mora', tipo: 'texto', origem: 'MAN', grupo: 'Mora', obrigatoria: false },
  { chave: 'penalidade.multaInfracaoAlugueis', label: 'Multa por infração (aluguéis)', tipo: 'numero', origem: 'MAN', grupo: 'Mora', obrigatoria: false },
  { chave: 'penalidade.prazoRegularizacaoDias', label: 'Prazo de regularização (dias)', tipo: 'numero', origem: 'CONST', grupo: 'Mora', obrigatoria: false },
  { chave: 'penalidade.multaDenunciaVaziaMeses', label: 'Multa denúncia vazia (meses)', tipo: 'numero', origem: 'CONST', grupo: 'Mora', obrigatoria: false },
  { chave: 'honorarios.judicialPercentual', label: 'Honorários judiciais (%)', tipo: 'numero', origem: 'CONST', grupo: 'Mora', obrigatoria: false },
  { chave: 'honorarios.extrajudicialPercentual', label: 'Honorários extrajudiciais (%)', tipo: 'numero', origem: 'CONST', grupo: 'Mora', obrigatoria: false },

  // Garantia (título de capitalização + alternativas)
  { chave: 'garantia.tipo', label: 'Garantia — tipo', tipo: 'texto', origem: 'MAN', grupo: 'Garantia', obrigatoria: false },
  { chave: 'garantia.titulo.seguradora', label: 'Título — seguradora', tipo: 'texto', origem: 'MAN', grupo: 'Garantia', obrigatoria: false },
  { chave: 'garantia.titulo.valorNominal', label: 'Título — valor nominal', tipo: 'moeda', origem: 'MAN', grupo: 'Garantia', obrigatoria: false },
  { chave: 'garantia.titulo.valorNominalExtenso', label: 'Título — valor nominal por extenso', tipo: 'texto', origem: 'CALC', grupo: 'Garantia', obrigatoria: false },
  { chave: 'garantia.titulo.numeroFicha', label: 'Título — número da ficha', tipo: 'texto', origem: 'MAN', grupo: 'Garantia', obrigatoria: false },
  { chave: 'garantia.titulo.modalidade', label: 'Título — modalidade', tipo: 'texto', origem: 'MAN', grupo: 'Garantia', obrigatoria: false },
  { chave: 'garantia.titulo.normativos', label: 'Título — normativos', tipo: 'texto', origem: 'CONST', grupo: 'Garantia', obrigatoria: false },

  // Seguro
  { chave: 'seguro.exigido', label: 'Seguro — exigido', tipo: 'booleano', origem: 'MAN', grupo: 'Seguro', obrigatoria: false },
  { chave: 'seguro.prazoContratacaoDias', label: 'Seguro — prazo de contratação (dias)', tipo: 'numero', origem: 'CONST', grupo: 'Seguro', obrigatoria: false },
  { chave: 'seguro.coberturas', label: 'Seguro — coberturas', tipo: 'texto', origem: 'MAN', grupo: 'Seguro', obrigatoria: false },
  { chave: 'seguro.beneficiario', label: 'Seguro — beneficiário', tipo: 'texto', origem: 'CONST', grupo: 'Seguro', obrigatoria: false },
  { chave: 'seguro.baseValorSegurado', label: 'Seguro — base do valor segurado', tipo: 'texto', origem: 'MAN', grupo: 'Seguro', obrigatoria: false },

  // Vistoria / devolução
  { chave: 'vistoria.anexoNumero', label: 'Vistoria — nº do anexo', tipo: 'texto', origem: 'MAN', grupo: 'Vistoria', obrigatoria: false },
  { chave: 'vistoria.dataEntrada', label: 'Vistoria — data de entrada', tipo: 'data', origem: 'MAN', grupo: 'Vistoria', obrigatoria: false },
  { chave: 'vistoria.condicaoPintura', label: 'Vistoria — condição da pintura', tipo: 'texto', origem: 'MAN', grupo: 'Vistoria', obrigatoria: false },
  { chave: 'vistoria.prazoApontarDefeitosDias', label: 'Vistoria — prazo p/ apontar defeitos (dias)', tipo: 'numero', origem: 'CONST', grupo: 'Vistoria', obrigatoria: false },
  { chave: 'vistoria.prazoAvisoDesocupacaoDias', label: 'Vistoria — aviso de desocupação (dias)', tipo: 'numero', origem: 'CONST', grupo: 'Vistoria', obrigatoria: false },
  { chave: 'visita.prazoAvisoHoras', label: 'Visita — aviso (horas)', tipo: 'numero', origem: 'CONST', grupo: 'Vistoria', obrigatoria: false },

  // Fechamento
  { chave: 'foro.cidade', label: 'Foro — cidade', tipo: 'texto', origem: 'CONST', grupo: 'Fechamento', obrigatoria: false },
  { chave: 'assinatura.cidade', label: 'Assinatura — cidade', tipo: 'texto', origem: 'MAN', grupo: 'Fechamento', obrigatoria: false },
  { chave: 'assinatura.data', label: 'Assinatura — data', tipo: 'data', origem: 'MAN', grupo: 'Fechamento', obrigatoria: false },
  { chave: 'assinatura.dataExtenso', label: 'Assinatura — data por extenso', tipo: 'texto', origem: 'CALC', grupo: 'Fechamento', obrigatoria: false },
  { chave: 'assinatura.numeroVias', label: 'Assinatura — nº de vias', tipo: 'numero', origem: 'CONST', grupo: 'Fechamento', obrigatoria: false },
]
