import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface Company {
  id: string
  name: string
  industry?: string
  location?: string
}

interface Candidate {
  canonical: Company
  duplicate: Company
  confidence_score: number
  match_reason: string
}

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

function findBestMatch(
  canonical: Company,
  duplicate: Company
): { score: number; reason: string } | null {
  const nameSim = nameSimilarity(canonical.name, duplicate.name)

  if (nameSim >= 0.90) {
    return { score: 0.90, reason: 'name_very_similar' }
  }

  if (nameSim >= 0.80) {
    return { score: 0.85, reason: 'name_similar' }
  }

  if (nameSim >= 0.70) {
    return { score: 0.70, reason: 'name_similar_70_percent' }
  }

  const base1 = extractBaseName(canonical.name).split(/\s+/)
  const base2 = extractBaseName(duplicate.name).split(/\s+/)
  const minWords = Math.min(2, base1.length, base2.length)

  let sameFirstWords = true
  for (let i = 0; i < minWords; i++) {
    if (base1[i] !== base2[i]) {
      sameFirstWords = false
      break
    }
  }

  if (sameFirstWords && minWords >= 2) {
    return { score: 0.68, reason: 'same_first_words' }
  }

  return null
}

export async function scanForDuplicateCompanies(
  limit: number = 100
): Promise<Candidate[]> {
  const { data: companies, error } = await supabase
    .from('companies')
    .select('id, name, industry, location')

  if (error || !companies) {
    console.error('[Company Dedup] Failed to fetch companies:', error)
    return []
  }

  console.log(`[Company Dedup] Scanning ${companies.length} companies`)

  const candidates: Candidate[] = []
  const seenPairs = new Set<string>()
  const nameIndex = new Map<string, Company[]>()

  // Build index by first word
  for (const c of companies) {
    const baseName = extractBaseName(c.name)
    const firstWord = baseName.split(/\s+/)[0]

    if (!nameIndex.has(firstWord)) {
      nameIndex.set(firstWord, [])
    }
    nameIndex.get(firstWord)!.push(c)
  }

  // Compare within groups
  for (const [, groupCompanies] of nameIndex) {
    for (let i = 0; i < groupCompanies.length && candidates.length < limit; i++) {
      for (let j = i + 1; j < groupCompanies.length && candidates.length < limit; j++) {
        const c1 = groupCompanies[i]
        const c2 = groupCompanies[j]

        const pairKey = [c1.id, c2.id].sort().join('|')
        if (seenPairs.has(pairKey)) continue
        seenPairs.add(pairKey)

        const match = findBestMatch(c1, c2)
        if (!match) continue

        candidates.push({
          canonical: c1,
          duplicate: c2,
          confidence_score: match.score,
          match_reason: match.reason
        })
      }
    }

    if (candidates.length >= limit) break
  }

  console.log(`[Company Dedup] Found ${candidates.length} similar companies`)
  return candidates.sort((a, b) => b.confidence_score - a.confidence_score)
}

export async function mergeCompanies(
  canonicalId: string,
  duplicateId: string,
  mergedBy: string = 'system'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update all project references
    const { error: updateError } = await supabase
      .from('company_roles')
      .update({ company_id: canonicalId })
      .eq('company_id', duplicateId)

    if (updateError) throw new Error(`Company role update failed: ${updateError.message}`)

    // Mark duplicate as merged
    const { error: archiveError } = await supabase
      .from('companies')
      .update({ is_duplicate: true })
      .eq('id', duplicateId)

    if (archiveError) throw new Error(`Archive failed: ${archiveError.message}`)

    console.log(`[Company Dedup] Successfully merged ${duplicateId} into ${canonicalId}`)
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Company Dedup] Merge failed:', message)
    return { success: false, error: message }
  }
}
