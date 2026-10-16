'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import IdleScreen from '@/components/IdleScreen'
import CountdownScreen from '@/components/CountdownScreen'
import ResultScreen from '@/components/ResultScreen'
import { useCameraCapture, CapturedPhoto } from '@/lib/camera'

type ScreenState = 'IDLE' | 'COUNTDOWN' | 'RESULT'

interface Photo {
  id: number
  url: string
  color: string
  label: string
}

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('IDLE')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [flashActive, setFlashActive] = useState(false)

  const { videoRef, capture, stop, isCameraReady } = useCameraCapture()

  const transitionToScreen = useCallback((screen: ScreenState) => {
    setCurrentScreen(screen)
    setPhotos([])
    setFlashActive(false)
  }, [])

  const handleStart = useCallback(() => {
    transitionToScreen('COUNTDOWN')
    capturePhotos()
  }, [transitionToScreen])

  const capturePhotos = useCallback(() => {
    const colors = ['#1e1e2f', '#1a1a2e', '#16162e']
    const labels = ['Foto 1', 'Foto 2', 'Foto 3']

    // Simulate 3 photos: each photo takes 3 seconds (1-2-3 countdown)
    let step = 0
    const totalSteps = 3 * 3 // 3 photos, each with 1-2-3 countdown

    const interval = setInterval(() => {
      step++
      const cycle = Math.floor((step - 1) / 3)
      const position = (step - 1) % 3

      if (position === 0 && step > 1) {
        setFlashActive(true)
        setTimeout(() => setFlashActive(false), 500)
      }

      // Capture a photo on each 1 (with real camera)
      if (position === 0 && isCameraReady) {
        const photo = capture()
        if (photo) {
          setPhotos((prev) => {
            const next = [...prev]
            next[cycle] = photo
            return next
          })
        }
      }

      if (step === totalSteps) {
        clearInterval(interval)
        setTimeout(() => {
          transitionToScreen('RESULT')
        }, 500)
      }
    }, 1200)
  }, [isCameraReady, capture])

  useEffect(() => {
    if (currentScreen === 'RESULT') {
      const timer = setTimeout(() => {
        transitionToScreen('IDLE')
      }, 30000)
      return () => clearTimeout(timer)
    }
  }, [currentScreen, transitionToScreen])

  return (
    <div className="kiosk-lock flex items-center justify-center bg-[#0a0a0f]">
      {currentScreen === 'IDLE' && <IdleScreen onStart={handleStart} />}

      {currentScreen === 'COUNTDOWN' && (
        <CountdownScreen
          onComplete={() => transitionToScreen('RESULT')}
          videoRef={videoRef}
        />
      )}

      {currentScreen === 'RESULT' && (
        <ResultScreen
          photos={photos}
          onFinish={() => transitionToScreen('IDLE')}
        />
      )}

      {flashActive && (
        <div className="flash-overlay fixed inset-0 z-[200] bg-white" />
      )}

      {/* Camera feed overlay during countdown */}
      {currentScreen === 'COUNTDOWN' && isCameraReady && (
        <div className="fixed inset-0 z-[300] bg-black/60 flex items-center justify-center pointer-events-none">
          <video
            ref={videoRef}
            className="max-w-full max-h-full"
            playsInline
            muted
            autoPlay
          />
        </div>
      )}
    </div>
  )
}
