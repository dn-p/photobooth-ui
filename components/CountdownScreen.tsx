'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface CountdownScreenProps {
  onComplete: () => void
  onCapture: (index: number) => void
  videoRef: React.RefCallback<HTMLVideoElement>
  cameraError: string | null
}

export default function CountdownScreen({
  onComplete,
  onCapture,
  videoRef,
  cameraError,
}: CountdownScreenProps) {
  const [currentCount, setCurrentCount] = useState(3)
  const [phase, setPhase] = useState<'countdown' | 'capture'>('countdown')

  useEffect(() => {
    let count = 3
    let photoIndex = 0
    let timer: number

    const advance = () => {
      if (count > 1) {
        count -= 1
        setCurrentCount(count)
        timer = window.setTimeout(advance, 1200)
        return
      }

      setPhase('capture')
      onCapture(photoIndex)
      photoIndex += 1

      if (photoIndex === 3) {
        timer = window.setTimeout(onComplete, 500)
      } else {
        timer = window.setTimeout(() => {
          count = 3
          setCurrentCount(count)
          setPhase('countdown')
          timer = window.setTimeout(advance, 1200)
        }, 500)
      }
    }

    timer = window.setTimeout(advance, 1200)
    return () => window.clearTimeout(timer)
  }, [onCapture, onComplete])

  return (
    <div
      className="kiosk-lock isolate flex flex-col items-center justify-center bg-[#0a0a0f] relative min-h-screen"
    >
      <div className="relative z-10 text-center px-4">
        <div className="text-8xl md:text-9xl font-bold text-white/90 countdown-pop">
          {currentCount}
        </div>
        <p className="text-white/50 text-sm mt-2 tracking-widest uppercase">
          {phase === 'countdown' && 'Siap mengambil foto...'}
          {phase === 'capture' && 'Mengambil gambar...'}
        </p>
      </div>

      {cameraError && (
        <p className="absolute top-6 left-6 z-10 rounded-lg bg-red-950/80 px-4 py-3 text-sm text-white">
          {cameraError}
        </p>
      )}

      <div className="absolute bottom-8 left-0 right-0 z-10 flex justify-center gap-2">
        {['#1e1e2f', '#1a1a2e', '#16162e'].map((color, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      <button
        className="absolute top-6 right-6 z-10 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white/60 hover:text-white transition-colors"
        onClick={() => onComplete()}
      >
        <X className="w-5 h-5" />
      </button>

      <div className="fixed inset-0 z-0 bg-black/60 flex items-center justify-center pointer-events-none">
        <video
          ref={videoRef}
          className="max-w-full max-h-full object-contain"
          playsInline
          muted
          autoPlay
        />
      </div>
    </div>
  )
}
