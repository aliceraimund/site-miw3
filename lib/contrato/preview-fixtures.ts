// Dados fictícios para pré-visualizar um modelo. As variáveis CALC são
// derivadas via helpers, exercitando o merge sem depender de um contrato real.

import { extenso, extensoMoeda, dataExtenso, listaPessoas } from './helpers'

const locatarios = [
  { nome: 'João da Silva', nacionalidade: 'brasileiro', estadoCivil: 'casado', profissao: 'engenheiro', cpf: '123.456.789-00', rg: '12.345.678-9', email: 'joao@exemplo.com', telefone: '(11) 90000-0001' },
  { nome: 'Maria Souza', nacionalidade: 'brasileira', estadoCivil: 'casada', profissao: 'médica', cpf: '987.654.321-00', rg: '98.765.432-1', email: 'maria@exemplo.com', telefone: '(11) 90000-0002' },
]

const aluguel = 3500
const dataInicio = '2026-08-01'
const dataFim = '2028-07-31'
const dataAssinatura = '2026-07-24'

export const PREVIEW_VALORES: Record<string, unknown> = {
  locador: {
    razaoSocial: 'MIW3 Locação, Compra e Venda de Imóveis Ltda.',
    cnpj: '00.000.000/0001-00',
    endereco: 'Av. Exemplo, 100 - São Caetano do Sul/SP',
    cidade: 'São Caetano do Sul',
    comarca: 'São Caetano do Sul',
  },
  locatarios,
  'locatarios.nomes': listaPessoas(locatarios.map((l) => l.nome)),
  fiadores: [],
  testemunhas: [{ nome: 'Testemunha Um' }, { nome: 'Testemunha Dois' }],
  qtdTestemunhas: 2,
  imovel: {
    logradouro: 'Rua das Flores',
    numero: '250',
    complemento: 'Apto 42',
    torre: 'B',
    nomeTorre: 'Torre Jardim',
    condominio: 'Residencial Parque',
    bairro: 'Centro',
    cidade: 'São Caetano do Sul',
    uf: 'SP',
    cep: '09500-000',
    qtdVagas: 2,
    identificacaoVagas: 'vagas 15 e 16',
    matricula: '123.456',
    inscricaoIptu: '000.000.0000-0',
    finalidade: 'residencial',
    temAquecedorAgua: true,
    temArCondicionado: true,
    temSacadaEnvidracada: true,
    temVaga: true,
    temRegulamentoInterno: true,
  },
  prazo: {
    meses: 24,
    dataInicio,
    dataFim,
    diaVencimento: 10,
    dataPrimeiroVencimento: '2026-09-10',
    prorrogacaoPresumidaDias: 30,
  },
  valores: {
    aluguel,
    condominio: 683,
    iptu: 65,
    responsavelCondominio: 'locatário',
    responsavelIptu: 'locatário',
  },
  pagamento: {
    forma: 'transferência/Pix', banco: 'Banco Exemplo', agencia: '0001', conta: '12345-6',
    favorecido: 'MIW3 Ltda.', chavePix: '00.000.000/0001-00',
  },
  reajuste: { indice: 'IPCA', periodicidadeMeses: 12, percentualMinimo: 5, percentualMaximo: null, textoIndiceSubstitutivo: 'IGP-M/FGV' },
  mora: { multaPercentual: 10, jurosMensalPercentual: 1, indiceCorrecao: 'IGP-M' },
  penalidade: { multaInfracaoAlugueis: 3, prazoRegularizacaoDias: 15, multaDenunciaVaziaMeses: 1 },
  honorarios: { judicialPercentual: 20, extrajudicialPercentual: 10 },
  garantia: {
    tipo: 'titulo_capitalizacao',
    titulo: { seguradora: 'Seguradora Exemplo', valorNominal: 21000, numeroFicha: 'FICHA-001', modalidade: 'Capitalização', normativos: 'Circular SUSEP' },
  },
  seguro: { exigido: true, prazoContratacaoDias: 5, coberturas: 'incêndio, danos elétricos', beneficiario: 'LOCADOR', baseValorSegurado: 'valor de reconstrução' },
  vistoria: { anexoNumero: 'I', dataEntrada: dataInicio, condicaoPintura: 'nova', prazoApontarDefeitosDias: 10, prazoAvisoDesocupacaoDias: 30 },
  visita: { prazoAvisoHoras: 48 },
  foro: { cidade: 'São Caetano do Sul' },
  assinatura: { cidade: 'São Caetano do Sul', data: dataAssinatura, numeroVias: 3 },

  // CALC (derivadas via helpers)
  'locatarios.qtd': locatarios.length,
  'prazo.mesesExtenso': extenso(24),
  'prazo.dataFim': dataExtenso(dataFim),
  'valores.aluguelExtenso': extensoMoeda(aluguel),
  'garantia.titulo.valorNominalExtenso': extensoMoeda(21000),
  'assinatura.dataExtenso': dataExtenso(dataAssinatura),
}
