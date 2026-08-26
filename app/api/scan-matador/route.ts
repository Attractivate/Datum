/**
 * POST /api/scan-matador
 * Scan specifically for Project Matador duplicates (debug)
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

export async function POST() {
  try {
    // Fetch all matador projects
    const { data: matadorProjects } = await supabase
      .from('projects')
      .select('id, name')
      .ilike('name', '%matador%')

    console.log(`[ScanMatador] Found ${matadorProjects?.length || 0} matador projects`)

    if (!matadorProjects || matadorProjects.length < 2) {
      return Response.json({
        error: `Not enough matador projects (found ${matadorProjects?.length || 0})`
      })
    }

    const matches = []

    // Compare all pairs
    for (let i = 0; i < matadorProjects.length; i++) {
      for (let j = i + 1; j < matadorProjects.length; j++) {
        const p1 = matadorProjects[i]
        const p2 = matadorProjects[j]
        const sim = nameSimilarity(p1.name, p2.name)
        const base1 = extractBaseName(p1.name)
        const base2 = extractBaseName(p2.name)

        const words1 = base1.split(/\s+/)
        const words2 = base2.split(/\s+/)
        const minWords = Math.min(2, words1.length, words2.length)

        let sameFirstWords = true
        for (let k = 0; k < minWords; k++) {
          if (words1[k] !== words2[k]) {
            sameFirstWords = false
            break
          }
        }

        let score = 0
        let reason = 'no match'

        if (sim >= 0.80) {
          score = sim
          reason = '80%+ similarity'
        } else if (sim >= 0.70) {
          score = 0.70
          reason = '70%+ similarity'
        } else if (sameFirstWords && minWords >= 2) {
          score = 0.68
          reason = 'same first 2 words'
        }

        if (score > 0) {
          matches.push({
            project1: p1,
            project2: p2,
            similarity: Number(sim.toFixed(2)),
            score,
            reason,
            base1,
            base2
          })
        }
      }
    }

    return Response.json({
      matador_projects: matadorProjects,
      matches
    })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    )
  }
}
