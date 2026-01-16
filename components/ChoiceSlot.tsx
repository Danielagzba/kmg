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
    color: 'var(--accent-kiss)',
  },
  marry: {
    label: 'Marry',
    shortLabel: 'M',
    color: 'var(--accent-marry)',
  },
  kill: {
    label: 'Kill',
    shortLabel: 'K',
    color: 'var(--accent-destroy)',
  },
}

export default function ChoiceSlot({ type, celebrity, onClick, disabled }: ChoiceSlotProps) {
  const config = slotConfig[type]

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-300
        border bg-[var(--bg-card)]
        ${celebrity
          ? 'border-[var(--border-primary)] shadow-[var(--shadow-md)]'
          : 'border-[var(--border-secondary)] border-dashed'
        }
        ${!disabled ? 'hover:scale-[1.02] cursor-pointer active:scale-[0.98]' : 'cursor-default'}
        ${disabled && !celebrity ? 'opacity-40' : ''}
      `}
      style={{
        background: celebrity
          ? `linear-gradient(135deg, color-mix(in srgb, ${config.color} 8%, var(--bg-card)), var(--bg-card))`
          : undefined,
        borderColor: celebrity ? config.color : undefined,
      }}
    >
      <span
        className="font-semibold text-[10px] sm:text-xs tracking-wide uppercase"
        style={{ color: config.color }}
      >
        {config.label}
      </span>

      {celebrity ? (
        <CelebrityCard celebrity={celebrity} size="small" disabled />
      ) : (
        <div
          className="w-14 h-20 sm:w-16 sm:h-22 rounded-lg sm:rounded-xl border border-dashed flex items-center justify-center bg-[var(--bg-secondary)]/50"
          style={{ borderColor: `color-mix(in srgb, ${config.color} 30%, transparent)` }}
        >
          <span
            className="text-xl sm:text-2xl font-light opacity-20"
            style={{ color: config.color }}
          >
            {config.shortLabel}
          </span>
        </div>
      )}
    </button>
  )
}
