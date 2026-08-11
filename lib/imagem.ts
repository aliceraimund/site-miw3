// Compressão de imagem no navegador, antes do upload.
// Fotos de celular saem com 2–4 MB; para o laudo impresso (cada foto ocupa
// ~9 cm de largura no PDF) 1600px de lado maior é mais do que suficiente.

export interface OpcoesCompressao {
  ladoMaximo?: number // maior dimensão em pixels
  qualidade?: number // 0..1 (JPEG)
}

const PADRAO: Required<OpcoesCompressao> = { ladoMaximo: 1600, qualidade: 0.82 }

function carregarImagem(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não foi possível ler a imagem'))
    }
    img.src = url
  })
}

/**
 * Reduz a imagem preservando a PROPORÇÃO original (nunca recorta).
 * Se algo falhar, devolve o arquivo original — comprimir é otimização,
 * não pode impedir o envio da foto.
 */
export async function comprimirImagem(file: File, opcoes: OpcoesCompressao = {}): Promise<File> {
  const { ladoMaximo, qualidade } = { ...PADRAO, ...opcoes }

  if (!file.type.startsWith('image/')) return file

  try {
    const img = await carregarImagem(file)
    const maiorLado = Math.max(img.width, img.height)
    const escala = maiorLado > ladoMaximo ? ladoMaximo / maiorLado : 1

    // Já é pequena e leve: não mexe.
    if (escala === 1 && file.size < 600_000) return file

    const largura = Math.round(img.width * escala)
    const altura = Math.round(img.height * escala)

    const canvas = document.createElement('canvas')
    canvas.width = largura
    canvas.height = altura
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(img, 0, 0, largura, altura)

    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', qualidade))
    if (!blob || blob.size >= file.size) return file // não ficou menor: mantém o original

    const nome = file.name.replace(/\.[^.]+$/, '') + '.jpg'
    return new File([blob], nome, { type: 'image/jpeg', lastModified: Date.now() })
  } catch {
    return file
  }
}

export function formatarBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
