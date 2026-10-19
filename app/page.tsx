'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import IdleScreen from '@/components/IdleScreen'
import CountdownScreen from '@/components/CountdownScreen'
import ResultScreen from '@/components/ResultScreen'
import { useCameraCapture } from '@/lib/camera'

type ScreenState = 'IDLE' | 'COUNTDOWN' | 'RESULT'

interface Photo {
  id: number
  url: string
  color: string
  label: string
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
  const flashTimeoutRef = useRef<number | null>(null)

  const { videoRef, capture, error: cameraError, resetCaptureCount } = useCameraCapture()

  const clearFlashTimeout = useCallback(() => {
    if (flashTimeoutRef.current) {
      window.clearTimeout(flashTimeoutRef.current)
      flashTimeoutRef.current = null
    }
  }, [])

  const transitionToScreen = useCallback((screen: ScreenState) => {
    setCurrentScreen(screen)
    if (screen === 'IDLE') {
      setPhotos([])
    }
    if (screen !== 'COUNTDOWN') {
      setFlashActive(false)
      clearFlashTimeout()
    }
  }, [clearFlashTimeout])

  const handleCapture = useCallback((index: number) => {
    const photo = capture()
    if (photo) {
      setPhotos((previous) => {
        const next = [...previous]
        next[index] = photo
        return next
      })
    }

    setFlashActive(true)
    clearFlashTimeout()
    flashTimeoutRef.current = window.setTimeout(() => {
      setFlashActive(false)
      flashTimeoutRef.current = null
    }, 500)
  }, [capture, clearFlashTimeout])

  const handleStart = useCallback(() => {
    setPhotos([])
    setFlashActive(false)
    resetCaptureCount()
    transitionToScreen('COUNTDOWN')
  }, [resetCaptureCount, transitionToScreen])

  const handleCountdownComplete = useCallback(() => {
    transitionToScreen('RESULT')
  }, [transitionToScreen])

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

  useEffect(() => {
    if (photos.length > 0) {
      try {
        localStorage.setItem('photobooth_photos', JSON.stringify(photos))
      } catch (err) {
        console.error('Failed to save to localStorage:', err)
      }
    }
  }, [photos])

  useEffect(() => {
    if (currentScreen === 'RESULT') {
      const timer = window.setTimeout(() => {
        transitionToScreen('IDLE')
      }, 30000)
      return () => window.clearTimeout(timer)
    }
  }, [currentScreen, transitionToScreen])

  return (
    <div className="kiosk-lock flex items-center justify-center bg-[#0a0a0f] overflow-hidden relative">
      {currentScreen === 'IDLE' && <IdleScreen onStart={handleStart} />}

      {currentScreen === 'COUNTDOWN' && (
        <CountdownScreen
          onComplete={handleCountdownComplete}
          onCapture={handleCapture}
          videoRef={videoRef}
          cameraError={cameraError}
        />
      )}

      {currentScreen === 'RESULT' && (
        <ResultScreen
          photos={photos}
          cameraError={cameraError}
          onFinish={() => transitionToScreen('IDLE')}
        />
      )}

      {flashActive && (
        <div className="flash-overlay fixed inset-0 z-[200] bg-white" />
      )}
    </div>
  )
}
