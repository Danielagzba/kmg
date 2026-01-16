import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Kiss, Marry, Kill - Daily Celebrity Game',
  description: 'Play Kiss Marry Kill with celebrities! New challenge every day.',
  openGraph: {
    title: 'Kiss, Marry, Kill - Daily Celebrity Game',
    description: 'Play Kiss Marry Kill with celebrities! New challenge every day.',
    type: 'website',
  },
}

// Script to prevent flash of wrong theme
const themeScript = `
  (function() {
    function getTheme() {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', getTheme());
  })();
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-[100dvh] bg-[var(--bg-primary)] overflow-hidden">
        {children}
      </body>
    </html>
  )
}
