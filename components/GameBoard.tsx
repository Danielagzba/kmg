'use client'

import { useState, useEffect } from 'react'
import { DailyCelebrity } from '@/app/api/celebrities/route'
import CelebrityCard from './CelebrityCard'
import ChoiceSlot from './ChoiceSlot'
import ResultsModal from './ResultsModal'
import { saveGameResult, getTodaysResult, GameResult } from '@/lib/storage'

type ChoiceType = 'fuck' | 'marry' | 'kill'

interface Choices {
  fuck: DailyCelebrity | null
  marry: DailyCelebrity | null
  kill: DailyCelebrity | null
}

interface GameBoardProps {
  celebrities: DailyCelebrity[]
  date: string
}

export default function GameBoard({ celebrities, date }: GameBoardProps) {
  const [choices, setChoices] = useState<Choices>({ fuck: null, marry: null, kill: null })
  const [selectedCelebrity, setSelectedCelebrity] = useState<DailyCelebrity | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [existingResult, setExistingResult] = useState<GameResult | null>(null)

  useEffect(() => {
    const result = getTodaysResult()
    if (result && result.date === date) {
      // Check if the saved celebrities match current ones
      const currentIds = celebrities.map(c => c.id)
      const savedIds = [result.choices.fuck, result.choices.marry, result.choices.kill]
      const idsMatch = savedIds.every(id => currentIds.includes(id))

      if (idsMatch) {
        setExistingResult(result)
        const restoredChoices: Choices = { fuck: null, marry: null, kill: null }
        celebrities.forEach(c => {
          if (c.id === result.choices.fuck) restoredChoices.fuck = c
          if (c.id === result.choices.marry) restoredChoices.marry = c
          if (c.id === result.choices.kill) restoredChoices.kill = c
        })
        setChoices(restoredChoices)
        setShowResults(true)
      }
      // If IDs don't match, let user play again with new celebrities
    }
  }, [celebrities, date])

  const getCelebrityChoice = (celebrity: DailyCelebrity): ChoiceType | null => {
    if (choices.fuck?.id === celebrity.id) return 'fuck'
    if (choices.marry?.id === celebrity.id) return 'marry'
    if (choices.kill?.id === celebrity.id) return 'kill'
    return null
  }

  const handleCelebrityClick = (celebrity: DailyCelebrity) => {
    if (existingResult) return
    const currentChoice = getCelebrityChoice(celebrity)
    if (currentChoice) {
      setChoices(prev => ({ ...prev, [currentChoice]: null }))
      setSelectedCelebrity(null)
    } else {
      setSelectedCelebrity(celebrity)
    }
  }

  const handleSlotClick = (type: ChoiceType) => {
    if (existingResult || !selectedCelebrity) return
    const newChoices = { ...choices }
    if (newChoices.fuck?.id === selectedCelebrity.id) newChoices.fuck = null
    if (newChoices.marry?.id === selectedCelebrity.id) newChoices.marry = null
    if (newChoices.kill?.id === selectedCelebrity.id) newChoices.kill = null
    newChoices[type] = selectedCelebrity
    setChoices(newChoices)
    setSelectedCelebrity(null)
  }

  const isComplete = choices.fuck && choices.marry && choices.kill

  const handleSubmit = () => {
    if (!isComplete) return
    const result: GameResult = {
      date,
      choices: {
        fuck: choices.fuck!.id,
        marry: choices.marry!.id,
        kill: choices.kill!.id,
      },
      celebrities: celebrities.map(c => ({ id: c.id, name: c.name })),
    }
    saveGameResult(result)
    setExistingResult(result)
    setShowResults(true)
  }

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <header className="text-center mb-12 sm:mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-3">
          Kiss, Marry, Goodbye
        </h1>
        <p className="text-neutral-400 text-sm sm:text-base max-w-md mx-auto">
          {existingResult
            ? "You've made your choices. See you tomorrow."
            : "Select someone, then choose their fate"
          }
        </p>
        <p className="text-neutral-600 text-xs mt-3 font-medium tracking-wide uppercase">
          {new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </header>

      {/* Celebrity Selection */}
      <div className="flex justify-center gap-4 sm:gap-6 mb-8">
        {celebrities.map(celebrity => (
          <CelebrityCard
            key={celebrity.id}
            celebrity={celebrity}
            onClick={() => handleCelebrityClick(celebrity)}
            selected={selectedCelebrity?.id === celebrity.id}
            choice={getCelebrityChoice(celebrity)}
            disabled={!!existingResult}
          />
        ))}
      </div>

      {/* Selection indicator */}
      <div className="h-8 mb-8">
        {selectedCelebrity && !existingResult && (
          <p className="text-neutral-300 text-sm animate-pulse">
            Place <span className="text-white font-medium">{selectedCelebrity.name}</span> in a slot below
          </p>
        )}
      </div>

      {/* Choice Slots */}
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-12">
        <ChoiceSlot
          type="fuck"
          celebrity={choices.fuck}
          onClick={() => handleSlotClick('fuck')}
          disabled={!!existingResult || !selectedCelebrity}
        />
        <ChoiceSlot
          type="marry"
          celebrity={choices.marry}
          onClick={() => handleSlotClick('marry')}
          disabled={!!existingResult || !selectedCelebrity}
        />
        <ChoiceSlot
          type="kill"
          celebrity={choices.kill}
          onClick={() => handleSlotClick('kill')}
          disabled={!!existingResult || !selectedCelebrity}
        />
      </div>

      {/* Submit Button */}
      {!existingResult && (
        <button
          onClick={handleSubmit}
          disabled={!isComplete}
          className={`
            px-8 py-3.5 rounded-full font-medium text-sm tracking-wide transition-all duration-300
            ${isComplete
              ? 'bg-white text-black hover:bg-neutral-200 active:scale-[0.98]'
              : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            }
          `}
        >
          Lock in choices
        </button>
      )}

      {/* View Results Button */}
      {existingResult && !showResults && (
        <button
          onClick={() => setShowResults(true)}
          className="px-8 py-3.5 rounded-full font-medium text-sm tracking-wide bg-white text-black hover:bg-neutral-200 active:scale-[0.98] transition-all duration-300"
        >
          View results
        </button>
      )}

      {/* Results Modal */}
      {showResults && choices.fuck && choices.marry && choices.kill && (
        <ResultsModal
          date={date}
          choices={{
            fuck: choices.fuck,
            marry: choices.marry,
            kill: choices.kill,
          }}
          onClose={() => setShowResults(false)}
        />
      )}
    </div>
  )
}
