'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Camera, X } from 'lucide-react'

interface Photo {
  id: number
  url: string
  color: string
  label: string
}

interface CountdownScreenProps {
  onComplete: () => void
  onPhotoCaptured: (photo: Photo) => void
}

export default function CountdownScreen({ onComplete, onPhotoCaptured }: CountdownScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentCount, setCurrentCount] = useState(3)
  const [phase, setPhase] = useState<'countdown' | 'capture' | 'flash'>('countdown')

  // Camera init
  useEffect(() => {
    let isActive = true

    const initCamera = async () => {
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' },
          audio: false,
        })
        if (isActive && videoRef.current) {
          videoRef.current.srcObject = media
        }
      } catch (err) {
        console.error('Camera init failed:', err)
      }
    }

    initCamera()

    return () => {
      isActive = false
      if (videoRef.current) {
        const stream = videoRef.current.srcObject as MediaStream
        stream?.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Countdown logic (3-2-1 per photo, 3 photos total)
  useEffect(() => {
    const totalSteps = 3 * 3 // 3 photos x 3 countdown
    let step = 0
    let interval: ReturnType<typeof setInterval> | null = null

    const startCountdown = () => {
      if (interval) {
        clearInterval(interval)
      }
      step = 0
      interval = setInterval(() => {
        step++
        const cycle = Math.floor((step - 1) / 3)
        const position = step % 3

        // Show countdown: 3, 2, 1
        const count = position === 0 ? 3 : (position === 1 ? 2 : 1)
        setCurrentCount(count)
        setPhase('countdown')

        if (step === totalSteps) {
          clearInterval(interval!)
          setCurrentCount(0)
          setTimeout(() => {
            onComplete()
          }, 300)
        }
      }, 1000)
    }

    startCountdown()

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [onComplete])

  return (
    <div
      className="kiosk-lock flex flex-col items-center justify-center bg-[#0a0a0f] relative min-h-screen"
    >
      {/* Countdown number - centered */}
      <div className="relative z-[200] text-center px-4">
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

      {/* Camera feed background */}
      <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center pointer-events-none">
        <video
          ref={videoRef}
          className="max-w-full max-h-full"
          playsInline
          muted
          autoPlay
        />
        {/* Rule of Thirds Grid */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Horizontal lines */}
          <div className="absolute top-[33.333%] left-0 right-0 h-px bg-white/30" />
          <div className="absolute bottom-[33.333%] left-0 right-0 h-px bg-white/30" />
          {/* Vertical lines */}
          <div className="absolute top-0 left-[33.333%] bottom-0 w-px bg-white/30" />
          <div className="absolute top-0 right-[33.333%] bottom-0 w-px bg-white/30" />
        </div>
      </div>
    </div>
  )
}
