import { DailyCelebrity } from '@/app/api/celebrities/route'

interface AISelectionResult {
  celebrities: DailyCelebrity[]
  theme: string
}

export async function selectWithAI(
  candidates: DailyCelebrity[],
  gameMode: 'women' | 'men',
  date: string
): Promise<AISelectionResult | null> {
  const openaiKey = process.env.OPENAI_API_KEY

  if (!openaiKey) {
    console.log('No OpenAI key, using fallback selection')
    return null
  }

  try {
    const prompt = `You are selecting 3 celebrities for a "Kiss, Marry, Kill" game. Your goal is to make the choice DIFFICULT, FUNNY, or create an interesting dilemma.

Today's date: ${date}
Game mode: ${gameMode}

Available celebrities:
${candidates.map((c, i) => `${i + 1}. ${c.name} (Known for: ${c.knownFor})`).join('\n')}

RULES:
- ONLY select Western celebrities (Hollywood, American, British, European, Australian). NO Bollywood or Asian cinema actors.
- The 3 must have a CONNECTION that makes the choice interesting:
  * Co-stars from the same movie/show (e.g., the 3 leads from a love triangle)
  * Same franchise (e.g., 3 Marvel heroes, 3 rom-com queens)
  * Similar "type" that makes it hard to choose (e.g., 3 blonde action stars)
  * Funny/awkward grouping (e.g., exes, rivals, lookalikes)
  * Same era icons (e.g., 90s heartthrobs, 2000s pop stars)

DO NOT pick random unrelated celebrities. The fun is in the connection!

Respond with ONLY a JSON object:
{
  "selectedIndices": [1, 5, 8],
  "theme": "Witty theme explaining the connection (under 50 chars)"
}

Indices are 1-based. Be creative and funny with the theme!`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 200,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error:', response.status, errorText)
      return null
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return null
    }

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return null
    }

    const parsed = JSON.parse(jsonMatch[0])
    const indices: number[] = parsed.selectedIndices

    if (!indices || indices.length !== 3) {
      return null
    }

    // Get the selected celebrities (convert from 1-based to 0-based index)
    const selected = indices
      .map(i => candidates[i - 1])
      .filter(Boolean)

    if (selected.length !== 3) {
      return null
    }

    return {
      celebrities: selected,
      theme: parsed.theme || 'Today\'s challenge',
    }
  } catch (error) {
    console.error('AI selection error:', error)
    return null
  }
}
