import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { fetchMultiplePages, filterWithPhotos, getKnownFor, getImageUrl, Celebrity, fetchPersonDetails, calculateAge } from '@/lib/tmdb'
import { getSeededRandom, seededSelect, getTodaysSeed } from '@/lib/seededRandom'
import { selectWithAI } from '@/lib/aiSelection'

export interface DailyCelebrity {
  id: number
  name: string
  imageUrl: string
  knownFor: string
}

export interface DailyCelebritiesResponse {
  date: string
  gameMode: 'women' | 'men'
  celebrities: DailyCelebrity[]
  theme?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || getTodaysSeed()
    const gameMode = (searchParams.get('mode') as 'women' | 'men') || 'women'

    // Gender: 1 = female, 2 = male in TMDB
    const targetGender = gameMode === 'women' ? 1 : 2

    // Fetch from multiple pages to get a good pool
    const allCelebrities = await fetchMultiplePages([1, 2, 3, 4, 5, 6, 7, 8])

    // Filter to only those with photos and matching gender
    const filtered = filterWithPhotos(allCelebrities).filter(c => c.gender === targetGender)

    // Use seeded random to select candidates (more than needed to account for age filtering)
    const random = getSeededRandom(date + '-' + gameMode + '-v3')
    const candidates = seededSelect(filtered, 30, random)

    // Check ages and filter to 18+ only
    const adultsOnly: Celebrity[] = []
    for (const candidate of candidates) {
      if (adultsOnly.length >= 15) break // Get more than needed for AI selection

      const details = await fetchPersonDetails(candidate.id)
      const age = calculateAge(details.birthday)

      // Include if 18+ or if age unknown (most popular actors are adults)
      if (age === null || age >= 18) {
        adultsOnly.push(candidate)
      }
    }

    // Transform to response format for AI selection
    const candidatesForAI = adultsOnly.map((c: Celebrity) => ({
      id: c.id,
      name: c.name,
      imageUrl: getImageUrl(c.profile_path, 'w342'),
      knownFor: getKnownFor(c),
    }))

    // Use AI to select the best 3 related/funny/hard-to-choose actors
    let selectedCelebrities: DailyCelebrity[]
    let theme: string | undefined

    const aiResult = await selectWithAI(candidatesForAI, gameMode, date)

    if (aiResult) {
      selectedCelebrities = aiResult.celebrities
      theme = aiResult.theme
    } else {
      // Fallback to seeded random if AI fails
      selectedCelebrities = candidatesForAI.slice(0, 3)
    }

    const response: DailyCelebritiesResponse = {
      date,
      gameMode,
      celebrities: selectedCelebrities,
      theme,
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
