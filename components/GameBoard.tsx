'use client'

import { useState, useEffect } from 'react'
import { DailyCelebrity } from '@/app/api/celebrities/route'
import CelebrityCard from './CelebrityCard'
import ChoiceSlot from './ChoiceSlot'
import ResultsModal from './ResultsModal'

type ChoiceType = 'fuck' | 'marry' | 'kill'

interface Choices {
  fuck: DailyCelebrity | null
  marry: DailyCelebrity | null
  kill: DailyCelebrity | null
}

interface GameBoardProps {
  celebrities: DailyCelebrity[]
  date: string
  gameMode: 'women' | 'men'
  theme?: string
}

// Local storage helpers
function getStorageKey(date: string, gameMode: string) {
  return `kmk-vote-${date}-${gameMode}`
}

function getSavedVote(date: string, gameMode: string) {
  if (typeof window === 'undefined') return null
  try {
    const saved = localStorage.getItem(getStorageKey(date, gameMode))
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

function saveVote(date: string, gameMode: string, choices: { kiss: number; marry: number; kill: number }) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(getStorageKey(date, gameMode), JSON.stringify(choices))
  } catch {
    // Storage full or unavailable
  }
}

export default function GameBoard({ celebrities, date, gameMode, theme }: GameBoardProps) {
  const [choices, setChoices] = useState<Choices>({ fuck: null, marry: null, kill: null })
  const [selectedCelebrity, setSelectedCelebrity] = useState<DailyCelebrity | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  // Reset and check for existing vote when game mode or date changes
  useEffect(() => {
    setChoices({ fuck: null, marry: null, kill: null })
    setSelectedCelebrity(null)
    setShowResults(false)
    setHasSubmitted(false)

    // Check for existing vote in local storage
    const savedVote = getSavedVote(date, gameMode)
    if (savedVote && celebrities.length > 0) {
      const restoredChoices: Choices = { fuck: null, marry: null, kill: null }
      celebrities.forEach(c => {
        if (c.id === savedVote.kiss) restoredChoices.fuck = c
        if (c.id === savedVote.marry) restoredChoices.marry = c
        if (c.id === savedVote.kill) restoredChoices.kill = c
      })
      if (restoredChoices.fuck && restoredChoices.marry && restoredChoices.kill) {
        setChoices(restoredChoices)
        setHasSubmitted(true)
      }
    }
  }, [gameMode, date, celebrities])

  const getCelebrityChoice = (celebrity: DailyCelebrity): ChoiceType | null => {
    if (choices.fuck?.id === celebrity.id) return 'fuck'
    if (choices.marry?.id === celebrity.id) return 'marry'
    if (choices.kill?.id === celebrity.id) return 'kill'
    return null
  }

  const handleCelebrityClick = (celebrity: DailyCelebrity) => {
    if (hasSubmitted) return
    const currentChoice = getCelebrityChoice(celebrity)
    if (currentChoice) {
      setChoices(prev => ({ ...prev, [currentChoice]: null }))
      setSelectedCelebrity(null)
    } else {
      setSelectedCelebrity(celebrity)
    }
  }

  const handleSlotClick = (type: ChoiceType) => {
    if (hasSubmitted || !selectedCelebrity) return
    const newChoices = { ...choices }
    if (newChoices.fuck?.id === selectedCelebrity.id) newChoices.fuck = null
    if (newChoices.marry?.id === selectedCelebrity.id) newChoices.marry = null
    if (newChoices.kill?.id === selectedCelebrity.id) newChoices.kill = null
    newChoices[type] = selectedCelebrity
    setChoices(newChoices)
    setSelectedCelebrity(null)
  }

  const isComplete = choices.fuck && choices.marry && choices.kill

  const handleSubmit = async () => {
    if (!isComplete) return

    // Save to local storage
    saveVote(date, gameMode, {
      kiss: choices.fuck!.id,
      marry: choices.marry!.id,
      kill: choices.kill!.id,
    })

    setHasSubmitted(true)
    setShowResults(true)
  }

  return (
    <div className="h-full flex flex-col items-center justify-between px-3 py-2 sm:px-4 sm:py-4">
      {/* Header */}
      <header className="text-center flex-shrink-0">
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-[var(--text-primary)] tracking-tight">
          Kiss, Marry, Kill
        </h1>
        <p className="text-[var(--text-muted)] text-xs sm:text-sm mt-1 max-w-xs mx-auto">
          {hasSubmitted
            ? "You've made your choices"
            : "Select someone, then choose their fate"
          }
        </p>
        {theme && (
          <p className="text-[var(--text-faint)] text-[10px] sm:text-xs mt-1 italic font-light">
            "{theme}"
          </p>
        )}
        <p className="text-[var(--text-faint)] text-[10px] mt-1 font-medium tracking-widest uppercase">
          {new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })}
        </p>
      </header>

      {/* Celebrity Selection - Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 w-full max-w-2xl py-2 sm:py-4">
        <div className="flex justify-center gap-2 sm:gap-4 mb-2 sm:mb-4">
          {celebrities.map(celebrity => (
            <CelebrityCard
              key={celebrity.id}
              celebrity={celebrity}
              onClick={() => handleCelebrityClick(celebrity)}
              selected={selectedCelebrity?.id === celebrity.id}
              choice={getCelebrityChoice(celebrity)}
              disabled={hasSubmitted}
            />
          ))}
        </div>

        {/* Selection indicator */}
        <div className="h-5 sm:h-6 flex items-center justify-center">
          {selectedCelebrity && !hasSubmitted && (
            <p className="text-[var(--text-secondary)] text-xs animate-pulse">
              Place <span className="text-[var(--text-primary)] font-medium">{selectedCelebrity.name}</span> below
            </p>
          )}
        </div>
      </div>

      {/* Choice Slots */}
      <div className="flex-shrink-0 w-full max-w-md">
        <div className="flex justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <ChoiceSlot
            type="fuck"
            celebrity={choices.fuck}
            onClick={() => handleSlotClick('fuck')}
            disabled={hasSubmitted || !selectedCelebrity}
          />
          <ChoiceSlot
            type="marry"
            celebrity={choices.marry}
            onClick={() => handleSlotClick('marry')}
            disabled={hasSubmitted || !selectedCelebrity}
          />
          <ChoiceSlot
            type="kill"
            celebrity={choices.kill}
            onClick={() => handleSlotClick('kill')}
            disabled={hasSubmitted || !selectedCelebrity}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          {!hasSubmitted && (
            <button
              onClick={handleSubmit}
              disabled={!isComplete}
              className={`
                px-6 py-2.5 sm:px-8 sm:py-3 rounded-full font-medium text-xs sm:text-sm tracking-wide transition-all duration-300
                ${isComplete
                  ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 active:scale-[0.98] shadow-md'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-faint)] cursor-not-allowed border border-[var(--border-primary)]'
                }
              `}
            >
              Lock in choices
            </button>
          )}

          {hasSubmitted && !showResults && (
            <button
              onClick={() => setShowResults(true)}
              className="px-6 py-2.5 sm:px-8 sm:py-3 rounded-full font-medium text-xs sm:text-sm tracking-wide bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 active:scale-[0.98] transition-all duration-300 shadow-md"
            >
              View results
            </button>
          )}
        </div>
      </div>

      {/* Results Modal */}
      {showResults && choices.fuck && choices.marry && choices.kill && (
        <ResultsModal
          date={date}
          gameMode={gameMode}
          choices={{
            fuck: choices.fuck,
            marry: choices.marry,
            kill: choices.kill,
          }}
          stats={null}
          onClose={() => setShowResults(false)}
        />
      )}
    </div>
  )
}
