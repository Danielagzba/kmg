import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Kiss, Marry, Goodbye - Daily Celebrity Game',
  description: 'Play Kiss Marry Goodbye with celebrities! New challenge every day.',
  openGraph: {
    title: 'Kiss, Marry, Goodbye - Daily Celebrity Game',
    description: 'Play Kiss Marry Goodbye with celebrities! New challenge every day.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0a]">{children}</body>
    </html>
  )
}
