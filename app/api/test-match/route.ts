/**
 * POST /api/test-match
 * Test matching algorithm on two projects
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function extractBaseName(name: string): string {
  return name.split(/[,\(]/)[0].toLowerCase().trim()
}

function levenshteinDistance(s1: string, s2: string): number {
  const len1 = s1.length
  const len2 = s2.length
  const d: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0))

  for (let i = 0; i <= len1; i++) d[i][0] = i
  for (let j = 0; j <= len2; j++) d[0][j] = j

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost
      )
    }
  }

  return d[len1][len2]
}

function nameSimilarity(s1: string, s2: string): number {
  const s1Lower = s1.toLowerCase().trim()
  const s2Lower = s2.toLowerCase().trim()

  if (s1Lower === s2Lower) return 1.0

  const s1Base = extractBaseName(s1)
  const s2Base = extractBaseName(s2)

  if (s1Base === s2Base) return 1.0

  const maxLen = Math.max(s1Base.length, s2Base.length)
  const distance = levenshteinDistance(s1Base, s2Base)
  const similarity = 1 - distance / maxLen

  return Math.max(0, Math.min(1, similarity))
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id1, id2 } = body

    if (!id1 || !id2) {
      return Response.json(
        { error: 'Missing id1 or id2' },
        { status: 400 }
      )
    }

    // Fetch both projects
    const { data: p1 } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', id1)
      .single()

    const { data: p2 } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', id2)
      .single()

    if (!p1 || !p2) {
      return Response.json(
        { error: 'One or both projects not found' },
        { status: 404 }
      )
    }

    // Test matching
    const sim = nameSimilarity(p1.name, p2.name)
    const base1 = extractBaseName(p1.name)
    const base2 = extractBaseName(p2.name)
    const words1 = base1.split(/\s+/)
    const words2 = base2.split(/\s+/)

    let sameFirstWords = true
    const minWords = Math.min(2, words1.length, words2.length)
    for (let i = 0; i < minWords; i++) {
      if (words1[i] !== words2[i]) {
        sameFirstWords = false
        break
      }
    }

    let matchReason = 'no match'
    let matchScore = 0

    if (sim >= 0.80) {
      matchReason = '80%+ similarity'
      matchScore = sim
    } else if (sim >= 0.70) {
      matchReason = '70%+ similarity'
      matchScore = 0.70
    } else if (sameFirstWords && minWords >= 2) {
      matchReason = 'same first 2 words'
      matchScore = 0.68
    }

    return Response.json({
      project1: { id: p1.id, name: p1.name, baseName: base1 },
      project2: { id: p2.id, name: p2.name, baseName: base2 },
      similarity: Number(sim.toFixed(2)),
      firstWordsMatch: sameFirstWords,
      minWords,
      matchReason,
      matchScore,
      shouldMatch: matchScore > 0
    })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    )
  }
}
