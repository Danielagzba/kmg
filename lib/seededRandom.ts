// Simple hash function for seeding
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

// Seeded random number generator (Mulberry32)
function mulberry32(seed: number) {
  return function() {
    let t = seed += 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

// Get today's date string for seeding
export function getTodaysSeed(): string {
  return new Date().toISOString().split('T')[0]
}

// Get a seeded random number generator for a given date
export function getSeededRandom(dateStr?: string): () => number {
  const seed = dateStr || getTodaysSeed()
  const hash = hashString(seed)
  return mulberry32(hash)
}

// Shuffle array using seeded random
export function seededShuffle<T>(array: T[], random: () => number): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Select n items from array using seeded random
export function seededSelect<T>(array: T[], n: number, random: () => number): T[] {
  const shuffled = seededShuffle(array, random)
  return shuffled.slice(0, n)
}
