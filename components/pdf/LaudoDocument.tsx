import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import type { Vistoria, EstadoItem } from '@/types/vistoria'

export interface LaudoItemPdf {
  item: string
  estado: EstadoItem | null
  observacao: string | null
  fotos: string[]
}

// O laudo é organizado por ambiente (cômodo), do jeito que a vistoria é feita
// na prática: entra-se em um cômodo de cada vez.
export interface LaudoAmbientePdf {
  nome: string
  observacao: string | null
  fotos: string[] // fotos gerais do ambiente
  itens: LaudoItemPdf[]
}

const ESTADO_COR: Record<string, string> = { nova: '#059669', boa: '#16a34a', regular: '#d97706', danificada: '#dc2626', nz: '#64748b' }
const ESTADO_TXT: Record<string, string> = { nova: 'NOVA', boa: 'BOA', regular: 'REGULAR', danificada: 'DANIFICADA', nz: 'N/Z' }

const LEGENDA_ESTADOS: { chave: EstadoItem; texto: string }[] = [
  { chave: 'nova', texto: 'Nova — sem uso ou recém-instalada' },
  { chave: 'boa', texto: 'Boa — em pleno funcionamento, sem avarias' },
  { chave: 'regular', texto: 'Regular — desgaste de uso normal' },
  { chave: 'danificada', texto: 'Danificada — com avaria, falta ou defeito' },
  { chave: 'nz', texto: 'N/Z — não se aplica / não existe no imóvel' },
]

const DECLARACAO_ENTRADA = [
  'O LOCATÁRIO declara receber o imóvel nas condições descritas neste laudo, que passa a integrar o contrato de locação para todos os efeitos legais.',
  'Eventuais divergências deverão ser apresentadas por escrito à administradora no prazo de 5 (cinco) dias corridos contados desta vistoria. Decorrido o prazo sem manifestação, o laudo é considerado aceito integralmente.',
  'Ao término da locação o imóvel deverá ser restituído no mesmo estado em que foi recebido, com pintura e limpeza equivalentes, ressalvado apenas o desgaste natural decorrente do uso normal.',
]

const DECLARACAO_SAIDA = [
  'O imóvel foi restituído ao LOCADOR nas condições descritas neste laudo, apurado em comparação com a vistoria de entrada.',
  'As avarias, faltas e reparos apontados acima são de responsabilidade do LOCATÁRIO, que deverá saná-los ou indenizá-los no prazo ajustado entre as partes, na forma da Lei nº 8.245/91.',
  'A entrega das chaves não implica quitação das obrigações do contrato, permanecendo o LOCATÁRIO responsável pelos débitos e reparos pendentes até a efetiva regularização.',
]

const styles = StyleSheet.create({
  page: { padding: 32, paddingBottom: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#0f172a' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 12 },
  logo: { width: 90 },
  headerInfo: { alignItems: 'flex-end' },
  title: { fontSize: 14, fontWeight: 700, marginBottom: 2 },
  subtitle: { fontSize: 10, color: '#475569' },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  infoBox: { width: '48%', backgroundColor: '#f8fafc', borderRadius: 4, padding: 8, marginBottom: 8, marginRight: 8 },
  infoBoxFull: { width: '100%', backgroundColor: '#f8fafc', borderRadius: 4, padding: 8, marginBottom: 8 },
  infoLabel: { fontSize: 8, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 },
  infoValue: { fontSize: 10 },
  legenda: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4, padding: 8, marginBottom: 4 },
  legendaLinha: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  legendaTexto: { fontSize: 8, color: '#475569', marginLeft: 6 },
  ambienteHeader: { backgroundColor: '#0f172a', borderRadius: 4, paddingVertical: 5, paddingHorizontal: 8, marginTop: 14, marginBottom: 6 },
  ambienteNome: { fontSize: 11, fontWeight: 700, color: '#ffffff', textTransform: 'uppercase' },
  ambienteObs: { fontSize: 9, color: '#334155', marginBottom: 6 },
  itemBox: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4, padding: 8, marginBottom: 6 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemNome: { fontSize: 10, fontWeight: 700 },
  estadoBadge: { fontSize: 8, fontWeight: 700, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, color: '#ffffff' },
  observacao: { fontSize: 9, color: '#334155', marginTop: 4 },
  // Fotos: 2 por linha (~8,8 cm cada). Sem altura fixa e sem "cover" —
  // a proporção original de cada foto é preservada.
  fotosGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6, marginHorizontal: -3 },
  fotoWrap: { width: '50%', paddingHorizontal: 3, paddingBottom: 6 },
  foto: { width: '100%', borderRadius: 3 },
  fotoLegenda: { fontSize: 7, color: '#94a3b8', marginTop: 2 },
  vazio: { fontSize: 9, color: '#94a3b8', fontStyle: 'italic', marginBottom: 6 },
  rodape: { position: 'absolute', bottom: 16, left: 32, right: 32, fontSize: 8, color: '#94a3b8', textAlign: 'center' },
  declaracaoTitulo: { fontSize: 11, fontWeight: 700, marginTop: 18, marginBottom: 6, textTransform: 'uppercase' },
  declaracaoTexto: { fontSize: 9, color: '#1e293b', marginBottom: 5, lineHeight: 1.4, textAlign: 'justify' },
  assinaturas: { marginTop: 24 },
  assinaturaLinha: { borderTopWidth: 1, borderTopColor: '#0f172a', marginTop: 28, paddingTop: 4, width: '100%' },
  assinaturaLabel: { fontSize: 9, color: '#334155' },
})

function formatDateBR(value: string) {
  return new Date(value + 'T00:00:00').toLocaleDateString('pt-BR')
}

