// Constantes do LOCADOR (MIW3). Alimentam as tags de sistema do grupo
// "proprietario" (caminho_origem = 'const.<chave>').
// Valores extraídos do contrato padrão vigente — ajustar aqui se mudarem.

export const MIW3 = {
  razaoSocial: 'MIW3 ADMINISTRADORA DE BENS E SERVIÇOS LTDA',
  cnpj: '23.993.951/0001-04',
  endereco: 'Alameda Terracota, nº 215, Torre Union, 8º andar - Sala 802, Bairro Cerâmica, CEP 09531-190',
  cidade: 'São Caetano do Sul',
  comarca: 'São Caetano do Sul',
  banco: 'Itaú',
  agencia: '4054',
  conta: '13077-0',
  favorecido: 'MIW3 ADMINISTRADORA DE BENS E SERVIÇOS LTDA',
  chavePix: '23.993.951/0001-04',
} as const

export type ChaveMiw3 = keyof typeof MIW3
