export interface Celebrity {
  id: number
  name: string
  profile_path: string | null
  gender: number // 1 = female, 2 = male
  known_for: {
    title?: string
    name?: string
  }[]
  popularity: number
}

export interface TMDBResponse {
  results: Celebrity[]
  page: number
  total_pages: number
}

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export function getImageUrl(path: string | null, size: 'w185' | 'w342' | 'w500' | 'original' = 'w342'): string {
  if (!path) {
    return '/placeholder-person.svg'
  }
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

export async function fetchPopularPeople(page: number = 1): Promise<TMDBResponse> {
  const token = process.env.TMDB_API_TOKEN

  if (!token) {
    throw new Error('TMDB_API_TOKEN is not set. Please add it to your .env.local file.')
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/person/popular?page=${page}&language=en-US`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    }
  )

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function fetchMultiplePages(pages: number[]): Promise<Celebrity[]> {
  const results = await Promise.all(pages.map(page => fetchPopularPeople(page)))
  return results.flatMap(r => r.results)
}

// Filter to only include people with profile photos
export function filterWithPhotos(celebrities: Celebrity[]): Celebrity[] {
  return celebrities.filter(c => c.profile_path !== null)
}

// Filter to only female actresses (gender 1 = female in TMDB)
export function filterFemaleOnly(celebrities: Celebrity[]): Celebrity[] {
  return celebrities.filter(c => c.gender === 1)
}

// Get the most famous work for display
export function getKnownFor(celebrity: Celebrity): string {
  const work = celebrity.known_for[0]
  if (!work) return 'Actor/Actress'
  return work.title || work.name || 'Actor/Actress'
}

// Fetch person details to get birthday
export async function fetchPersonDetails(id: number): Promise<{ birthday: string | null }> {
  const token = process.env.TMDB_API_TOKEN
  if (!token) throw new Error('TMDB_API_TOKEN is not set')

  const response = await fetch(
    `${TMDB_BASE_URL}/person/${id}?language=en-US`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 86400 }, // Cache for 24 hours
    }
  )

  if (!response.ok) return { birthday: null }
  return response.json()
}

// Calculate age from birthday
export function calculateAge(birthday: string | null): number | null {
  if (!birthday) return null
  const birthDate = new Date(birthday)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

// Filter celebrities to only those 18+
export async function filterAdultsOnly(celebrities: Celebrity[]): Promise<Celebrity[]> {
  const results = await Promise.all(
    celebrities.map(async (c) => {
      const details = await fetchPersonDetails(c.id)
      const age = calculateAge(details.birthday)
      // Include if age is 18+ OR if we can't determine age (assume adult)
      return { celebrity: c, isAdult: age === null || age >= 18 }
    })
  )
  return results.filter(r => r.isAdult).map(r => r.celebrity)
}
