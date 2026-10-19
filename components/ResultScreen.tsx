'use client'

import { useState } from 'react'
import { CheckCircle, Download, X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

interface Photo {
  id: number
  url: string
  color: string
  label: string
}

interface ResultScreenProps {
  photos: Photo[]
  onFinish: () => void
}

export default function ResultScreen({ photos, onFinish }: ResultScreenProps) {
  const [showSuccess, setShowSuccess] = useState(false)

  const handleFinish = () => {
    setShowSuccess(true)
    setTimeout(() => {
      onFinish()
    }, 1000)
  }

  return (
    <div
      className="kiosk-lock flex items-center justify-center bg-[#0a0a0f] relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f]" />

      <div className="relative z-10 flex flex-col items-center justify-center px-4 min-h-screen">
        {showSuccess && (
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center text-white">
              <CheckCircle className="w-20 h-20 text-green-400 mx-auto" />
              <p className="text-2xl mt-4">Foto Tersimpan!</p>
            </div>
          </div>
        )}

        <div className="w-full max-w-5xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              <CheckCircle className="inline w-6 h-6 text-green-400 mr-2" />
              Foto Lengkap
            </h2>
            <button
              onClick={onFinish}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
              <h3 className="text-white/70 text-sm uppercase tracking-widest mb-4">
                Hasil Foto
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group rounded-xl overflow-hidden bg-white/5 border border-white/10"
                  >
                    <img
                      src={photo.url}
                      alt={photo.label}
                      className="w-full h-32 object-cover rounded-xl"
                    />
                    <div className="p-2">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <span className="text-white/40 text-xs font-mono">
                          {photo.id}
                        </span>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                  </div>
                ))}
                {Array.from({ length: Math.max(0, 3 - photos.length) }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="rounded-xl bg-white/5 border border-white/10 flex items-center justify-center h-32"
                  >
                    <span className="text-white/30 text-sm">Kosong</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 flex flex-col items-center justify-center">
              <h3 className="text-white/70 text-sm uppercase tracking-widest mb-4">
                Download
              </h3>
              <div className="w-48 h-48 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                <QRCodeSVG
                  value="https://example.com/download/123"
                  size={180}
                  level="Q"
                  includeMargin
                  bgColor="#0a0a0f"
                  color="#ffffff"
                />
              </div>
              <p className="text-white/70 text-sm mt-4">
                Scan untuk mengunduh
              </p>
              <p className="text-white/50 text-xs mt-2">
                file Foto terbaru
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={handleFinish}
              className={`px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 ${
                showSuccess
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
              }`}
            >
              <span className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {showSuccess ? 'Selesai' : 'Selesai & Reset'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
