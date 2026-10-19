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

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('IDLE')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [flashActive, setFlashActive] = useState(false)
  const flashTimeoutRef = useRef<number | null>(null)

  const { videoRef, capture, error: cameraError } = useCameraCapture()

  const clearFlashTimeout = useCallback(() => {
    if (flashTimeoutRef.current) {
      window.clearTimeout(flashTimeoutRef.current)
      flashTimeoutRef.current = null
    }
  }, [])

  const transitionToScreen = useCallback((screen: ScreenState) => {
    setCurrentScreen(screen)
    if (screen !== 'RESULT') {
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
    transitionToScreen('COUNTDOWN')
  }, [transitionToScreen])

  const handleCountdownComplete = useCallback(() => {
    transitionToScreen('RESULT')
  }, [transitionToScreen])

  useEffect(() => {
    if (currentScreen === 'RESULT') {
      const timer = window.setTimeout(() => {
        transitionToScreen('IDLE')
      }, 30000)
      return () => window.clearTimeout(timer)
    }
  }, [currentScreen, transitionToScreen])

  return (
    <div className="kiosk-lock flex items-center justify-center bg-[#0a0a0f]">
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
          onFinish={() => transitionToScreen('IDLE')}
        />
      )}

      {flashActive && (
        <div className="flash-overlay fixed inset-0 z-[200] bg-white" />
      )}
    </div>
  )
}
