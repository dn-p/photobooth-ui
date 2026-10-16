'use client'

import { useState, useEffect } from 'react'
import { Camera, X } from 'lucide-react'

interface CountdownScreenProps {
  onComplete: () => void
}

export default function CountdownScreen({ onComplete }: CountdownScreenProps) {
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

  const flashStyle = {
    animation: 'flash 0.5s ease-out',
  }

  return (
    <div
      className="kiosk-lock flex flex-col items-center justify-center bg-[#0a0a0f] relative min-h-screen"
    >
      {/* Placeholder Camera Feed */}
      <div className="relative w-full max-w-4xl aspect-video bg-[#1a1a2e] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
        {/* Placeholder image or solid color */}
        <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#2d2d44] flex items-center justify-center relative overflow-hidden">
          {/* Decorative camera elements */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxLjA1Ii8+PGNpcmNsZSBjeD0iNjAiIGN5PSIyMCIgcj0iMSIgb3BhY2l0eT0iLjUwIi8+PC9zdmc+')] opacity-5" />

          {/* Camera grid lines */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-px">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className={`bg-white/10 rounded-[2px] ${i === 4 ? 'bg-white/30' : ''}`}
              />
            ))}
          </div>

          {/* Main content */}
          <div className="relative z-10 text-center">
            <div className="text-5xl md:text-7xl font-bold text-white/90 countdown-pop">
              {currentCount}
            </div>
            <p className="text-white/50 text-sm mt-2 tracking-widest">
              {phase === 'countdown' && 'Siap mengambil foto...'}
              {phase === 'capture' && 'Mengambil gambar...'}
              {phase === 'flash' && 'Sinar flash...'}
            </p>
          </div>

          {/* Lens circle */}
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <div className="w-14 h-14 rounded-full bg-black/30 flex items-center justify-center">
              <Camera className="w-7 h-7 text-white/60" />
            </div>
          </div>
        </div>
      </div>

      {/* Timer / Status bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
        <span className="text-white/40 text-sm tracking-widest uppercase">
          {phase === 'countdown' && 'Siap...'}
          {phase === 'capture' && 'Mengambil...'}
          {phase === 'flash' && 'Flash...'}
        </span>
      </div>

      {/* Close button */}
      <button
        className="absolute top-6 right-6 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white/60 hover:text-white transition-colors"
        onClick={() => onComplete()}
      >
        <X className="w-5 h-5" />
      </button>

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
    </div>
  )
}
