'use client'

import { useState, useEffect, useCallback } from 'react'
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

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('IDLE')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [flashActive, setFlashActive] = useState(false)

  const transitionToScreen = useCallback((screen: ScreenState) => {
    setCurrentScreen(screen)
    setPhotos([])
    setFlashActive(false)
  }, [])

  const handleStart = useCallback(() => {
    transitionToScreen('COUNTDOWN')
    setTimeout(() => {
      capturePhotos()
    }, 500)
  }, [transitionToScreen])

  const capturePhotos = useCallback(() => {
    const placeholders = ['#1e1e2f', '#1a1a2e', '#16162e']
    const labels = ['Foto 1', 'Foto 2', 'Foto 3']

    let step = 0
    const totalSteps = 3 * 3

    const interval = setInterval(() => {
      step++
      const cycle = Math.floor((step - 1) / 3)
      const position = (step - 1) % 3

      if (position === 0 && step > 1) {
        setFlashActive(true)
        setTimeout(() => setFlashActive(false), 500)
      }

      if (step === totalSteps) {
        clearInterval(interval)
        setTimeout(() => {
          transitionToScreen('RESULT')
        }, 500)
      }
    }, 1200)
  }, [transitionToScreen])

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
