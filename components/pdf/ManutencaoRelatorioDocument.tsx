import { Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer'

export interface LinhaRelatorio {
  data_abertura: string
  titulo: string
  status: string
  custo_estimado: number | null
  custo_real: number | null
  data_inicio: string | null
  data_conclusao_estimada: string | null
  data_conclusao_real: string | null
}

interface Props {
  imovelNome: string
  periodo: string
  geradoEm: string
  linhas: LinhaRelatorio[]
  totalEstimado: number
  totalReal: number
  logoUrl?: string
}

const moeda = (v: number | null) => (v == null ? '—' : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }))
const data = (s: string | null) => {
  if (!s) return '—'
  const [a, m, d] = s.split('-')
  return a && m && d ? `${d}/${m}/${a}` : s
}

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 8, color: '#1e293b', fontFamily: 'Helvetica' },
  logo: { width: 70, marginBottom: 8 },
  titulo: { fontSize: 13, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  sub: { fontSize: 9, color: '#475569', marginBottom: 1 },
  th: { flexDirection: 'row', borderBottom: 1, borderColor: '#334155', paddingBottom: 3, marginTop: 10, fontFamily: 'Helvetica-Bold' },
  tr: { flexDirection: 'row', borderBottom: 0.5, borderColor: '#e2e8f0', paddingVertical: 3 },
  totais: { flexDirection: 'row', marginTop: 8, paddingTop: 4, borderTop: 1, borderColor: '#334155', fontFamily: 'Helvetica-Bold' },
  vazio: { marginTop: 20, fontSize: 10, color: '#64748b', textAlign: 'center' },
})

const W = { abertura: '10%', titulo: '24%', status: '12%', est: '11%', real: '11%', inicio: '10%', ce: '11%', cr: '11%' }

export default function ManutencaoRelatorioDocument({ imovelNome, periodo, geradoEm, linhas, totalEstimado, totalReal, logoUrl }: Props) {
  return (
    <Document title={`Relatório de manutenção — ${imovelNome}`}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : null}
        <Text style={styles.titulo}>Relatório de chamados de manutenção</Text>
        <Text style={styles.sub}>Imóvel: {imovelNome}</Text>
        <Text style={styles.sub}>Período: {periodo}</Text>
        <Text style={styles.sub}>Gerado em: {geradoEm}</Text>

        {linhas.length === 0 ? (
          <Text style={styles.vazio}>Nenhum chamado encontrado para este filtro.</Text>
        ) : (
          <>
            <View style={styles.th}>
              <Text style={{ width: W.abertura }}>Abertura</Text>
              <Text style={{ width: W.titulo }}>Chamado</Text>
              <Text style={{ width: W.status }}>Status</Text>
              <Text style={{ width: W.est }}>Estimado</Text>
              <Text style={{ width: W.real }}>Real</Text>
              <Text style={{ width: W.inicio }}>Início</Text>
              <Text style={{ width: W.ce }}>Concl. est.</Text>
              <Text style={{ width: W.cr }}>Concl. real</Text>
            </View>
            {linhas.map((l, i) => (
              <View key={i} style={styles.tr} wrap={false}>
                <Text style={{ width: W.abertura }}>{data(l.data_abertura)}</Text>
                <Text style={{ width: W.titulo }}>{l.titulo}</Text>
                <Text style={{ width: W.status }}>{l.status}</Text>
                <Text style={{ width: W.est }}>{moeda(l.custo_estimado)}</Text>
                <Text style={{ width: W.real }}>{moeda(l.custo_real)}</Text>
                <Text style={{ width: W.inicio }}>{data(l.data_inicio)}</Text>
                <Text style={{ width: W.ce }}>{data(l.data_conclusao_estimada)}</Text>
                <Text style={{ width: W.cr }}>{data(l.data_conclusao_real)}</Text>
              </View>
            ))}
            <View style={styles.totais}>
              <Text style={{ width: W.abertura }} />
              <Text style={{ width: W.titulo }}>TOTAIS</Text>
              <Text style={{ width: W.status }} />
              <Text style={{ width: W.est }}>{moeda(totalEstimado)}</Text>
              <Text style={{ width: W.real }}>{moeda(totalReal)}</Text>
              <Text style={{ width: '32%' }} />
            </View>
          </>
        )}
      </Page>
    </Document>
  )
}
