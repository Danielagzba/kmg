'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import GameBoard from '@/components/GameBoard'
import { DailyCelebrity, DailyCelebritiesResponse } from '@/app/api/celebrities/route'
import { decodeChoices } from '@/lib/storage'

export default function Home() {
  const searchParams = useSearchParams()
  const [celebrities, setCelebrities] = useState<DailyCelebrity[] | null>(null)
  const [date, setDate] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sharedChoices, setSharedChoices] = useState<{
    date: string
    choices: { fuck: number; marry: number; kill: number }
  } | null>(null)

  useEffect(() => {
    const shareParam = searchParams.get('share')
    if (shareParam) {
      const decoded = decodeChoices(shareParam)
      if (decoded) {
        setSharedChoices(decoded)
      }
    }

    async function fetchCelebrities() {
      try {
        setLoading(true)
        const response = await fetch('/api/celebrities')

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch celebrities')
        }

        const data: DailyCelebritiesResponse = await response.json()
        setCelebrities(data.celebrities)
        setDate(data.date)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    fetchCelebrities()
  }, [searchParams])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white mb-4" />
          <p className="text-neutral-500 text-sm">Loading</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a]">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-xl">!</span>
          </div>
          <h1 className="text-lg font-medium text-white mb-2">Something went wrong</h1>
          <p className="text-neutral-500 text-sm mb-6">{error}</p>
          {error.includes('TMDB_API_TOKEN') && (
            <div className="text-left bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-sm mb-6">
              <p className="text-neutral-300 mb-3">To fix this:</p>
              <ol className="list-decimal list-inside text-neutral-500 space-y-2">
                <li>Sign up at <a href="https://www.themoviedb.org/signup" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">themoviedb.org</a></li>
                <li>Go to Settings → API</li>
                <li>Copy your API Read Access Token</li>
                <li>Add to <code className="text-neutral-300">.env.local</code></li>
              </ol>
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-full text-sm font-medium bg-white text-black hover:bg-neutral-200 transition-colors"
          >
            Try again
          </button>
        </div>
      </main>
    )
  }

  if (!celebrities || celebrities.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <p className="text-neutral-500">No one found</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Shared results banner */}
      {sharedChoices && (
        <div className="border-b border-white/[0.06] p-4">
          <p className="text-center text-neutral-400 text-sm">
            Someone shared their results. Play to compare!
          </p>
        </div>
      )}

      <GameBoard celebrities={celebrities} date={date} />

      {/* Footer */}
      <footer className="py-8 text-center">
        <p className="text-neutral-700 text-xs">
          Data from{' '}
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            TMDB
          </a>
        </p>
      </footer>
    </main>
  )
}
