'use client'

export interface PhotoStripConfig {
  theme?: 'white' | 'dark'
  title?: string
  subtitle?: string
  dateString?: string
}

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = (err) => reject(err)
    img.src = src
  })
}

/**
 * Helper to draw a rounded rectangle on Canvas 2D context
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

/**
 * Draws an image into a rectangle maintaining aspect ratio (center-crop)
 */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius = 0
) {
  const imgRatio = img.width / img.height
  const targetRatio = w / h
  let sWidth = img.width
  let sHeight = img.height
  let sx = 0
  let sy = 0

  if (imgRatio > targetRatio) {
    sWidth = img.height * targetRatio
    sx = (img.width - sWidth) / 2
  } else {
    sHeight = img.width / targetRatio
    sy = (img.height - sHeight) / 2
  }

  ctx.save()
  if (radius > 0) {
    drawRoundedRect(ctx, x, y, w, h, radius)
    ctx.clip()
  }
  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h)
  ctx.restore()
}

/**
 * Generates a vertical 3-photo strip (high-resolution canvas)
 */
export async function generatePhotoStrip(
  photoUrls: string[],
  config: PhotoStripConfig = {}
): Promise<string> {
  const {
    theme = 'white',
    title = 'PHOTOBOOTH',
    subtitle = 'MEMORIES',
    dateString = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
  } = config

  // Canvas dimensions (high-res 2:6 photobooth strip)
  const stripWidth = 800
  const stripHeight = 2400

  const canvas = document.createElement('canvas')
  canvas.width = stripWidth
  canvas.height = stripHeight
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Canvas 2D context tidak tersedia')
  }

  // Color schemes
  const isDark = theme === 'dark'
  const bgColor = isDark ? '#111116' : '#ffffff'
  const textColor = isDark ? '#ffffff' : '#111116'
  const subtextColor = isDark ? '#888899' : '#666677'
  const borderColor = isDark ? '#22222c' : '#eaeaea'

  // Fill background
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, stripWidth, stripHeight)

  // Subtle outer border
  ctx.strokeStyle = borderColor
  ctx.lineWidth = 4
  ctx.strokeRect(10, 10, stripWidth - 20, stripHeight - 20)

  // Layout calculations
  const marginX = 50
  const marginTop = 60
  const photoWidth = stripWidth - marginX * 2 // 700px
  const photoHeight = 525 // 4:3 aspect ratio (700 x 525)
  const photoGap = 35
  const borderRadius = 16

  // Load and draw photos
  for (let i = 0; i < 3; i++) {
    const photoY = marginTop + i * (photoHeight + photoGap)

    // Photo placeholder background
    ctx.fillStyle = isDark ? '#1a1a24' : '#f4f4f7'
    drawRoundedRect(ctx, marginX, photoY, photoWidth, photoHeight, borderRadius)
    ctx.fill()

    if (photoUrls[i]) {
      try {
        const img = await loadImage(photoUrls[i])
        drawImageCover(ctx, img, marginX, photoY, photoWidth, photoHeight, borderRadius)
      } catch (err) {
        console.error(`Gagal memuat foto ke-${i + 1}`, err)
      }
    } else {
      // Empty slot text
      ctx.fillStyle = subtextColor
      ctx.font = '500 28px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`Foto ${i + 1}`, stripWidth / 2, photoY + photoHeight / 2)
    }

    // Optional border around each photo
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
    ctx.lineWidth = 2
    drawRoundedRect(ctx, marginX, photoY, photoWidth, photoHeight, borderRadius)
    ctx.stroke()
  }

  // Footer section
  const footerStartY = marginTop + 3 * photoHeight + 2 * photoGap + 60

  // Divider line
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(marginX + 60, footerStartY)
  ctx.lineTo(stripWidth - marginX - 60, footerStartY)
  ctx.stroke()

  // Branding Title
  ctx.fillStyle = textColor
  ctx.font = '800 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.letterSpacing = '8px'
  ctx.fillText(title, stripWidth / 2, footerStartY + 65)

  // Subtitle / Tagline
  ctx.fillStyle = subtextColor
  ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.letterSpacing = '4px'
  ctx.fillText(subtitle.toUpperCase(), stripWidth / 2, footerStartY + 120)

  // Date
  ctx.fillStyle = subtextColor
  ctx.font = '500 22px monospace'
  ctx.letterSpacing = '2px'
  ctx.fillText(dateString, stripWidth / 2, footerStartY + 165)

  return canvas.toDataURL('image/jpeg', 0.95)
}

/**
 * Triggers a direct browser download for a data URL
 */
export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
