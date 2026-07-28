import { Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer'
import type { BlocoResolvido } from '@/lib/contrato/merge'

const styles = StyleSheet.create({
  page: { paddingTop: 48, paddingBottom: 56, paddingHorizontal: 56, fontSize: 10, lineHeight: 1.5, color: '#1e293b', fontFamily: 'Helvetica' },
  logo: { width: 90, marginBottom: 16, alignSelf: 'center' },
  titulo: { fontSize: 12, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginVertical: 8, textTransform: 'uppercase' },
  paragrafo: { textAlign: 'justify', marginVertical: 4 },
  negrito: { fontFamily: 'Helvetica-Bold' },
  rodape: { position: 'absolute', bottom: 24, left: 56, right: 56, fontSize: 8, color: '#94a3b8', textAlign: 'center' },
})

interface Props {
  blocos: BlocoResolvido[]
  logoUrl?: string
  titulo?: string
}

export default function ContratoDocument({ blocos, logoUrl, titulo }: Props) {
  return (
    <Document title={titulo ?? 'Contrato'}>
      <Page size="A4" style={styles.page}>
        {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : null}
        {blocos.map((bloco, i) => {
          const conteudo = bloco.runs.map((run, j) => (
            <Text key={j} style={run.negrito ? styles.negrito : undefined}>{run.texto}</Text>
          ))
          return bloco.tipo === 'titulo' ? (
            <Text key={i} style={styles.titulo}>{conteudo}</Text>
          ) : (
            <Text key={i} style={styles.paragrafo}>{conteudo}</Text>
          )
        })}
        <Text style={styles.rodape} fixed render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </Page>
    </Document>
  )
}
