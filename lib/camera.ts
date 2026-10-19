'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export interface CapturedPhoto {
  id: number
  url: string
  color: string
  label: string
}

const virtualCameraPattern = /iriun|virtual|obs camera|manycam|splitcam|droidcam|snap camera|xsplit|mmhmm/i
const builtInCameraPattern = /integrated|internal|built.?in|facetime|front camera|user facing/i

export function useCameraCapture() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const capturedCountRef = useRef(0)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [capturedCount, setCapturedCount] = useState(0)
  const attachVideo = useCallback((video: HTMLVideoElement | null) => {
    videoRef.current = video
    const activeStream = streamRef.current
    if (!video || !activeStream) return

    video.srcObject = activeStream
    video.muted = true
    video.playsInline = true
    void video.play().catch((err: unknown) => {
      console.error('Failed to start camera preview', err)
      setError('Kamera aktif tetapi pratinjau tidak dapat diputar.')
    })
  }, [])

  useEffect(() => {
    let isActive = true

    const initCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia || !navigator.mediaDevices.enumerateDevices) {
        if (isActive) {
          setError('Kamera tidak didukung di browser ini.')
        }
        return
      }

      let permissionStream: MediaStream | null = null
      try {
        let cameras = await navigator.mediaDevices.enumerateDevices()
        if (!cameras.some((device) => device.kind === 'videoinput' && device.label.trim())) {
          permissionStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
          cameras = await navigator.mediaDevices.enumerateDevices()
        }

        const physicalCameras = cameras.filter(
          (device) =>
            device.kind === 'videoinput' &&
            device.deviceId &&
            device.label.trim() &&
            !virtualCameraPattern.test(device.label)
        )
        const selectedCamera =
          physicalCameras.find((device) => builtInCameraPattern.test(device.label)) ??
          physicalCameras[0]

        if (!isActive) {
          return
        }

        if (!selectedCamera) {
          throw new Error('No built-in or physical camera found; virtual cameras are excluded.')
        }

        permissionStream?.getTracks().forEach((track) => track.stop())
        permissionStream = null

        const media = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: selectedCamera.deviceId },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        })

        if (!isActive) {
          media.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = media
        setStream(media)
        setIsCameraReady(true)
        setError(null)
      } catch (err) {
        if (isActive) {
          setError(
            err instanceof Error && err.message.includes('No built-in or physical camera')
              ? 'Kamera bawaan tidak ditemukan. Pastikan kamera terhubung dan diizinkan.'
              : 'Gagal mengakses kamera bawaan. Pastikan izin didapatkan.'
          )
          console.error(err)
        }
      } finally {
        permissionStream?.getTracks().forEach((track) => track.stop())
      }
    }

    initCamera()

    return () => {
      isActive = false
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
      setStream(null)
      setIsCameraReady(false)
    }
  }, [])

  useEffect(() => {
    if (videoRef.current && stream) {
      attachVideo(videoRef.current)
    }
  }, [attachVideo, stream])

  const capture = useCallback((): CapturedPhoto | null => {
    const video = videoRef.current
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) return null

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
    const colors = ['#1e1e2f', '#1a1a2e', '#16162e']
    const labels = ['Foto 1', 'Foto 2', 'Foto 3']
    const nextIndex = capturedCountRef.current

    const photo: CapturedPhoto = {
      id: nextIndex + 1,
      url: dataUrl,
      color: colors[nextIndex] || '#1e1e2f',
      label: labels[nextIndex] || 'Foto',
    }

    capturedCountRef.current += 1
    setCapturedCount(nextIndex + 1)
    return photo
  }, [])

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    setStream(null)
    setIsCameraReady(false)
    setCapturedCount(0)
    capturedCountRef.current = 0
  }, [])

  useEffect(() => {
    capturedCountRef.current = capturedCount
  }, [capturedCount])

  return {
    videoRef: attachVideo,
    isCameraReady,
    error,
    capture,
    stop,
  }
}
