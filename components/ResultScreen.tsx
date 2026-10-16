'use client'

import { useState } from 'react'
import React from 'react'
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

// Export photos to JSON file
function exportPhotos(photos: Photo[]) {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    photos,
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `photobooth-export-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// Import photos from JSON file
function importPhotos(file: File) {
  return new Promise<Photo[]>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.photos && Array.isArray(data.photos)) {
          resolve(data.photos)
        } else {
          reject(new Error('Invalid file format'))
        }
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

export default function ResultScreen({ photos, onFinish }: ResultScreenProps) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleFinish = () => {
    setShowSuccess(true)
    setTimeout(() => {
      onFinish()
    }, 1000)
  }

  const handleExport = () => {
    exportPhotos(photos)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      importPhotos(file).then((imported) => {
        // Reset state and import photos
        window.location.reload()
      }).catch((err) => {
        console.error('Import failed:', err)
      })
    }
  }

  return (
    <div
      className="kiosk-lock flex items-center justify-center bg-[#0a0a0f] relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f]" />

      <div className="relative z-10 flex flex-col items-center justify-center px-4 min-h-screen">
        {/* Success overlay */}
        {showSuccess && (
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center text-white">
              <CheckCircle className="w-20 h-20 text-green-400 mx-auto" />
              <p className="text-2xl mt-4">Foto Tersimpan!</p>
            </div>
          </div>
        )}

        <div className="w-full max-w-5xl">
          {/* Header */}
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

          {/* Main content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Photo Grid (2x2) */}
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
                    <div
                      className="w-full h-32 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#2d2d44] flex items-center justify-center"
                      style={{ backgroundColor: photo.color }}
                    >
                      <span className="text-white/60 text-sm font-medium">
                        {photo.label}
                      </span>
                    </div>
                    <div className="p-2">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <span className="text-white/40 text-xs font-mono">
                          {photo.id}
                        </span>
                      </div>
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                  </div>
                ))}
                {photos.length < 3 && (
                  <div className="rounded-xl bg-white/5 border border-white/10 flex items-center justify-center h-32">
                    <span className="text-white/30 text-sm">Kosong</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: QR Code */}
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

          {/* Bottom action buttons */}
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
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
            
            {/* Export/Import buttons */}
            <button
              onClick={handleExport}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              📥 Export
            </button>
            
            <label className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer">
              📥 Import
              <input
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleImport}
              />
            </label>

            {/* Cloudinary Upload */}
            <button
              onClick={() => {
                alert('Cloudinary upload: need to configure cloudName & uploadPreset')
              }}
              className="px-4 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            >
              ☁️ Upload Cloudinary
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
