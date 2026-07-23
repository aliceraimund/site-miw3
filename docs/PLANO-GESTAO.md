# Plano — Sistema de Gestão de Imóveis (módulos internos)

Adaptação do site MIW3 para incluir a gestão interna do patrimônio, como módulos
dentro da aba administrativa. A camada **financeira** (aluguéis a receber/pagos,
fluxo de caixa, inadimplência, relatórios financeiros, despesas) **não** é
construída — continua no ERP. Guardamos apenas os dados de referência
(valor do aluguel, custo de um chamado) que fazem parte do contrato/chamado.

## Decisões de arquitetura
- **Imóveis unificados** com os anúncios: um imóvel = uma linha em `imoveis`.
  Uma flag `gerido` marca os imóveis sob gestão; o campo `publicado` (já
  existente) controla se ele aparece no site. Dados sigilosos de gestão ficam em
  tabelas-companheiras com RLS apenas para usuários autenticados.
- **Temporada:** planejada para fase posterior.
- **Dashboard:** painel-resumo não-financeiro na entrada da gestão.

## Modelo de dados
- `imoveis` + coluna `gerido boolean`
- `imovel_gestao` (1:1) — matrícula, inscrição municipal, áreas, situação, observações
- `imovel_contas` — IPTU/água/energia/gás/internet/condomínio/lixo/outros + responsável
- `imovel_documentos` — documentos no bucket privado `gestao`
- `inquilinos` + `inquilino_documentos`
- `contratos` + `contrato_historico` + `contrato_documentos`
- `manutencoes` + `manutencao_fotos`
- Bucket privado `gestao` (acesso por URL assinada, como o bucket `vistorias`)

## Roadmap
- [ ] **Fase 1 — Fundação + Cadastro de imóveis (gestão)**
  Migração do banco, bucket `gestao`, aba "Gestão" no admin, ficha completa do
  imóvel (dados de gestão + contas com responsável). Documentos: incremento
  seguinte dentro da fase.
- [ ] **Fase 2 — Inquilinos** — cadastro completo + documentos.
- [ ] **Fase 3 — Contratos** — imóvel + inquilino, vigência, reajuste,
  renovação/encerramento, histórico, PDF do contrato.
- [ ] **Fase 4 — Manutenção** — chamados por imóvel, prestador, fotos, situação, custo.
- [ ] **Fase 5 — Dashboard + integração das vistorias** ao cadastro unificado.
- [ ] **Fase 6 (posterior) — Temporada** — calendário de reservas, check-in/out, hóspedes.

## Fora de escopo (ERP já atende)
Controle financeiro, fluxo de caixa, inadimplência, relatórios financeiros,
gestão de despesas. Integração com concessionárias/prefeitura e leitura de
contas por IA ficam para avaliação futura.
