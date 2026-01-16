import { NextResponse } from 'next/server'
import { fetchMultiplePages, filterWithPhotos, getKnownFor, getImageUrl, Celebrity, fetchPersonDetails, calculateAge } from '@/lib/tmdb'
import { getSeededRandom, seededSelect, getTodaysSeed } from '@/lib/seededRandom'

export interface DailyCelebrity {
  id: number
  name: string
  imageUrl: string
  knownFor: string
}

export interface DailyCelebritiesResponse {
  date: string
  celebrities: DailyCelebrity[]
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || getTodaysSeed()

    // Fetch from multiple pages to get a good pool
    const allCelebrities = await fetchMultiplePages([3, 4, 5, 6, 7])

    // Filter to only those with photos
    const withPhotos = filterWithPhotos(allCelebrities)

    // Use seeded random to select candidates (more than needed to account for age filtering)
    // Adding v2 to seed to get different results
    const random = getSeededRandom(date + '-v2')
    const candidates = seededSelect(withPhotos, 15, random)

    // Check ages and filter to 18+ only
    const adultsOnly: Celebrity[] = []
    for (const candidate of candidates) {
      if (adultsOnly.length >= 3) break

      const details = await fetchPersonDetails(candidate.id)
      const age = calculateAge(details.birthday)

      // Include if 18+ or if age unknown (most popular actors are adults)
      if (age === null || age >= 18) {
        adultsOnly.push(candidate)
      }
    }

    // Transform to response format
    const celebrities: DailyCelebrity[] = adultsOnly.map((c: Celebrity) => ({
      id: c.id,
      name: c.name,
      imageUrl: getImageUrl(c.profile_path, 'w342'),
      knownFor: getKnownFor(c),
    }))

    const response: DailyCelebritiesResponse = {
      date,
      celebrities,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching celebrities:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch celebrities' },
      { status: 500 }
    )
  }
}
