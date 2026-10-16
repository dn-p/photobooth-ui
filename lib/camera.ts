'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export interface CapturedPhoto {
  id: number
  url: string
  color: string
  label: string
}

export function useCameraCapture() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [capturedCount, setCapturedCount] = useState(0)

  useEffect(() => {
    let isActive = true

    const initCamera = async () => {
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: 'environment',
          },
          audio: false,
        })
        if (isActive) {
          setStream(media)
          setIsCameraReady(true)
          setError(null)
          // Set stream ke video element
          if (videoRef.current) {
            videoRef.current.srcObject = media
          }
        }
      } catch (err) {
        if (isActive) {
          setError('Gagal mengakses kamera. Pastikan izin didapatkan.')
          console.error(err)
        }
      }
    }

    initCamera()

    return () => {
      isActive = false
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const capture = useCallback((): CapturedPhoto | null => {
    if (!videoRef.current) return null

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.drawImage(videoRef.current, 0, 0)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
    const colors = ['#1e1e2f', '#1a1a2e', '#16162e']
    const labels = ['Foto 1', 'Foto 2', 'Foto 3']

    const photo: CapturedPhoto = {
      id: capturedCount + 1,
      url: dataUrl,
      color: colors[capturedCount] || '#1e1e2f',
      label: labels[capturedCount] || 'Foto',
    }

    setCapturedCount((prev) => prev + 1)
    return photo
  }, [capturedCount])

  const stop = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
      setIsCameraReady(false)
      setCapturedCount(0)
    }
  }, [stream])

  return {
    videoRef,
    isCameraReady,
    error,
    capture,
    stop,
  }
}
