'use client'

import { cn } from '@/lib/utils'

interface IdleScreenProps {
  onStart: () => void
}

export default function IdleScreen({ onStart }: IdleScreenProps) {
  return (
    <div
      className="kiosk-lock flex flex-col items-center justify-center bg-[#0a0a0f] relative overflow-hidden"
      onClick={onStart}
    >
      {/* Premium dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] opacity-80" />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.02)_1px,_transparent_1px)] [background-size:24px_24px]" />

      {/* Left side decorative element */}
      <div className="absolute top-1/4 left-0 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl" />

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
        {/* Logo / Badge */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30 pulse-glow">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 9a2 2 0 012-2h.93a2 2 0 011.664.342l.03.03a2 2 0 011.927.613l.638 1.277a2 2 0 01.342 1.664l-.03.03a2 2 0 01-.342 1.664l-.638 1.277a2 2 0 01-1.664.342l-.03-.03a2 2 0 01-1.927-.613l-.03-.03a2 2 0 01-.613-1.927l.03-.03a2 2 0 01-.342-1.664l.03-.03a2 2 0 01-.613-1.927z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 9a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-widest text-white/80 uppercase">
            Photobooth
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 tracking-wide">
          KIOSK
        </h1>

        <p className="text-white/50 text-lg md:text-2xl mb-12 max-w-md">
          Potret Terbaik Anda
        </p>

        {/* Start Button */}
        <button
          className={cn(
            'px-12 py-4 rounded-2xl text-white font-semibold text-lg tracking-wide',
            'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
            'shadow-xl shadow-purple-500/30 pulse-glow',
            'transition-all duration-200 active:scale-95',
            'cursor-pointer'
          )}
        >
          <span className="flex items-center gap-3">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 9a2 2 0 012-2h.93a2 2 0 011.664.342l.03.03a2 2 0 011.927.613l.638 1.277a2 2 0 01.342 1.664l-.03.03a2 2 0 01-.342 1.664l-.638 1.277a2 2 0 01-1.664.342l-.03-.03a2 2 0 01-.613-1.927z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 9a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Pertama Kali
          </span>
        </button>

        {/* Hint */}
        <p className="text-white/30 text-sm mt-8 tracking-wide">
          Tekan layar untuk memulai
        </p>
      </div>

      {/* Bottom decorative gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
    </div>
  )
}
