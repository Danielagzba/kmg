'use client'

import { DailyCelebrity } from '@/app/api/celebrities/route'
import CelebrityCard from './CelebrityCard'

type ChoiceType = 'fuck' | 'marry' | 'kill'

interface ChoiceSlotProps {
  type: ChoiceType
  celebrity: DailyCelebrity | null
  onClick: () => void
  disabled?: boolean
}

const slotConfig = {
  fuck: {
    label: 'Kiss',
    shortLabel: 'K',
    gradient: 'from-pink-500/20 to-pink-500/5',
    border: 'border-pink-500/30',
    borderActive: 'border-pink-500',
    text: 'text-pink-400',
    glow: 'shadow-pink-500/20',
  },
  marry: {
    label: 'Marry',
    shortLabel: 'M',
    gradient: 'from-purple-500/20 to-purple-500/5',
    border: 'border-purple-500/30',
    borderActive: 'border-purple-500',
    text: 'text-purple-400',
    glow: 'shadow-purple-500/20',
  },
  kill: {
    label: 'Goodbye',
    shortLabel: 'G',
    gradient: 'from-red-500/20 to-red-500/5',
    border: 'border-red-500/30',
    borderActive: 'border-red-500',
    text: 'text-red-400',
    glow: 'shadow-red-500/20',
  },
}

export default function ChoiceSlot({ type, celebrity, onClick, disabled }: ChoiceSlotProps) {
  const config = slotConfig[type]

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300
        border bg-gradient-to-b ${config.gradient}
        ${celebrity ? config.borderActive : config.border}
        ${!disabled ? 'hover:scale-[1.02] cursor-pointer active:scale-[0.98]' : 'cursor-default opacity-40'}
        ${celebrity ? `shadow-lg ${config.glow}` : ''}
      `}
    >
      <span className={`font-semibold text-sm tracking-wide uppercase ${config.text}`}>
        {config.label}
      </span>

      {celebrity ? (
        <CelebrityCard celebrity={celebrity} size="small" disabled />
      ) : (
        <div className={`
          w-20 h-28 rounded-xl border border-dashed flex items-center justify-center
          ${config.border} bg-white/[0.02]
        `}>
          <span className={`text-3xl font-light ${config.text} opacity-30`}>
            {config.shortLabel}
          </span>
        </div>
      )}
    </button>
  )
}
