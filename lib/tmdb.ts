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
      cache: 'no-store', // Disable cache for testing
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

// Fetch person details to get birthday and place of birth
export async function fetchPersonDetails(id: number): Promise<{ birthday: string | null; place_of_birth: string | null }> {
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

  if (!response.ok) return { birthday: null, place_of_birth: null }
  return response.json()
}

// Check if place of birth is Western (US, UK, Canada, Australia, Europe)
const WESTERN_COUNTRIES = [
  'USA', 'United States', 'U.S.', 'America',
  'UK', 'United Kingdom', 'England', 'Scotland', 'Wales', 'Ireland', 'Britain',
  'Canada', 'Australia', 'New Zealand',
  'France', 'Germany', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Sweden', 'Norway', 'Denmark', 'Finland',
  'Austria', 'Switzerland', 'Portugal', 'Greece', 'Poland', 'Czech', 'Hungary',
  'California', 'New York', 'Texas', 'Florida', 'Illinois', 'Pennsylvania', 'Ohio', 'Georgia', 'Michigan',
  'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas',
  'London', 'Paris', 'Berlin', 'Rome', 'Madrid', 'Sydney', 'Melbourne', 'Toronto', 'Vancouver'
]

export function isWesternCelebrity(placeOfBirth: string | null): boolean {
  if (!placeOfBirth) return false // Require known birthplace
  const place = placeOfBirth.toLowerCase()

  // Explicitly exclude non-Western regions
  const nonWestern = [
    'india', 'mumbai', 'delhi', 'chennai', 'kolkata', 'bangalore', 'hyderabad', 'pune',
    'china', 'beijing', 'shanghai', 'hong kong',
    'korea', 'seoul', 'busan',
    'japan', 'tokyo', 'osaka',
    'thailand', 'bangkok',
    'philippines', 'manila',
    'indonesia', 'jakarta',
    'vietnam', 'hanoi',
    'pakistan', 'karachi', 'lahore',
    'bangladesh', 'dhaka',
    'malaysia', 'singapore',
    'taiwan', 'taipei',
    'nigeria', 'lagos',
    'brazil', 'mexico', 'argentina' // Focus on English-speaking Western
  ]
  if (nonWestern.some(region => place.includes(region))) return false

  // Must contain a Western location
  const western = [
    'usa', 'united states', 'u.s.', 'america',
    'uk', 'united kingdom', 'england', 'scotland', 'wales', 'ireland', 'britain', 'british',
    'canada', 'australia', 'new zealand',
    'california', 'new york', 'texas', 'florida', 'illinois', 'pennsylvania', 'ohio', 'georgia', 'michigan',
    'new jersey', 'massachusetts', 'washington', 'arizona', 'colorado', 'tennessee', 'north carolina',
    'los angeles', 'chicago', 'houston', 'phoenix', 'philadelphia', 'san antonio', 'san diego', 'dallas',
    'brooklyn', 'manhattan', 'queens', 'bronx', 'hollywood', 'beverly hills', 'santa monica',
    'london', 'manchester', 'birmingham', 'liverpool', 'glasgow', 'edinburgh', 'dublin', 'belfast',
    'sydney', 'melbourne', 'brisbane', 'perth', 'auckland',
    'toronto', 'vancouver', 'montreal', 'calgary'
  ]
  return western.some(region => place.includes(region))
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
