'use client'

import { useState } from 'react'
import RetryImage from './RetryImage'

interface Props {
  fotos: string[]
  nome: string
}

export default function ImageGallery({ fotos: allFotos, nome }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [brokenUrls, setBrokenUrls] = useState<Set<string>>(new Set())

  const fotos = allFotos.filter((f) => !brokenUrls.has(f))
  const safeIndex = fotos.length > 0 ? activeIndex % fotos.length : 0

  const markBroken = (url: string) => {
    setBrokenUrls((prev) => (prev.has(url) ? prev : new Set(prev).add(url)))
  }

  if (fotos.length === 0) {
    return (
      <div className="w-full h-80 bg-slate-100 rounded-xl flex items-center justify-center">
        <div className="text-center text-slate-400">
          <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">Sem fotos disponíveis</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative w-full h-80 md:h-[480px] rounded-xl overflow-hidden bg-slate-100">
        <RetryImage
          src={fotos[safeIndex]}
          alt={`${nome} - foto ${safeIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 800px"
          preload
          maxRetries={2}
          onGiveUp={() => markBroken(fotos[safeIndex])}
        />
        {fotos.length > 1 && (
          <>
            <button
              onClick={() => setActiveIndex((i) => (i - 1 + fotos.length) % fotos.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
              aria-label="Foto anterior"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setActiveIndex((i) => (i + 1) % fotos.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
              aria-label="Próxima foto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {safeIndex + 1} / {fotos.length}
            </div>
          </>
        )}
      </div>

      {fotos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {fotos.map((foto, i) => (
            <button
              key={foto}
              onClick={() => setActiveIndex(i)}
              className={`relative shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                i === safeIndex ? 'border-blue-500' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <RetryImage
                src={foto}
                alt={`${nome} - miniatura ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
                maxRetries={2}
                onGiveUp={() => markBroken(foto)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
