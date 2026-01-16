'use client'

import { useState } from 'react'
import Image from 'next/image'
import { DailyCelebrity } from '@/app/api/celebrities/route'
import { encodeChoices, GameResult } from '@/lib/storage'

interface ResultsModalProps {
  date: string
  choices: {
    fuck: DailyCelebrity
    marry: DailyCelebrity
    kill: DailyCelebrity
  }
  onClose: () => void
}

export default function ResultsModal({ date, choices, onClose }: ResultsModalProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const result: GameResult = {
      date,
      choices: {
        fuck: choices.fuck.id,
        marry: choices.marry.id,
        kill: choices.kill.id,
      },
      celebrities: [choices.fuck, choices.marry, choices.kill].map(c => ({
        id: c.id,
        name: c.name,
      })),
    }

    const encoded = encodeChoices(result)
    const shareUrl = `${window.location.origin}?share=${encoded}`

    const shareText = `Kiss, Marry, Goodbye - ${new Date(date).toLocaleDateString()}

Kiss: ${choices.fuck.name}
Marry: ${choices.marry.name}
Goodbye: ${choices.kill.name}

Play today's challenge:`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Kiss, Marry, Goodbye',
          text: shareText,
          url: shareUrl,
        })
        return
      } catch (e) {
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

  const ResultRow = ({
    type,
    label,
    celebrity,
    color,
  }: {
    type: string
    label: string
    celebrity: DailyCelebrity
    color: string
  }) => (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm text-white ${color}`}>
        {type}
      </div>
      <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/10">
        <Image
          src={celebrity.imageUrl}
          alt={celebrity.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">{celebrity.name}</p>
        <p className="text-sm text-neutral-500 truncate">{celebrity.knownFor}</p>
      </div>
      <span className="text-xs text-neutral-600 font-medium uppercase tracking-wider">
        {label}
      </span>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-3xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-500 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Your choices</h2>
          <p className="text-neutral-500 text-sm">
            {new Date(date).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Results */}
        <div className="space-y-3 mb-8">
          <ResultRow type="K" label="Kiss" celebrity={choices.fuck} color="bg-pink-500" />
          <ResultRow type="M" label="Marry" celebrity={choices.marry} color="bg-purple-500" />
          <ResultRow type="G" label="Goodbye" celebrity={choices.kill} color="bg-red-500" />
        </div>

        {/* Share button */}
        <button
          onClick={handleShare}
          className="w-full py-3.5 rounded-full font-medium text-sm tracking-wide bg-white text-black hover:bg-neutral-200 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
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
        <p className="text-center text-neutral-600 text-xs mt-6">
          New faces tomorrow
        </p>
      </div>
    </div>
  )
}
