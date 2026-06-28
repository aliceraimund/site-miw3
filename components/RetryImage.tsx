'use client'

import { useState } from 'react'
import Image, { type ImageProps } from 'next/image'

type RetryImageProps = Omit<ImageProps, 'onError'> & {
  src: string
  maxRetries?: number
  fallback?: React.ReactNode
  onGiveUp?: () => void
}

const RETRY_DELAYS_MS = [800, 2000, 4000]

export default function RetryImage({ src, ...rest }: RetryImageProps) {
  // Keyed by src so internal retry/give-up state resets whenever the photo itself changes.
  return <RetryImageInner key={src} src={src} {...rest} />
}

function RetryImageInner({ src, maxRetries = 3, fallback = null, onGiveUp, style, ...rest }: RetryImageProps) {
  const [attempt, setAttempt] = useState(0)
  const [hidden, setHidden] = useState(false)
  const [gaveUp, setGaveUp] = useState(false)

  if (gaveUp) return <>{fallback}</>

  const resolvedSrc = attempt === 0 ? src : `${src}${src.includes('?') ? '&' : '?'}retry=${attempt}`

  return (
    <Image
      key={resolvedSrc}
      src={resolvedSrc}
      style={hidden ? { ...style, visibility: 'hidden' } : style}
      onLoad={() => setHidden(false)}
      onError={() => {
        if (attempt >= maxRetries) {
          setGaveUp(true)
          onGiveUp?.()
          return
        }
        setHidden(true)
        const delay = RETRY_DELAYS_MS[attempt] ?? RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1]
        setTimeout(() => setAttempt((a) => a + 1), delay)
      }}
      {...rest}
    />
  )
}
