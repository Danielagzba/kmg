'use client'

import { useState } from 'react'
import Image from 'next/image'
import { DailyCelebrity } from '@/app/api/celebrities/route'

interface StatsData {
  totalVotes: number
  stats: Record<number, { kiss: number; marry: number; destroy: number }>
}

interface ResultsModalProps {
  date: string
  gameMode: 'women' | 'men'
  choices: {
    fuck: DailyCelebrity
    marry: DailyCelebrity
    kill: DailyCelebrity
  }
  stats?: StatsData | null
  onClose: () => void
}

export default function ResultsModal({ date, gameMode, choices, stats, onClose }: ResultsModalProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const shareText = `Kiss, Marry, Kill - ${new Date(date).toLocaleDateString()}

Kiss: ${choices.fuck.name}
Marry: ${choices.marry.name}
Kill: ${choices.kill.name}

Play today's challenge:`

    const shareUrl = `${window.location.origin}?mode=${gameMode}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Kiss, Marry, Kill',
          text: shareText,
          url: shareUrl,
        })
        return
      } catch {
        // Fall back to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('Failed to copy:', e)
    }
  }

  const getPercentage = (celebrityId: number, type: 'kiss' | 'marry' | 'destroy'): number => {
    if (!stats || stats.totalVotes === 0) return 0
    const celebrityStats = stats.stats[celebrityId]
    if (!celebrityStats) return 0
    return Math.round((celebrityStats[type] / stats.totalVotes) * 100)
  }

  const ResultRow = ({
    type,
    label,
    statKey,
    celebrity,
    color,
  }: {
    type: string
    label: string
    statKey: 'kiss' | 'marry' | 'destroy'
    celebrity: DailyCelebrity
    color: string
  }) => {
    const percentage = getPercentage(celebrity.id, statKey)

    return (
      <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-secondary)]">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs text-[var(--bg-primary)]"
            style={{ backgroundColor: color }}
          >
            {type}
          </div>
          <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-[var(--border-primary)]">
            <Image
              src={celebrity.imageUrl}
              alt={celebrity.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[var(--text-primary)] text-sm truncate">{celebrity.name}</p>
            <p className="text-xs text-[var(--text-muted)] truncate">{celebrity.knownFor}</p>
          </div>
          <span className="text-[10px] text-[var(--text-faint)] font-medium uppercase tracking-wider">
            {label}
          </span>
        </div>

        {/* Stats bar */}
        {stats && stats.totalVotes > 0 && (
          <div className="mt-2.5 pt-2.5 border-t border-[var(--border-secondary)]">
            <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] mb-1">
              <span>Others who chose {label}</span>
              <span className="text-[var(--text-primary)] font-medium">{percentage}%</span>
            </div>
            <div className="h-1.5 bg-[var(--border-primary)] rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500 rounded-full"
                style={{ width: `${percentage}%`, backgroundColor: color }}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl max-w-sm w-full p-5 relative max-h-[85vh] overflow-y-auto shadow-[var(--shadow-lg)]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <h2 className="font-display text-xl font-semibold text-[var(--text-primary)] mb-1">Your choices</h2>
          <p className="text-[var(--text-muted)] text-xs">
            {new Date(date).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          {stats && stats.totalVotes > 0 && (
            <p className="text-[var(--text-faint)] text-[10px] mt-1">
              {stats.totalVotes.toLocaleString()} {stats.totalVotes === 1 ? 'person has' : 'people have'} played
            </p>
          )}
        </div>

        {/* Results */}
        <div className="space-y-2.5 mb-5">
          <ResultRow
            type="K"
            label="Kiss"
            statKey="kiss"
            celebrity={choices.fuck}
            color="var(--accent-kiss)"
          />
          <ResultRow
            type="M"
            label="Marry"
            statKey="marry"
            celebrity={choices.marry}
            color="var(--accent-marry)"
          />
          <ResultRow
            type="K"
            label="Kill"
            statKey="destroy"
            celebrity={choices.kill}
            color="var(--accent-destroy)"
          />
        </div>

        {/* Share button */}
        <button
          onClick={handleShare}
          className="w-full py-3 rounded-full font-medium text-sm tracking-wide bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Copied to clipboard
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share results
            </>
          )}
        </button>

        {/* Footer */}
        <p className="text-center text-[var(--text-faint)] text-[10px] mt-4">
          New faces tomorrow
        </p>
      </div>
    </div>
  )
}
