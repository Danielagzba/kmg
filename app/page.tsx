'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import GameBoard from '@/components/GameBoard'
import GameModeSelector from '@/components/GameModeSelector'
import ThemeToggle from '@/components/ThemeToggle'
import { DailyCelebrity, DailyCelebritiesResponse } from '@/app/api/celebrities/route'
import { decodeChoices } from '@/lib/storage'

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-[var(--bg-secondary)] rounded-lg ${className}`}
      style={{
        backgroundImage: 'linear-gradient(90deg, var(--bg-secondary) 0%, var(--bg-card) 50%, var(--bg-secondary) 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  )
}

function LoadingScreen() {
  return (
    <main className="h-[100dvh] flex flex-col bg-[var(--bg-primary)] overflow-hidden">
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Top bar skeleton */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-2 sm:px-6 sm:py-3">
        <SkeletonPulse className="w-32 h-9 rounded-full" />
        <SkeletonPulse className="w-9 h-9 rounded-full" />
      </header>

      {/* Main content skeleton */}
      <div className="flex-1 flex flex-col items-center justify-between px-3 py-2 sm:px-4 sm:py-4 min-h-0">
        {/* Header skeleton */}
        <div className="text-center flex-shrink-0">
          <SkeletonPulse className="w-48 sm:w-64 h-8 sm:h-10 mx-auto mb-2" />
          <SkeletonPulse className="w-40 sm:w-48 h-4 mx-auto mb-2" />
          <SkeletonPulse className="w-24 h-3 mx-auto" />
        </div>

        {/* Celebrity cards skeleton */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 w-full py-2 sm:py-4">
          <div className="flex justify-center gap-2 sm:gap-4 mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <SkeletonPulse className="w-24 h-32 sm:w-28 sm:h-38 md:w-32 md:h-44 rounded-xl sm:rounded-2xl" />
              </div>
            ))}
          </div>
          <SkeletonPulse className="w-32 h-4" />
        </div>

        {/* Choice slots skeleton */}
        <div className="flex-shrink-0 w-full max-w-md">
          <div className="flex justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-dashed border-[var(--border-secondary)]">
                <SkeletonPulse className="w-10 h-3 rounded" />
                <SkeletonPulse className="w-14 h-20 sm:w-16 sm:h-22 rounded-lg sm:rounded-xl" />
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <SkeletonPulse className="w-32 h-10 sm:w-40 sm:h-12 rounded-full" />
          </div>
        </div>
      </div>

      {/* Footer skeleton */}
      <footer className="flex-shrink-0 py-2 text-center border-t border-[var(--border-secondary)]">
        <SkeletonPulse className="w-20 h-3 mx-auto" />
      </footer>
    </main>
  )
}

function HomeContent() {
  const searchParams = useSearchParams()
  const [gameMode, setGameMode] = useState<'women' | 'men'>('women')
  const [celebrities, setCelebrities] = useState<DailyCelebrity[] | null>(null)
  const [date, setDate] = useState<string>('')
  const [theme, setTheme] = useState<string | undefined>()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sharedChoices, setSharedChoices] = useState<{
    date: string
    choices: { fuck: number; marry: number; kill: number }
  } | null>(null)

  const fetchCelebrities = useCallback(async (mode: 'women' | 'men') => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/celebrities?mode=${mode}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch celebrities')
      }

      const data: DailyCelebritiesResponse = await response.json()
      setCelebrities(data.celebrities)
      setDate(data.date)
      setTheme(data.theme)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const shareParam = searchParams.get('share')
    if (shareParam) {
      const decoded = decodeChoices(shareParam)
      if (decoded) {
        setSharedChoices(decoded)
      }
    }

    fetchCelebrities(gameMode)
  }, [searchParams, gameMode, fetchCelebrities])

  const handleModeChange = (mode: 'women' | 'men') => {
    setGameMode(mode)
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <main className="h-[100dvh] flex items-center justify-center p-4 bg-[var(--bg-primary)]">
        <div className="text-center max-w-md">
          <div className="w-10 h-10 rounded-full bg-[var(--accent-destroy)]/10 flex items-center justify-center mx-auto mb-3">
            <span className="text-[var(--accent-destroy)] text-lg">!</span>
          </div>
          <h1 className="text-base font-medium text-[var(--text-primary)] mb-1.5">Something went wrong</h1>
          <p className="text-[var(--text-muted)] text-sm mb-4">{error}</p>
          {error.includes('TMDB_API_TOKEN') && (
            <div className="text-left bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-3 text-sm mb-4">
              <p className="text-[var(--text-secondary)] mb-2 text-xs">To fix this:</p>
              <ol className="list-decimal list-inside text-[var(--text-muted)] space-y-1 text-xs">
                <li>Sign up at <a href="https://www.themoviedb.org/signup" target="_blank" rel="noopener noreferrer" className="text-[var(--text-primary)] hover:underline">themoviedb.org</a></li>
                <li>Go to Settings, then API</li>
                <li>Copy your API Read Access Token</li>
                <li>Add to <code className="text-[var(--text-secondary)]">.env.local</code></li>
              </ol>
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 rounded-full text-sm font-medium bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
        </div>
      </main>
    )
  }

  if (!celebrities || celebrities.length === 0) {
    return (
      <main className="h-[100dvh] flex items-center justify-center bg-[var(--bg-primary)]">
        <p className="text-[var(--text-muted)]">No one found</p>
      </main>
    )
  }

  return (
    <main className="h-[100dvh] flex flex-col bg-[var(--bg-primary)] texture-overlay overflow-hidden">
      {/* Top bar with theme toggle */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-2 sm:px-6 sm:py-3">
        <GameModeSelector mode={gameMode} onChange={handleModeChange} />
        <ThemeToggle />
      </header>

      {/* Shared results banner */}
      {sharedChoices && (
        <div className="flex-shrink-0 border-b border-[var(--border-primary)] px-4 py-2">
          <p className="text-center text-[var(--text-muted)] text-xs">
            Someone shared their results. Play to compare!
          </p>
        </div>
      )}

      {/* Main game content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <GameBoard
          celebrities={celebrities}
          date={date}
          gameMode={gameMode}
          theme={theme}
        />
      </div>

      {/* Compact footer */}
      <footer className="flex-shrink-0 py-2 text-center border-t border-[var(--border-secondary)]">
        <p className="text-[var(--text-faint)] text-[10px] tracking-wide">
          Data from{' '}
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--text-muted)] transition-colors"
          >
            TMDB
          </a>
        </p>
      </footer>
    </main>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <HomeContent />
    </Suspense>
  )
}
