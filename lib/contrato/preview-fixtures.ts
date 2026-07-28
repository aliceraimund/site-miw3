// Dados fictícios para pré-visualizar um modelo. Estrutura aninhada endereçável
// por caminhos com ponto (mesmo formato que montarValores produz). As variáveis
// CALC são derivadas via helpers.

import { extenso, extensoMoeda, dataExtenso, listaPessoas } from './helpers'

const locatariosBase = [
  { nome: 'João da Silva', nacionalidade: 'brasileiro', estadoCivil: 'casado', profissao: 'engenheiro', cpf: '123.456.789-00', rg: '12.345.678-9', email: 'joao@exemplo.com', telefone: '(11) 90000-0001' },
  { nome: 'Maria Souza', nacionalidade: 'brasileira', estadoCivil: 'casada', profissao: 'médica', cpf: '987.654.321-00', rg: '98.765.432-1', email: 'maria@exemplo.com', telefone: '(11) 90000-0002' },
]
// Array com props extras (qtd/nomes) para casar com 'locatarios.qtd'/'locatarios.nomes'.
const locatarios = Object.assign([...locatariosBase], {
  qtd: locatariosBase.length,
  nomes: listaPessoas(locatariosBase.map((l) => l.nome)),
})

const aluguel = 3500
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
  fiadores: [],
  testemunhas: [{ nome: 'Testemunha Um' }, { nome: 'Testemunha Dois' }],
  qtdTestemunhas: 2,
  imovel: {
    logradouro: 'Rua das Flores', numero: '250', complemento: 'Apto 42', torre: 'B', nomeTorre: 'Torre Jardim',
    condominio: 'Residencial Parque', bairro: 'Centro', cidade: 'São Caetano do Sul', uf: 'SP', cep: '09500-000',
    qtdVagas: 2, identificacaoVagas: 'vagas 15 e 16', matricula: '123.456', inscricaoIptu: '000.000.0000-0',
    finalidade: 'residencial', temAquecedorAgua: true, temArCondicionado: true, temSacadaEnvidracada: true,
    temVaga: true, temRegulamentoInterno: true,
  },
  prazo: {
    meses: 24, mesesExtenso: extenso(24), dataInicio: '2026-08-01', dataFim: dataExtenso('2028-07-31'),
    diaVencimento: 10, dataPrimeiroVencimento: '2026-09-10', prorrogacaoPresumidaDias: 30,
  },
  valores: {
    aluguel, aluguelExtenso: extensoMoeda(aluguel), condominio: 683, iptu: 65,
    responsavelCondominio: 'locatário', responsavelIptu: 'locatário',
  },
  pagamento: { forma: 'transferência/Pix', banco: 'Banco Exemplo', agencia: '0001', conta: '12345-6', favorecido: 'MIW3 Ltda.', chavePix: '00.000.000/0001-00' },
  reajuste: { indice: 'IPCA', periodicidadeMeses: 12, percentualMinimo: 5, percentualMaximo: null, textoIndiceSubstitutivo: 'IGP-M/FGV' },
  mora: { multaPercentual: 10, jurosMensalPercentual: 1, indiceCorrecao: 'IGP-M' },
  penalidade: { multaInfracaoAlugueis: 3, prazoRegularizacaoDias: 15, multaDenunciaVaziaMeses: 1 },
  honorarios: { judicialPercentual: 20, extrajudicialPercentual: 10 },
  garantia: {
    tipo: 'titulo_capitalizacao',
    titulo: { seguradora: 'Seguradora Exemplo', valorNominal: 21000, valorNominalExtenso: extensoMoeda(21000), numeroFicha: 'FICHA-001', modalidade: 'Capitalização', normativos: 'Circular SUSEP' },
  },
  seguro: { exigido: true, prazoContratacaoDias: 5, coberturas: 'incêndio, danos elétricos', beneficiario: 'LOCADOR', baseValorSegurado: 'valor de reconstrução' },
  vistoria: { anexoNumero: 'I', dataEntrada: '2026-08-01', condicaoPintura: 'nova', prazoApontarDefeitosDias: 10, prazoAvisoDesocupacaoDias: 30 },
  visita: { prazoAvisoHoras: 48 },
  foro: { cidade: 'São Caetano do Sul' },
  assinatura: { cidade: 'São Caetano do Sul', data: dataAssinatura, dataExtenso: dataExtenso(dataAssinatura), numeroVias: 3 },
}
