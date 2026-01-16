'use client'

import Image from 'next/image'
import { DailyCelebrity } from '@/app/api/celebrities/route'

interface CelebrityCardProps {
  celebrity: DailyCelebrity
  onClick?: () => void
  selected?: boolean
  choice?: 'fuck' | 'marry' | 'kill' | null
  disabled?: boolean
  size?: 'small' | 'normal'
}

const choiceConfig = {
  fuck: { ring: 'ring-[var(--accent-kiss)]', bg: 'bg-[var(--accent-kiss)]', label: 'K' },
  marry: { ring: 'ring-[var(--accent-marry)]', bg: 'bg-[var(--accent-marry)]', label: 'M' },
  kill: { ring: 'ring-[var(--accent-destroy)]', bg: 'bg-[var(--accent-destroy)]', label: 'K' },
}

export default function CelebrityCard({
  celebrity,
  onClick,
  selected,
  choice,
  disabled,
  size = 'normal',
}: CelebrityCardProps) {
  const isSmall = size === 'small'
  const config = choice ? choiceConfig[choice] : null

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative group flex flex-col items-center transition-all duration-300 ease-out
        ${isSmall ? 'w-14 sm:w-16' : 'w-24 sm:w-28 md:w-32'}
        ${disabled ? 'cursor-default' : 'cursor-pointer'}
        ${selected ? 'scale-105' : 'hover:scale-[1.02]'}
      `}
    >
      {/* Image container */}
      <div className={`
        relative overflow-hidden rounded-xl sm:rounded-2xl bg-[var(--bg-card)] transition-all duration-300
        ${isSmall ? 'w-14 h-20 sm:w-16 sm:h-22' : 'w-24 h-32 sm:w-28 sm:h-38 md:w-32 md:h-44'}
        ${selected ? 'ring-2 ring-[var(--text-primary)]/60 shadow-lg' : ''}
        ${choice ? `ring-2 ${config?.ring}` : ''}
        shadow-[var(--shadow-md)]
      `}>
        <Image
          src={celebrity.imageUrl}
          alt={celebrity.name}
          fill
          className={`
            object-cover transition-all duration-500
            ${!disabled && !choice ? 'group-hover:scale-105' : ''}
          `}
          sizes={isSmall ? '64px' : '(max-width: 640px) 96px, (max-width: 768px) 112px, 128px'}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Selection overlay */}
        {!disabled && !choice && (
          <div className="absolute inset-0 bg-[var(--text-primary)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}

        {/* Choice badge */}
        {choice && (
          <div className={`
            absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center
            font-semibold text-[10px] sm:text-xs text-white shadow-lg
            ${config?.bg}
          `}>
            {config?.label}
          </div>
        )}

        {/* Name overlay on image */}
        {!isSmall && (
          <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-2.5">
            <h3 className="font-medium text-white text-[10px] sm:text-xs leading-tight truncate">
              {celebrity.name}
            </h3>
            <p className="text-white/60 text-[8px] sm:text-[10px] truncate mt-0.5">
              {celebrity.knownFor}
            </p>
          </div>
        )}
      </div>

      {/* Name below for small cards */}
      {isSmall && (
        <p className="mt-1 text-[9px] sm:text-[10px] text-[var(--text-muted)] truncate max-w-14 sm:max-w-16 text-center leading-tight">
          {celebrity.name}
        </p>
      )}
    </button>
  )
}
