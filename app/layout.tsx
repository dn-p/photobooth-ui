import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Photobooth Pro Kiosk',
  description: 'Kiosk photo booth application for desktop',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="kiosk-lock">{children}</body>
    </html>
  )
}
