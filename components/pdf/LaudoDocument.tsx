import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import type { Vistoria, EstadoItem } from '@/types/vistoria'

export interface LaudoItemPdf {
  secao: string
  item: string
  estado: EstadoItem | null
  observacao: string | null
  fotos: string[]
}

const ESTADO_COR: Record<string, string> = { nova: '#059669', boa: '#16a34a', regular: '#d97706', danificada: '#dc2626', nz: '#64748b' }
const ESTADO_TXT: Record<string, string> = { nova: 'NOVA', boa: 'BOA', regular: 'REGULAR', danificada: 'DANIFICADA', nz: 'N/Z' }

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: 'Helvetica', color: '#0f172a' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 12 },
  logo: { width: 90 },
  headerInfo: { alignItems: 'flex-end' },
  title: { fontSize: 14, fontWeight: 700, marginBottom: 2 },
  subtitle: { fontSize: 10, color: '#475569' },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  infoBox: { width: '48%', backgroundColor: '#f8fafc', borderRadius: 4, padding: 8, marginBottom: 8, marginRight: 8 },
  infoBoxFull: { width: '100%', backgroundColor: '#f8fafc', borderRadius: 4, padding: 8, marginBottom: 8 },
  infoLabel: { fontSize: 8, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 },
  infoValue: { fontSize: 10 },
  secaoTitle: { fontSize: 11, fontWeight: 700, marginTop: 14, marginBottom: 6, textTransform: 'uppercase', color: '#1e293b' },
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
  rodape: { position: 'absolute', bottom: 16, left: 32, right: 32, fontSize: 8, color: '#94a3b8', textAlign: 'center' },
  assinaturas: { marginTop: 30 },
  assinaturaLinha: { borderTopWidth: 1, borderTopColor: '#0f172a', marginTop: 28, paddingTop: 4, width: '100%' },
  assinaturaLabel: { fontSize: 9, color: '#334155' },
})

function formatDateBR(value: string) {
  return new Date(value + 'T00:00:00').toLocaleDateString('pt-BR')
}

interface Props {
  vistoria: Vistoria
  itens: LaudoItemPdf[]
  logoUrl: string
}

export default function LaudoDocument({ vistoria, itens, logoUrl }: Props) {
  const secoes = Array.from(new Set(itens.map((i) => i.secao)))
  const chaves = vistoria.chaves ?? []

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <Image src={logoUrl} style={styles.logo} />
          <View style={styles.headerInfo}>
            <Text style={styles.title}>
              Laudo de Vistoria — {vistoria.tipo_vistoria === 'entrada' ? 'Entrada' : 'Saída'}
            </Text>
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

        {secoes.map((secao) => (
          <View key={secao}>
            <Text style={styles.secaoTitle}>{secao}</Text>
            {itens.filter((i) => i.secao === secao).map((item, idx) => (
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
                {item.fotos.length > 0 && (
                  <View style={styles.fotosGrid}>
                    {item.fotos.map((url, i) => (
                      // Cada foto é indivisível: não quebra no meio da página
                      <View key={i} style={styles.fotoWrap} wrap={false}>
                        <Image src={url} style={styles.foto} />
                        {item.fotos.length > 1 && (
                          <Text style={styles.fotoLegenda}>Foto {i + 1} de {item.fotos.length}</Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}
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

        <Text style={styles.rodape} fixed render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </Page>
    </Document>
  )
}
