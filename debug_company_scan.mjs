import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

function extractBaseName(name) {
  return name.split(/[,\(]/)[0].toLowerCase().trim()
}

function levenshteinDistance(s1, s2) {
  const len1 = s1.length, len2 = s2.length
  const d = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0))
  for (let i = 0; i <= len1; i++) d[i][0] = i
  for (let j = 0; j <= len2; j++) d[0][j] = j
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
    }
  }
  return d[len1][len2]
}

function nameSimilarity(s1, s2) {
  const s1Lower = s1.toLowerCase().trim(), s2Lower = s2.toLowerCase().trim()
  if (s1Lower === s2Lower) return 1.0
  const s1Base = extractBaseName(s1), s2Base = extractBaseName(s2)
  if (s1Base === s2Base) return 1.0
  const maxLen = Math.max(s1Base.length, s2Base.length)
  const distance = levenshteinDistance(s1Base, s2Base)
  const similarity = 1 - distance / maxLen
  return Math.max(0, Math.min(1, similarity))
}

function findBestMatch(c1, c2) {
  const nameSim = nameSimilarity(c1.name, c2.name)
  if (nameSim >= 0.90) return { score: 0.90, reason: 'name_very_similar' }
  if (nameSim >= 0.80) return { score: 0.85, reason: 'name_similar' }
  if (nameSim >= 0.70) return { score: 0.70, reason: 'name_similar_70_percent' }
  
  const canBase = extractBaseName(c1.name).split(/\s+/)
  const dupBase = extractBaseName(c2.name).split(/\s+/)
  const minWords = Math.min(2, canBase.length, dupBase.length)
  let sameFirstWords = true
  for (let i = 0; i < minWords; i++) {
    if (canBase[i] !== dupBase[i]) { sameFirstWords = false; break }
  }
  if (sameFirstWords && minWords >= 2) return { score: 0.68, reason: 'same_first_words' }
  return null
}

async function scan() {
  const { data: companies } = await supabase.from('companies').select('id, name')
  console.log(`Fetched ${companies?.length} companies\n`)

  const candidates = [], seenPairs = new Set(), nameIndex = new Map()
  
  for (const c of companies || []) {
    const baseName = extractBaseName(c.name)
    const firstWord = baseName.split(/\s+/)[0]
    if (!nameIndex.has(firstWord)) nameIndex.set(firstWord, [])
    nameIndex.get(firstWord).push(c)
  }

  console.log(`Built index with ${nameIndex.size} unique first words\n`)

  let groups_with_matches = 0
  for (const [word, group] of nameIndex) {
    let group_has_matches = false
    for (let i = 0; i < group.length && candidates.length < 100; i++) {
      for (let j = i + 1; j < group.length && candidates.length < 100; j++) {
        const c1 = group[i], c2 = group[j]
        const pairKey = [c1.id, c2.id].sort().join('|')
        if (seenPairs.has(pairKey)) continue
        seenPairs.add(pairKey)
        
        const match = findBestMatch(c1, c2)
        if (match) {
          group_has_matches = true
          candidates.push({canonical: c1, duplicate: c2, ...match})
        }
      }
    }
    if (group_has_matches) groups_with_matches++
  }

  console.log(`✓ Groups with matches: ${groups_with_matches}`)
  console.log(`✓ Total candidates found: ${candidates.length}`)
  
  if (candidates.length > 0) {
    console.log(`\nTop 10:`)
    candidates.slice(0, 10).forEach((c, i) => {
      console.log(`${i+1}. "${c.canonical.name}" vs "${c.duplicate.name}" (${c.score})`)
    })
  }
}

scan().catch(console.error)
