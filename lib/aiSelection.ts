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
    const prompt = `You are selecting 3 celebrities for a "Kiss, Marry, Kill" game. The goal is to make the choice DIFFICULT and FUN for players.

Today's date: ${date}
Game mode: ${gameMode}

Available celebrities:
${candidates.map((c, i) => `${i + 1}. ${c.name} (Known for: ${c.knownFor})`).join('\n')}

Select exactly 3 celebrities that would make for an interesting game. Consider:
1. They could be similar in appeal (hard to choose between)
2. They could have a funny connection (co-stars, rivals, same franchise)
3. They could be from the same era or genre
4. They could have contrasting personalities that make the choice interesting

Respond with ONLY a JSON object in this exact format:
{
  "selectedIndices": [1, 5, 8],
  "theme": "A one-line witty description of why these 3 are grouped together"
}

The indices are 1-based from the list above. Make the theme fun and short (under 50 characters).`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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
      console.error('OpenAI API error:', response.status)
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
