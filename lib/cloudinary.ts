'use client'

export interface CloudinaryUploadResult {
  success: boolean
  url?: string
  error?: string
}

export function isCloudinaryConfigured(): boolean {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  return Boolean(cloudName && uploadPreset)
}

export async function uploadToCloudinary(
  fileDataUrl: string
): Promise<CloudinaryUploadResult> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    return {
      success: false,
      error:
        'Kredensial Cloudinary belum diatur. Silakan atur NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME dan NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET di .env.local',
    }
  }

  try {
    const formData = new FormData()
    formData.append('file', fileDataUrl)
    formData.append('upload_preset', uploadPreset)
    formData.append('folder', 'photobooth')

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.message || 'Gagal mengunggah ke Cloudinary',
      }
    }

    return {
      success: true,
      url: data.secure_url || data.url,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Kesalahan jaringan'
    return {
      success: false,
      error: message,
    }
  }
}
