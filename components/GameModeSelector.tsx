'use client'

interface GameModeSelectorProps {
  mode: 'women' | 'men'
  onChange: (mode: 'women' | 'men') => void
}

export default function GameModeSelector({ mode, onChange }: GameModeSelectorProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-secondary)]">
      <button
        onClick={() => onChange('women')}
        className={`
          px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300
          ${mode === 'women'
            ? 'bg-[var(--accent-kiss)] text-white shadow-sm'
            : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }
        `}
      >
        Women
      </button>
      <button
        onClick={() => onChange('men')}
        className={`
          px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300
          ${mode === 'men'
            ? 'bg-[var(--accent-marry)] text-white shadow-sm'
            : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }
        `}
      >
        Men
      </button>
    </div>
  )
}
