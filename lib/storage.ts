import { getTodaysSeed } from './seededRandom'

export interface GameResult {
  date: string
  choices: {
    fuck: number
    marry: number
    kill: number
  }
  celebrities: {
    id: number
    name: string
  }[]
}

const STORAGE_KEY = 'fmk-game-results'

export function saveGameResult(result: GameResult): void {
  if (typeof window === 'undefined') return

  try {
    const existing = getAllResults()
    const filtered = existing.filter(r => r.date !== result.date)
    filtered.push(result)

    // Keep only last 30 days
    const sorted = filtered.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted))
  } catch (e) {
    console.error('Failed to save game result:', e)
  }
}

export function getAllResults(): GameResult[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('Failed to load game results:', e)
    return []
  }
}

export function getTodaysResult(): GameResult | null {
  const today = getTodaysSeed()
  const results = getAllResults()
  return results.find(r => r.date === today) || null
}

export function hasPlayedToday(): boolean {
  return getTodaysResult() !== null
}

// Encode choices for sharing
export function encodeChoices(result: GameResult): string {
  return btoa(JSON.stringify({
    d: result.date,
    f: result.choices.fuck,
    m: result.choices.marry,
    k: result.choices.kill,
  }))
}

// Decode choices from share URL
export function decodeChoices(encoded: string): { date: string; choices: GameResult['choices'] } | null {
  try {
    const decoded = JSON.parse(atob(encoded))
    return {
      date: decoded.d,
      choices: {
        fuck: decoded.f,
        marry: decoded.m,
        kill: decoded.k,
      }
    }
  } catch (e) {
    return null
  }
}