interface Props {
  vistoria: Vistoria
  ambientes: LaudoAmbientePdf[]
  logoUrl: string
}

function GradeFotos({ fotos }: { fotos: string[] }) {
  if (fotos.length === 0) return null
  return (
    <View style={styles.fotosGrid}>
      {fotos.map((url, i) => (
        // Cada foto é indivisível: não quebra no meio da página
        <View key={i} style={styles.fotoWrap} wrap={false}>
          <Image src={url} style={styles.foto} />
          {fotos.length > 1 && <Text style={styles.fotoLegenda}>Foto {i + 1} de {fotos.length}</Text>}
        </View>
      ))}
    </View>
  )
}

export default function LaudoDocument({ vistoria, ambientes, logoUrl }: Props) {
  const chaves = vistoria.chaves ?? []
  const entrada = vistoria.tipo_vistoria === 'entrada'
  const declaracoes = entrada ? DECLARACAO_ENTRADA : DECLARACAO_SAIDA

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <Image src={logoUrl} style={styles.logo} />
          <View style={styles.headerInfo}>
            <Text style={styles.title}>Laudo de Vistoria — {entrada ? 'Entrada' : 'Saída'}</Text>
            <Text style={styles.subtitle}>{vistoria.imovel?.nome}</Text>
            <Text style={styles.subtitle}>{vistoria.imovel?.endereco}</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Data</Text>
            <Text style={styles.infoValue}>{formatDateBR(vistoria.data)}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Vistoriador</Text>
            <Text style={styles.infoValue}>{vistoria.vistoriador || '—'}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Locatário</Text>
            <Text style={styles.infoValue}>{vistoria.locatario || '—'}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Medidores</Text>
            <Text style={styles.infoValue}>
              Água: {vistoria.medidores?.agua || '—'}  ·  Energia: {vistoria.medidores?.energia || '—'}  ·  Gás: {vistoria.medidores?.gas || '—'}
            </Text>
          </View>
          {chaves.length > 0 && (
            <View style={styles.infoBoxFull}>
              <Text style={styles.infoLabel}>Chaves entregues</Text>
              <Text style={styles.infoValue}>{chaves.map((c) => `${c.quantidade}x ${c.descricao}`).join('  ·  ')}</Text>
            </View>
          )}
          {vistoria.observacoes && (
            <View style={styles.infoBoxFull}>
              <Text style={styles.infoLabel}>Observações gerais</Text>
              <Text style={styles.infoValue}>{vistoria.observacoes}</Text>
            </View>
          )}
        </View>

        <View style={styles.legenda} wrap={false}>
          <Text style={styles.infoLabel}>Escala de estado de conservação</Text>
          {LEGENDA_ESTADOS.map((e) => (
            <View key={e.chave} style={styles.legendaLinha}>
              <Text style={[styles.estadoBadge, { backgroundColor: ESTADO_COR[e.chave] }]}>{ESTADO_TXT[e.chave]}</Text>
              <Text style={styles.legendaTexto}>{e.texto}</Text>
            </View>
          ))}
        </View>

        {ambientes.map((ambiente, ia) => (
          <View key={ia}>
            <View style={styles.ambienteHeader} wrap={false}>
              <Text style={styles.ambienteNome}>{ambiente.nome}</Text>
            </View>
            {ambiente.observacao && <Text style={styles.ambienteObs}>{ambiente.observacao}</Text>}
            <GradeFotos fotos={ambiente.fotos} />
            {ambiente.itens.length === 0 && ambiente.fotos.length === 0 && !ambiente.observacao && (
              <Text style={styles.vazio}>Sem itens registrados neste ambiente.</Text>
            )}
            {ambiente.itens.map((item, idx) => (
              <View key={idx} style={styles.itemBox}>
                {/* Cabeçalho do item nunca é partido entre páginas */}
                <View wrap={false}>
                  <View style={styles.itemRow}>
                    <Text style={styles.itemNome}>{item.item}</Text>
                    <Text style={[styles.estadoBadge, { backgroundColor: item.estado ? ESTADO_COR[item.estado] : '#94a3b8' }]}>
                      {item.estado ? ESTADO_TXT[item.estado] : 'SEM ESTADO'}
                    </Text>
                  </View>
                  {item.observacao && <Text style={styles.observacao}>{item.observacao}</Text>}
                </View>
                <GradeFotos fotos={item.fotos} />
              </View>
            ))}
          </View>
        ))}

        <View break={ambientes.length > 0}>
          <Text style={styles.declaracaoTitulo}>Declaração das partes</Text>
          {declaracoes.map((texto, i) => (
            <Text key={i} style={styles.declaracaoTexto}>{texto}</Text>
          ))}
          <Text style={styles.declaracaoTexto}>
            {vistoria.imovel?.endereco ? `Imóvel: ${vistoria.imovel.endereco}. ` : ''}
            Vistoria de {entrada ? 'entrada' : 'saída'} realizada em {formatDateBR(vistoria.data)}
            {vistoria.vistoriador ? ` por ${vistoria.vistoriador}` : ''}.
          </Text>

          <View style={styles.assinaturas}>
            <View style={styles.assinaturaLinha}><Text style={styles.assinaturaLabel}>Locador</Text></View>
            <View style={styles.assinaturaLinha}><Text style={styles.assinaturaLabel}>Locatário</Text></View>
            <View style={styles.assinaturaLinha}><Text style={styles.assinaturaLabel}>Vistoriador</Text></View>
            <View style={styles.assinaturaLinha}><Text style={styles.assinaturaLabel}>Testemunha</Text></View>
          </View>
        </View>

        <Text style={styles.rodape} fixed render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </Page>
    </Document>
  )
}
