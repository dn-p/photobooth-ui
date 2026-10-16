'use client'

import { useState, useEffect, useRef } from 'react'
import { Camera, X } from 'lucide-react'

interface CountdownScreenProps {
  onComplete: () => void
  videoRef: React.RefObject<HTMLVideoElement>
}

export default function CountdownScreen({ onComplete, videoRef }: CountdownScreenProps) {
  const [currentCount, setCurrentCount] = useState(3)
  const [phase, setPhase] = useState<'countdown' | 'capture' | 'flash'>('countdown')

  useEffect(() => {
    // Simulate 3 photos: each cycle is 3-2-1 countdown then flash
    const totalSteps = 3 * 3 // 3 photos, each with 3-2-1 countdown
    let step = 0

    const interval = setInterval(() => {
      step++
      const cycle = Math.floor((step - 1) / 3)
      const position = (step - 1) % 3

      if (position === 0 && step > 1) {
        // Flash between photos
        setPhase('flash')
        setTimeout(() => setPhase('capture'), 500)
      }

      setCurrentCount(3 - position)
      setPhase('countdown')

      if (step === totalSteps) {
        clearInterval(interval)
        setTimeout(() => {
          onComplete()
        }, 500)
      }
    }, 1200)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <div
      className="kiosk-lock flex flex-col items-center justify-center bg-[#0a0a0f] relative min-h-screen"
    >
      {/* Countdown number - centered */}
      <div className="relative z-10 text-center px-4">
        <div className="text-8xl md:text-9xl font-bold text-white/90 countdown-pop">
          {currentCount}
        </div>
        <p className="text-white/50 text-sm mt-2 tracking-widest uppercase">
          {phase === 'countdown' && 'Siap mengambil foto...'}
          {phase === 'capture' && 'Mengambil gambar...'}
          {phase === 'flash' && 'Sinar flash...'}
        </p>
      </div>

      {/* Decorative dots */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
        {['#1e1e2f', '#1a1a2e', '#16162e'].map((color, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {/* Close button */}
      <button
        className="absolute top-6 right-6 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white/60 hover:text-white transition-colors"
        onClick={() => onComplete()}
      >
        <X className="w-5 h-5" />
      </button>

      {/* Camera feed overlay */}
      <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center pointer-events-none">
        <video
          ref={videoRef}
          className="max-w-full max-h-full"
          playsInline
          muted
          autoPlay
        />
      </div>
    </div>
  )
}
