/**
 * Deduplication Service
 *
 * Identifies and merges duplicate projects with fuzzy name matching:
 * - Tier 1 (0.90): Very similar name (90%+)
 * - Tier 2 (0.85): Similar name (80%+) + same location
 * - Tier 3 (0.80): Similar name (80%+) alone
 * - Tier 4 (0.75): Similar name (75%+) alone
 * - Tier 5 (0.70): Same company (owner/developer) + location
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface Project {
  id: string
  name: string
  location?: string
  state?: string
  capacity_mw?: number
  developer_id?: string
  owner_id?: string
}

interface DeduplicationCandidate {
  canonical: Project
  duplicate: Project
  confidence_score: number
  match_reason: string
  data_summary: {
    updates_count: number
    milestones_count: number
    companies_linked: number
  }
}

/**
 * Levenshtein distance for fuzzy string matching
 * Returns number of edits needed to transform s1 to s2
 */
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
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost // substitution
      )
    }
  }

  return d[len1][len2]
}

/**
 * Calculate similarity percentage (0-1) using Jaro-Winkler
 */
function nameSimilarity(s1: string, s2: string): number {
  const s1Lower = s1.toLowerCase().trim()
  const s2Lower = s2.toLowerCase().trim()

  if (s1Lower === s2Lower) return 1.0

  const maxLen = Math.max(s1Lower.length, s2Lower.length)
  const distance = levenshteinDistance(s1Lower, s2Lower)
  const similarity = 1 - distance / maxLen

  return Math.max(0, Math.min(1, similarity))
}

/**
 * Simplified matching: focus on what actually identifies duplicates
 */
function findBestMatch(
  canonical: Project,
  duplicate: Project
): { score: number; reason: string } | null {
  // Tier 1: Very similar name (90%+) - usually duplicates
  const nameSim = nameSimilarity(canonical.name, duplicate.name)
  if (nameSim >= 0.90) {
    return { score: 0.90, reason: 'name_very_similar' }
  }

  // Tier 2: High name similarity (80%+) + same location
  if (nameSim >= 0.80) {
    const sameLocation = canonical.state === duplicate.state
    if (sameLocation) {
      return { score: 0.85, reason: 'name_similar_same_location' }
    }
    // Even without location, high name sim is suspicious
    return { score: 0.80, reason: 'name_high_similarity' }
  }

  // Tier 3: Similar name (75%+) alone is suspicious enough
  if (nameSim >= 0.75) {
    return { score: 0.75, reason: 'name_similar_75_percent' }
  }

  // Tier 4: Same company (if available) + location
  const sameOwner =
    canonical.owner_id &&
    duplicate.owner_id &&
    canonical.owner_id === duplicate.owner_id
  const sameDeveloper =
    canonical.developer_id &&
    duplicate.developer_id &&
    canonical.developer_id === duplicate.developer_id

  if (sameOwner || sameDeveloper) {
    const sameLocation = canonical.state === duplicate.state
    if (sameLocation) {
      return { score: 0.70, reason: 'same_company_location' }
    }
  }

  return null
}

/**
 * Get data summary for a project
 */
async function getProjectDataSummary(projectId: string) {
  const { data: updates } = await supabase
    .from('project_updates')
    .select('id')
    .eq('project_id', projectId)

  const { data: milestones } = await supabase
    .from('milestones')
    .select('id')
    .eq('project_id', projectId)

  const { data: companies } = await supabase
    .from('company_roles')
    .select('id')
    .eq('project_id', projectId)

  return {
    updates_count: updates?.length || 0,
    milestones_count: milestones?.length || 0,
    companies_linked: companies?.length || 0
  }
}

/**
 * Scan for duplicate projects
 * @param minConfidence Minimum confidence score (0.6-0.99)
 * @param limit Maximum candidates to return
 */
export async function scanForDuplicates(
  minConfidence: number = 0.7,
  limit: number = 100
): Promise<DeduplicationCandidate[]> {
  console.log(`[Dedup] Scanning for duplicates (confidence >= ${minConfidence})`)

  // Fetch all projects (scan all, filter will be applied after matching)
  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, name, location, state, capacity_mw, developer_id, owner_id')

  if (error || !projects) {
    console.error('[Dedup] Failed to fetch projects:', error)
    return []
  }

  console.log(`[Dedup] Scanning ${projects.length} projects`)
  if (projects.length > 0) {
    console.log('[Dedup] Sample project:', JSON.stringify(projects[0], null, 2))
  }

  const candidates: DeduplicationCandidate[] = []
  const seenPairs = new Set<string>()

  // Compare each project pair and find ALL matches (even low-confidence ones)
  // User will review and approve/reject each
  for (let i = 0; i < projects.length; i++) {
    for (let j = i + 1; j < projects.length; j++) {
      const p1 = projects[i]
      const p2 = projects[j]

      const pairKey = [p1.id, p2.id].sort().join('|')
      if (seenPairs.has(pairKey)) continue
      seenPairs.add(pairKey)

      const match = findBestMatch(p1, p2)
      // Include ALL matches found, even below minConfidence
      // User reviews and decides
      if (!match) continue

      const dataSummary = await getProjectDataSummary(p1.id)

      candidates.push({
        canonical: p1,
        duplicate: p2,
        confidence_score: match.score,
        match_reason: match.reason,
        data_summary: dataSummary
      })

      if (candidates.length >= limit) break
    }
    if (candidates.length >= limit) break
  }

  console.log(`[Dedup] Found ${candidates.length} similar projects for review`)
  return candidates.sort((a, b) => b.confidence_score - a.confidence_score)
}

/**
 * Create deduplication candidate records
 */
