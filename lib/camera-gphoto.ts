// Server-only: gphoto2 backend integration
// This file runs on the server, not in the browser
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface CameraConfig {
  shutterSpeed: number // 1/1000s = 1000
  iso: number
  aperture: number // f/2.8 = 2.8
  mode: 'Av' | 'Tv' | 'M' | 'P'
  jpegQuality: number
}

export interface CapturedPhoto {
  id: number
  path: string // path to the captured file
  url: string // file URL
  timestamp: string
}

export class GPhotoCamera {
  private cameraId: string
  private config: CameraConfig = {
    shutterSpeed: 6000, // 1/6000s
    iso: 100,
    aperture: 4.0,
    mode: 'Av',
    jpegQuality: 85,
  }

  constructor(cameraId = '0') {
    this.cameraId = cameraId
  }

  // Setter untuk config
  setShutterSpeed(speed: number) {
    this.config.shutterSpeed = speed
    return this
  }

  setISO(iso: number) {
    this.config.iso = iso
    return this
  }

  setAperture(aperture: number) {
    this.config.aperture = aperture
    return this
  }

  setMode(mode: 'Av' | 'Tv' | 'M' | 'P') {
    this.config.mode = mode
    return this
  }

  setJpegQuality(quality: number) {
    this.config.jpegQuality = quality
    return this
  }

  // Get camera list
  async listCameras() {
    try {
      const { stdout } = await execAsync('gphoto2 --auto-detect')
      return stdout
    } catch (err) {
      console.error('gphoto2 list failed:', err)
      return ''
    }
  }

  // Set config values
  async setConfig(config: string, value: string | number) {
    try {
      await execAsync(
        `gphoto2 --set-config ${config} --set-config-value ${value}`
      )
    } catch (err) {
      console.error(`Failed to set ${config}:`, err)
      throw err
    }
  }

  // Get current config
  async getConfig() {
    try {
      const { stdout } = await execAsync('gphoto2 --list-config')
      return stdout
    } catch (err) {
      return ''
    }
  }

  // Capture image
  async capture() {
    const timestamp = new Date().toISOString()
    const filename = `/tmp/photo-${Date.now()}.jpg`
    const quality = this.config.jpegQuality

    const args = [
      '--set-config shutter',
      `--set-config-value ${this.config.shutterSpeed}`,
      '--set-config iso',
      `--set-config-value ${this.config.iso}`,
      '--set-config aperture',
      `--set-config-value ${this.config.aperture}`,
      '--set-config mode',
      `--set-config-value ${this.config.mode}`,
      '--set-config jpeg-quality',
      `--set-config-value ${quality}`,
      '--capture-image-and-download',
      `--filename ${filename}`,
    ].join(' ')

    try {
      await execAsync(args)
      const url = `file://${filename}`
      return {
        id: Date.now(),
        path: filename,
        url,
        timestamp,
      }
    } catch (err) {
      console.error('Capture failed:', err)
      throw err
    }
  }

  // Capture multiple photos with delay
  async captureSequence(count: number, delay = 1000) {
    const photos: CapturedPhoto[] = []
    for (let i = 0; i < count; i++) {
      const photo = await this.capture()
      photos.push(photo)
      if (i < count - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
    return photos
  }

  // Cleanup
  async cleanup() {
    try {
      await execAsync('gphoto2 --restore-config')
    } catch (err) {
      console.error('Cleanup failed:', err)
    }
  }
}

// Singleton instance
let instance: GPhotoCamera | null = null

export function getCamera(cameraId = '0') {
  if (!instance) {
    instance = new GPhotoCamera(cameraId)
  }
  return instance
}
