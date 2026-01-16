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
  fuck: { color: 'ring-pink-500', bg: 'bg-pink-500', label: 'K' },
  marry: { color: 'ring-purple-500', bg: 'bg-purple-500', label: 'M' },
  kill: { color: 'ring-red-500', bg: 'bg-red-500', label: 'G' },
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
        ${isSmall ? 'w-20' : 'w-32 sm:w-40'}
        ${disabled ? 'cursor-default' : 'cursor-pointer'}
        ${selected ? 'scale-105' : 'hover:scale-[1.02]'}
      `}
    >
      {/* Image container */}
      <div className={`
        relative overflow-hidden rounded-2xl bg-[#141414] transition-all duration-300
        ${isSmall ? 'w-20 h-28' : 'w-32 h-44 sm:w-40 sm:h-56'}
        ${selected ? 'ring-2 ring-white/80' : ''}
        ${choice ? `ring-2 ${config?.color}` : ''}
      `}>
        <Image
          src={celebrity.imageUrl}
          alt={celebrity.name}
          fill
          className={`
            object-cover transition-all duration-500
            ${!disabled && !choice ? 'group-hover:scale-105' : ''}
          `}
          sizes={isSmall ? '80px' : '(max-width: 640px) 128px, 160px'}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Selection overlay */}
        {!disabled && !choice && (
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}

        {/* Choice badge */}
        {choice && (
          <div className={`
            absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center
            font-semibold text-sm text-white shadow-lg
            ${config?.bg}
          `}>
            {config?.label}
          </div>
        )}

        {/* Name overlay on image */}
        {!isSmall && (
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="font-medium text-white text-sm leading-tight truncate">
              {celebrity.name}
            </h3>
            <p className="text-white/60 text-xs truncate mt-0.5">
              {celebrity.knownFor}
            </p>
          </div>
        )}
      </div>

      {/* Name below for small cards */}
      {isSmall && (
        <p className="mt-2 text-xs text-neutral-400 truncate max-w-20 text-center">
          {celebrity.name}
        </p>
      )}
    </button>
  )
}
