'use client'

import { useState, useEffect, useCallback } from 'react'
import React from 'react'
import IdleScreen from '@/components/IdleScreen'
import CountdownScreen from '@/components/CountdownScreen'
import ResultScreen from '@/components/ResultScreen'

type ScreenState = 'IDLE' | 'COUNTDOWN' | 'RESULT'

interface Photo {
  id: number
  url: string
  color: string
  label: string
}

interface PhotoCapturedEvent {
  photo: Photo
}

// API calls to GPhoto backend
async function fetchGPhotoCapture(config?: {
  shutterSpeed?: number
  iso?: number
  aperture?: number
  mode?: string
}) {
  const res = await fetch('/api/gphoto/capture', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config }),
  })
  return res.json()
}

// Cloudinary upload function
async function uploadToCloudinary(file: File | string, folder: string = 'photobooth') {
  // Placeholder: get Cloudinary credentials from user
  // Replace with your own Cloudinary credentials
  const cloudName = 'dn-p' // ← ganti dengan cloud name kamu
  const uploadPreset = 'photobooth' // ← ganti dengan upload preset kamu

  const formData = new FormData()
  if (typeof file === 'string') {
    formData.append('file', file)
  } else {
    formData.append('file', file)
  }
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', folder)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
    { method: 'POST', body: formData }
  )
  const data = await res.json()
  return data.secure_url || data.url
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

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('IDLE')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [flashActive, setFlashActive] = useState(false)
  const [isCounting, setIsCounting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('photobooth_photos')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setPhotos(parsed)
        }
      } catch (err) {
        console.error('Failed to load photos from localStorage:', err)
      }
    }
  }, [])

  // Save to localStorage when photos change
  useEffect(() => {
    if (photos.length > 0) {
      try {
        localStorage.setItem('photobooth_photos', JSON.stringify(photos))
      } catch (err) {
        console.error('Failed to save to localStorage:', err)
      }
    }
  }, [photos])

  const transitionToScreen = useCallback((screen: ScreenState) => {
    setCurrentScreen(screen)
    if (screen === 'IDLE') {
      setPhotos([])
    }
    setFlashActive(false)
    setIsCounting(false)
  }, [])
  const handleCapture = useCallback(async () => {
    try {
      const photo = await fetchGPhotoCapture()
      // Convert file URL to base64 data URL
      const response = await fetch(photo.url)
      const blob = await response.blob()
      const reader = new FileReader()
      return new Promise<Photo>((resolve) => {
        reader.onloadend = () => {
          resolve({
            id: photo.id,
            url: reader.result as string,
            color: '#1e1e2f',
            label: `Foto ${photo.id}`,
          })
        }
        reader.readAsDataURL(blob)
      })
    } catch (err) {
      console.warn('GPhoto capture failed, using canvas fallback:', err)
      return canvasCapture()
    }
  }, [])

  // Canvas capture fallback (no camera access)
  const canvasCapture = useCallback(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1280
    canvas.height = 720
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 48px sans-serif'
      ctx.fillText('Kamera Tidak Tersedia', 100, 200)
    }
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
    return {
      id: Date.now(),
      url: dataUrl,
      color: '#1e1e2f',
      label: 'Foto',
    } as Photo
  }, [])

  const handleCaptureSequence = useCallback(async () => {
    const colors = ['#1e1e2f', '#1a1a2e', '#16162e']
    const labels = ['Foto 1', 'Foto 2', 'Foto 3']
    const newPhotos: Photo[] = []
    const totalSteps = 3 * 3
    let step = 0

    const interval = setInterval(async () => {
      step++
      const cycle = Math.floor((step - 1) / 3)
      const position = (step - 1) % 3

      if (position === 0 && step > 1) {
        setFlashActive(true)
        setTimeout(() => setFlashActive(false), 500)
      }

      const photo = await handleCapture()
      if (photo) {
        newPhotos[cycle] = {
          id: photo.id,
          url: photo.url,
          color: colors[cycle] || '#1e1e2f',
          label: `Foto ${cycle + 1}`,
        }
      }

      if (step === totalSteps) {
        clearInterval(interval)
        setPhotos(newPhotos)
        setTimeout(() => {
          transitionToScreen('RESULT')
        }, 500)
      }
    }, 1200)

    return () => clearInterval(interval)
  }, [handleCapture, transitionToScreen])

  const handleStart = useCallback(() => {
    transitionToScreen('COUNTDOWN')
    // Start capture sequence
    handleCaptureSequence()
  }, [handleCaptureSequence])

  const handlePhotoCaptured = useCallback((photo: Photo) => {
    // Photo captured, already handled in handleCaptureSequence
  }, [])

  useEffect(() => {
    if (currentScreen === 'RESULT') {
      const timer = setTimeout(() => {
        transitionToScreen('IDLE')
      }, 30000)
      return () => clearTimeout(timer)
    }
  }, [currentScreen, transitionToScreen])

  return (
    <div className="kiosk-lock flex items-center justify-center bg-[#0a0a0f] overflow-hidden relative">
      {currentScreen === 'IDLE' && <IdleScreen onStart={handleStart} />}

      {currentScreen === 'COUNTDOWN' && (
        <CountdownScreen
          onComplete={() => transitionToScreen('RESULT')}
          onPhotoCaptured={handlePhotoCaptured}
        />
      )}

      {currentScreen === 'RESULT' && (
        <ResultScreen
          photos={photos}
          onFinish={() => transitionToScreen('IDLE')}
        />
      )}

      {flashActive && (
        <div className="bg-white" />
      )}
    </div>
  )
}
