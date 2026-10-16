'use client'

import { useRef, useEffect, useState } from 'react'
import { Camera, X } from 'lucide-react'

interface CameraFeedProps {
  onCapture: (dataUrl: string, color: string, label: string, index: number) => void
  isReady: boolean
}

export default function CameraFeed({ onCapture, isReady }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const animationTimer = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!isReady) return

    const interval = setInterval(() => {
      if (videoRef.current?.videoWidth && videoRef.current?.videoHeight) {
        // Auto-capture on each ready state, handled by parent countdown
      }
    }, 300)

    return () => clearInterval(interval)
  }, [isReady])

  return (
    <div className="relative w-full max-w-4xl aspect-video bg-[#1a1a2e] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
      {/* Background pattern */}
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

      {/* Video feed */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
        autoPlay
      />

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="text-center text-white p-4">
            <p className="text-lg font-semibold">{error}</p>
            <button
              className="mt-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
              onClick={() => setError(null)}
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      {/* Lens overlay */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/10">
        <div className="w-14 h-14 rounded-full bg-black/30 flex items-center justify-center">
          <Camera className="w-7 h-7 text-white/60" />
        </div>
      </div>

      {/* Capture button */}
      <button
        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all"
        onClick={() => {
          if (videoRef.current?.videoWidth && videoRef.current?.videoHeight) {
            const canvas = document.createElement('canvas')
            canvas.width = videoRef.current.videoWidth
            canvas.height = videoRef.current.videoHeight
            const ctx = canvas.getContext('2d')
            if (ctx) {
              ctx.drawImage(videoRef.current, 0, 0)
              const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
              onCapture(dataUrl, '#1e1e2f', 'Foto', 0)
            }
          }
        }}
        title="Capture"
      >
        <Camera className="w-6 h-6 text-white" />
      </button>
    </div>
  )
}