export async function recordCandidates(
  candidates: DeduplicationCandidate[]
): Promise<void> {
  const records = candidates.map(c => ({
    canonical_project_id: c.canonical.id,
    duplicate_project_id: c.duplicate.id,
    confidence_score: c.confidence_score,
    match_reason: c.match_reason,
    status: 'pending'
  }))

  const { error } = await supabase
    .from('project_deduplication')
    .insert(records)

  if (error) {
    console.error('[Dedup] Failed to record candidates:', error)
  } else {
    console.log(`[Dedup] Recorded ${records.length} candidates for review`)
  }
}

/**
 * Merge duplicate into canonical project
 * Non-destructive: archives duplicate, reassigns data
 */
export async function mergeDuplicateProject(
  canonicalId: string,
  duplicateId: string,
  mergedBy: string = 'system'
): Promise<{ success: boolean; error?: string; moveCount?: any }> {
  try {
    // 1. Reassign all updates
    const { error: updateError } = await supabase
      .from('project_updates')
      .update({
        project_id: canonicalId,
        original_project_id: duplicateId,
        reassigned_at: new Date().toISOString(),
        reassignment_reason: 'deduplication_merge'
      })
      .eq('project_id', duplicateId)

    if (updateError) throw new Error(`Update reassignment failed: ${updateError.message}`)

    // 2. Reassign milestones (excluding exact duplicates)
    const { data: duplicateMilestones } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', duplicateId)

    if (duplicateMilestones) {
      for (const milestone of duplicateMilestones) {
        // Check if canonical already has this milestone
        const { data: existingMilestone } = await supabase
          .from('milestones')
          .select('id')
          .eq('project_id', canonicalId)
          .eq('detail_type', milestone.detail_type)
          .eq('date_target', milestone.date_target)
          .limit(1)

        if (existingMilestone?.length === 0) {
          // Unique milestone, reassign to canonical
          await supabase
            .from('milestones')
            .update({ project_id: canonicalId })
            .eq('id', milestone.id)
        }
        // Otherwise skip (duplicate milestone, keep canonical's version)
      }
    }

    // 3. Merge company relationships
    const { data: duplicateCompanies } = await supabase
      .from('company_roles')
      .select('company_id, role, details')
      .eq('project_id', duplicateId)

    if (duplicateCompanies) {
      for (const comp of duplicateCompanies) {
        // Check if canonical already has this company+role
        const { data: existingRole } = await supabase
          .from('company_roles')
          .select('id')
          .eq('project_id', canonicalId)
          .eq('company_id', comp.company_id)
          .eq('role', comp.role)
          .limit(1)

        if (existingRole?.length === 0) {
          // Insert new company role
          await supabase.from('company_roles').insert({
            project_id: canonicalId,
            company_id: comp.company_id,
            role: comp.role,
            details: comp.details
          })
        }
      }

      // Delete duplicate's company roles
      await supabase
        .from('company_roles')
        .delete()
        .eq('project_id', duplicateId)
    }

    // 4. Archive the duplicate project
    const { error: archiveError } = await supabase
      .from('projects')
      .update({
        is_duplicate: true,
        canonical_project_id: canonicalId,
        dedup_status: 'merged'
      })
      .eq('id', duplicateId)

    if (archiveError) throw new Error(`Archive failed: ${archiveError.message}`)

    // 5. Create audit log
    const moveCount = {
      updates: duplicateMilestones?.length || 0,
      milestones: duplicateMilestones?.length || 0,
      companies: duplicateCompanies?.length || 0
    }

    const { error: logError } = await supabase
      .from('project_merge_log')
      .insert({
        old_project_id: duplicateId,
        new_project_id: canonicalId,
        data_moved: moveCount,
        merged_by: mergedBy,
        status: 'completed'
      })

    if (logError) console.warn('[Dedup] Merge log failed:', logError)

    // 6. Update deduplication status
    await supabase
      .from('project_deduplication')
      .update({ status: 'merged', merged_at: new Date().toISOString() })
      .eq('canonical_project_id', canonicalId)
      .eq('duplicate_project_id', duplicateId)

    console.log(
      `[Dedup] Successfully merged ${duplicateId} into ${canonicalId}`,
      moveCount
    )

    return { success: true, moveCount }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Dedup] Merge failed:', message)
    return { success: false, error: message }
  }
}

/**
 * Rollback a merge
 */
export async function rollbackMerge(
  oldProjectId: string,
  newProjectId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the merge log to see what was moved
    const { data: mergeLog, error: logError } = await supabase
      .from('project_merge_log')
      .select('*')
      .eq('old_project_id', oldProjectId)
      .eq('new_project_id', newProjectId)
      .single()

    if (logError || !mergeLog) {
      throw new Error('Merge log not found')
    }

    // Restore old project
    const { error: restoreError } = await supabase
      .from('projects')
      .update({
        is_duplicate: false,
        canonical_project_id: null,
        dedup_status: 'unreviewed'
      })
      .eq('id', oldProjectId)

    if (restoreError) throw new Error(`Restore failed: ${restoreError.message}`)

    // Reassign updates back
    const { error: updateError } = await supabase
      .from('project_updates')
      .update({
        project_id: oldProjectId,
        original_project_id: null,
        reassigned_at: null
      })
      .eq('original_project_id', oldProjectId)

    if (updateError) console.warn('[Dedup] Update rollback partial:', updateError)

    // Update merge log status
    await supabase
      .from('project_merge_log')
      .update({ status: 'rolled_back' })
      .eq('id', mergeLog.id)

    console.log(`[Dedup] Rolled back merge of ${oldProjectId}`)
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Dedup] Rollback failed:', message)
    return { success: false, error: message }
  }
}
