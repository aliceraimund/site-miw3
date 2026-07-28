import { Document, Page, StyleSheet, Image, View } from '@react-pdf/renderer'
import Html from 'react-pdf-html'

interface Props {
  html: string
  logoUrl?: string
  titulo?: string
}

const styles = StyleSheet.create({
  page: { paddingTop: 44, paddingBottom: 52, paddingHorizontal: 52, fontSize: 10, color: '#1e293b', fontFamily: 'Helvetica' },
  logo: { width: 88, alignSelf: 'center', marginBottom: 14 },
})

// Estilos aplicados ao subconjunto de HTML que o editor produz.
const stylesheet = {
  h1: { fontSize: 13, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginTop: 10, marginBottom: 8 },
  h2: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 8, marginBottom: 5 },
  p: { fontSize: 10, textAlign: 'justify', marginTop: 4, marginBottom: 4, lineHeight: 1.5 },
  li: { fontSize: 10, marginBottom: 2, lineHeight: 1.4 },
  b: { fontFamily: 'Helvetica-Bold' },
  strong: { fontFamily: 'Helvetica-Bold' },
  i: { fontFamily: 'Helvetica-Oblique' },
  em: { fontFamily: 'Helvetica-Oblique' },
  u: { textDecoration: 'underline' },
} as const

export default function ContratoHtmlDocument({ html, logoUrl, titulo }: Props) {
  return (
    <Document title={titulo ?? 'Contrato'}>
      <Page size="A4" style={styles.page}>
        {logoUrl ? (
          <View>
            <Image src={logoUrl} style={styles.logo} />
          </View>
        ) : null}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Html stylesheet={stylesheet as any} resetStyles>
          {html || '<p></p>'}
        </Html>
      </Page>
    </Document>
  )
}
