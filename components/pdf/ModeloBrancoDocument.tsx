import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import type { TipoImovelVistoria } from '@/types/vistoria'

export interface ModeloBrancoItemPdf {
  secao: string
  item: string
}

const TIPO_TITULO: Record<TipoImovelVistoria, string> = {
  residencial: 'Residencial',
  comercial: 'Comercial / Industrial',
}

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: 'Helvetica', color: '#0f172a' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 12 },
  logo: { width: 90 },
  headerInfo: { alignItems: 'flex-end' },
  title: { fontSize: 14, fontWeight: 700, marginBottom: 2 },
  subtitle: { fontSize: 10, color: '#475569' },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  infoBox: { width: '48%', marginBottom: 10, marginRight: 8 },
  infoBoxFull: { width: '100%', marginBottom: 10 },
  infoLabel: { fontSize: 8, color: '#64748b', textTransform: 'uppercase', marginBottom: 3 },
  infoLine: { borderBottomWidth: 1, borderBottomColor: '#0f172a', height: 14 },
  secaoTitle: { fontSize: 11, fontWeight: 700, marginTop: 14, marginBottom: 6, textTransform: 'uppercase', color: '#1e293b' },
  itemBox: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4, padding: 8, marginBottom: 6 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  itemNome: { fontSize: 10, fontWeight: 700 },
  checkRow: { flexDirection: 'row' },
  checkOption: { flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
  checkBox: { width: 9, height: 9, borderWidth: 1, borderColor: '#0f172a', marginRight: 3 },
  checkLabel: { fontSize: 8, color: '#334155' },
  obsLabel: { fontSize: 8, color: '#64748b', marginBottom: 2 },
  obsLine: { borderBottomWidth: 1, borderBottomColor: '#cbd5e1', height: 12 },
  assinaturas: { marginTop: 30 },
  assinaturaLinha: { borderTopWidth: 1, borderTopColor: '#0f172a', marginTop: 28, paddingTop: 4, width: '100%' },
  assinaturaLabel: { fontSize: 9, color: '#334155' },
})

const OPCOES_ESTADO = ['Bom', 'Regular', 'Avaria', 'N/A']

interface Props {
  tipoImovel: TipoImovelVistoria
  itens: ModeloBrancoItemPdf[]
  logoUrl: string
}

export default function ModeloBrancoDocument({ tipoImovel, itens, logoUrl }: Props) {
  const secoes = Array.from(new Set(itens.map((i) => i.secao)))

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <Image src={logoUrl} style={styles.logo} />
          <View style={styles.headerInfo}>
            <Text style={styles.title}>Modelo de Vistoria — {TIPO_TITULO[tipoImovel]}</Text>
            <Text style={styles.subtitle}>Formulário em branco para preenchimento manual</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Imóvel</Text>
            <View style={styles.infoLine} />
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Endereço</Text>
            <View style={styles.infoLine} />
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Data</Text>
            <View style={styles.infoLine} />
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Tipo de vistoria (Entrada/Saída)</Text>
            <View style={styles.infoLine} />
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Vistoriador</Text>
            <View style={styles.infoLine} />
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Locatário</Text>
            <View style={styles.infoLine} />
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Medidores — Água / Energia / Gás</Text>
            <View style={styles.infoLine} />
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Chaves entregues</Text>
            <View style={styles.infoLine} />
          </View>
          <View style={styles.infoBoxFull}>
            <Text style={styles.infoLabel}>Observações gerais</Text>
            <View style={styles.infoLine} />
            <View style={[styles.infoLine, { marginTop: 6 }]} />
          </View>
        </View>

        {secoes.map((secao) => (
          <View key={secao}>
            <Text style={styles.secaoTitle}>{secao}</Text>
            {itens.filter((i) => i.secao === secao).map((item, idx) => (
              <View key={idx} style={styles.itemBox} wrap={false}>
                <View style={styles.itemRow}>
                  <Text style={styles.itemNome}>{item.item}</Text>
                  <View style={styles.checkRow}>
                    {OPCOES_ESTADO.map((opcao) => (
                      <View key={opcao} style={styles.checkOption}>
                        <View style={styles.checkBox} />
                        <Text style={styles.checkLabel}>{opcao}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <Text style={styles.obsLabel}>Observações:</Text>
                <View style={styles.obsLine} />
              </View>
            ))}
          </View>
        ))}

        <View style={styles.assinaturas}>
          <View style={styles.assinaturaLinha}><Text style={styles.assinaturaLabel}>Locador</Text></View>
          <View style={styles.assinaturaLinha}><Text style={styles.assinaturaLabel}>Locatário</Text></View>
          <View style={styles.assinaturaLinha}><Text style={styles.assinaturaLabel}>Vistoriador</Text></View>
          <View style={styles.assinaturaLinha}><Text style={styles.assinaturaLabel}>Testemunha</Text></View>
        </View>
      </Page>
    </Document>
  )
}
