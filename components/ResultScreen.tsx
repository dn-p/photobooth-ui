'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  CheckCircle,
  Download,
  X,
  Loader2,
  RefreshCw,
  Cloud,
  Sparkles,
  Smartphone,
  AlertCircle,
  QrCode,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { generatePhotoStrip, downloadDataUrl } from '@/lib/photoStrip'
import { uploadToCloudinary, isCloudinaryConfigured } from '@/lib/cloudinary'

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
  const [activeTab, setActiveTab] = useState<'strip' | 'individual'>('strip')
  const [stripTheme, setStripTheme] = useState<'white' | 'dark'>('white')
  const [stripUrl, setStripUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedCloudUrl, setUploadedCloudUrl] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Generate Photo Strip
  const createStrip = useCallback(
    async (theme: 'white' | 'dark') => {
      if (photos.length === 0) return null
      setIsGenerating(true)
      try {
        const photoUrls = photos.map((p) => p.url)
        const strip = await generatePhotoStrip(photoUrls, {
          theme,
          title: 'PHOTOBOOTH',
          subtitle: 'Sweet Memories',
        })
        setStripUrl(strip)
        return strip
      } catch (err) {
        console.error('Gagal membuat photo strip:', err)
        return null
      } finally {
        setIsGenerating(false)
      }
    },
    [photos]
  )

  // Upload to Cloudinary
  const handleUpload = useCallback(async (dataUrlToUpload: string) => {
    if (!isCloudinaryConfigured()) {
      setUploadError('Cloudinary belum dikonfigurasi di file .env.local')
      return
    }

    setIsUploading(true)
    setUploadError(null)

    const result = await uploadToCloudinary(dataUrlToUpload)

    if (result.success && result.url) {
      setUploadedCloudUrl(result.url)
    } else {
      setUploadError(result.error || 'Gagal mengunggah foto ke Cloudinary')
    }
    setIsUploading(false)
  }, [])

  // Initial generation and upload
  useEffect(() => {
    let isCancelled = false

    const run = async () => {
      const generated = await createStrip(stripTheme)
      if (!isCancelled && generated) {
        await handleUpload(generated)
      }
    }

    void run()

    return () => {
      isCancelled = true
    }
  }, [createStrip, handleUpload, stripTheme])

  const handleThemeChange = async (newTheme: 'white' | 'dark') => {
    if (newTheme === stripTheme) return
    setStripTheme(newTheme)
    setUploadedCloudUrl(null)
    const newStrip = await createStrip(newTheme)
    if (newStrip) {
      await handleUpload(newStrip)
    }
  }

  const handleFinish = () => {
    setShowSuccess(true)
    setTimeout(() => {
      onFinish()
    }, 800)
  }

  const handleDownloadStrip = () => {
    if (stripUrl) {
      downloadDataUrl(stripUrl, `photobooth-strip-${Date.now()}.jpg`)
    }
  }

  const handleDownloadSinglePhoto = (photo: Photo, index: number) => {
    downloadDataUrl(photo.url, `photo-${index + 1}-${Date.now()}.jpg`)
  }

  return (
    <div className="kiosk-lock flex items-center justify-center bg-[#0a0a0f] relative overflow-y-auto py-8">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#141428] to-[#0a0a0f] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center px-4 w-full max-w-6xl">
        {/* Success splash animation */}
        {showSuccess && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center">
            <div className="text-center text-white p-8 rounded-3xl bg-white/5 border border-white/10 animate-in zoom-in-95 duration-200">
              <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto animate-bounce" />
              <p className="text-3xl font-bold mt-4">Terima Kasih!</p>
              <p className="text-white/60 text-sm mt-1">Kembali ke layar utama...</p>
            </div>
          </div>
        )}

        {/* Header Bar */}
        <div className="w-full flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-wide">
                Hasil Foto Anda
              </h2>
              <p className="text-xs text-white/50">
                Pilih tampilan strip atau foto satuan, scan QR untuk unduh ke ponsel
              </p>
            </div>
          </div>

          <button
            onClick={onFinish}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors border border-white/10"
            title="Tutup / Kembali"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Preview (Photo Strip / Individual Photos) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Tab & Theme Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('strip')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'strip'
                      ? 'bg-white/20 text-white shadow-md'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Photo Strip
                </button>
                <button
                  onClick={() => setActiveTab('individual')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'individual'
                      ? 'bg-white/20 text-white shadow-md'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Foto Satuan ({photos.length})
                </button>
              </div>

              {activeTab === 'strip' && (
                <div className="flex items-center gap-1.5 text-xs text-white/70">
                  <span className="mr-1">Tema:</span>
                  <button
                    onClick={() => handleThemeChange('white')}
                    className={`px-3 py-1.5 rounded-lg border transition-all ${
                      stripTheme === 'white'
                        ? 'bg-white text-black font-semibold border-white shadow-sm'
                        : 'border-white/20 text-white/60 hover:text-white'
                    }`}
                  >
                    Putih
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`px-3 py-1.5 rounded-lg border transition-all ${
                      stripTheme === 'dark'
                        ? 'bg-black text-white font-semibold border-white/50 shadow-sm'
                        : 'border-white/20 text-white/60 hover:text-white'
                    }`}
                  >
                    Hitam
                  </button>
                </div>
              )}
            </div>

            {/* Preview Box */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 flex flex-col items-center justify-center min-h-[440px]">
              {activeTab === 'strip' ? (
                <div className="flex flex-col items-center w-full">
                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center py-20 text-white/60 gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                      <p className="text-sm">Menyiapkan Photo Strip...</p>
                    </div>
                  ) : stripUrl ? (
                    <div className="flex flex-col items-center gap-4">
                      {/* Scaled Photo Strip frame preview */}
                      <div className="relative group max-h-[500px] rounded-xl overflow-hidden shadow-2xl border border-white/15 bg-black/40">
                        <img
                          src={stripUrl}
                          alt="Photo Strip"
                          className="h-[480px] w-auto object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                        />
                      </div>

                      <button
                        onClick={handleDownloadStrip}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium border border-white/15 transition-all shadow-md active:scale-95"
                      >
                        <Download className="w-4 h-4 text-purple-400" />
                        Unduh Strip ke Komputer
                      </button>
                    </div>
                  ) : (
                    <p className="text-white/40 text-sm">Tidak ada foto</p>
                  )}
                </div>
              ) : (
                /* Individual Photos Grid */
                <div className="w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {photos.map((photo, idx) => (
                      <div
                        key={photo.id || idx}
                        className="group relative rounded-xl overflow-hidden bg-white/5 border border-white/10 flex flex-col shadow-lg"
                      >
                        <img
                          src={photo.url}
                          alt={photo.label}
                          className="w-full aspect-[4/3] object-cover"
                        />
                        <div className="p-2 flex items-center justify-between bg-black/40 border-t border-white/5">
                          <span className="text-xs font-mono text-white/60">
                            Foto #{idx + 1}
                          </span>
                          <button
                            onClick={() => handleDownloadSinglePhoto(photo, idx)}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/25 text-white/80 hover:text-white transition"
                            title="Unduh foto ini"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: QR Code & Cloud Download */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 flex flex-col items-center text-center">
              <div className="flex items-center gap-2 mb-3">
                <Cloud className="w-5 h-5 text-purple-400" />
                <h3 className="text-white text-base font-semibold tracking-wide">
                  Download ke Smartphone
                </h3>
              </div>
              <p className="text-white/60 text-xs mb-6 max-w-xs">
                Arahkan kamera smartphone Anda ke QR Code untuk mengunduh Photo Strip resolusi tinggi
              </p>

              {/* QR Code Container */}
              <div className="relative w-56 h-56 rounded-2xl bg-white p-3 shadow-2xl flex items-center justify-center overflow-hidden">
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center gap-3 text-gray-700">
                    <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
                    <span className="text-xs font-semibold text-gray-600">
                      Mengunggah ke Cloud...
                    </span>
                  </div>
                ) : uploadedCloudUrl ? (
                  <QRCodeSVG
                    value={uploadedCloudUrl}
                    size={200}
                    level="Q"
                    includeMargin
                    bgColor="#ffffff"
                    fgColor="#0a0a0f"
                  />
                ) : (
                  /* Fallback or Setup Required State */
                  <div className="flex flex-col items-center justify-center text-center p-3">
                    <QrCode className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-xs font-medium text-gray-600">
                      QR Siap Aktif
                    </span>
                  </div>
                )}
              </div>

              {/* Status / Cloudinary Feedback */}
              <div className="mt-5 w-full">
                {uploadedCloudUrl ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Tersimpan di Cloudinary
                    </div>
                    <a
                      href={uploadedCloudUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-300 hover:text-purple-200 underline mt-1 break-all line-clamp-1 max-w-xs"
                    >
                      Buka Link Unduhan
                    </a>
                  </div>
                ) : uploadError ? (
                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-left">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-200/90 leading-relaxed">
                        <p className="font-semibold text-amber-300">
                          Pengaturan Cloudinary Diperlukan
                        </p>
                        <p className="mt-1 text-white/70">
                          {uploadError}
                        </p>
                      </div>
                    </div>
                    {stripUrl && isCloudinaryConfigured() && (
                      <button
                        onClick={() => handleUpload(stripUrl)}
                        className="mt-3 w-full py-1.5 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-medium flex items-center justify-center gap-1.5 transition"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Coba Upload Lagi
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-white/60 text-xs">
                    <Smartphone className="w-4 h-4 text-purple-400" />
                    <span>Scan kamera HP langsung tanpa aplikasi khusus</span>
                  </div>
                )}
              </div>
            </div>

            {/* Finish & Reset Button */}
            <button
              onClick={handleFinish}
              className={`w-full py-3.5 px-6 rounded-2xl font-semibold text-white shadow-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                showSuccess
                  ? 'bg-emerald-500 shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-500/25 active:scale-[0.99]'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span>Selesai & Mulai Sesi Baru</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
