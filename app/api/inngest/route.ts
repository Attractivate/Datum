/**
 * Inngest webhook handler
 * Manages job queue events and worker executions
 */

import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest'
import { AirtableSyncService } from '@/lib/airtable-sync'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Worker: Sync enrichment data to Airtable
 */
const syncToAirtable = inngest.createFunction(
  {
    id: 'enrich-sync-to-airtable',
    name: 'Sync Enrichment to Airtable',
    retryConfig: {
      initialDelayMs: 1000,
      maxAttempts: 3,
      backoffFactor: 2.0,
    },
    throttle: {
      limit: 10,
      period: '1m', // Max 10 syncs per minute (respect rate limits)
    },
  },
  { event: 'enrichment/sync-required' },
  async ({ event, step }) => {
    const { projectId, companyIds, updateIds, enrichmentData } = event.data

    console.log(`[Inngest] Starting sync for project: ${projectId}`)

    // Initialize Airtable service
    const airtableService = new AirtableSyncService({
      baseId: process.env.AIRTABLE_BASE_ID!,
      apiToken: process.env.AIRTABLE_API_TOKEN!,
    })

    try {
      // Wait for sync with retry logic
      const syncResult = await step.run('sync-to-airtable', async () => {
        return airtableService.syncEnrichment({
          projectId,
          companyIds,
          updateIds,
          enrichmentData,
        })
      })

      // Log sync results
      await step.run('log-sync-results', async () => {
        if (syncResult.success) {
          console.log(`[Inngest] Sync succeeded for ${projectId}:`, {
            synced: syncResult.synced.length,
            failed: syncResult.failed.length,
          })

          // Mark records as synced in Supabase
          await markSynced(projectId, companyIds, updateIds, syncResult.synced)
        } else {
          console.warn(`[Inngest] Sync partially failed for ${projectId}:`, syncResult)
          // Log failures but don't fail the job (data is already in Supabase)
          await logSyncFailures(projectId, syncResult.failed)
        }

        return syncResult
      })

      return {
        success: true,
        projectId,
        synced: syncResult.synced.length,
        failed: syncResult.failed.length,
      }
    } catch (error) {
      console.error(`[Inngest] Sync failed for project ${projectId}:`, error)

      // Log to sync_log table for audit trail
      await logSyncError(projectId, error)

      // Don't throw - data is already in Supabase, just log for manual review
      return {
        success: false,
        projectId,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Airtable sync failed but Supabase data is intact. Will retry.',
      }
    }
  }
)

/**
 * Mark records as synced in Supabase
 */
async function markSynced(
  projectId: string,
  companyIds: string[],
  updateIds: string[],
  syncedIds: string[]
): Promise<void> {
  const now = new Date().toISOString()

  // Mark projects as synced
  if (syncedIds.includes(projectId)) {
    await supabase
      .from('projects')
      .update({
        synced_to_airtable: true,
        last_airtable_sync: now,
      })
      .eq('id', projectId)
      .catch((err) => console.error('Failed to mark project synced:', err))
  }

  // Mark companies as synced
  for (const companyId of companyIds) {
    if (syncedIds.includes(companyId)) {
      await supabase
        .from('companies')
        .update({
          synced_to_airtable: true,
          last_airtable_sync: now,
        })
        .eq('id', companyId)
        .catch((err) => console.error('Failed to mark company synced:', err))
    }
  }

  // Mark updates as synced
  for (const updateId of updateIds) {
    if (syncedIds.includes(updateId)) {
      await supabase
        .from('project_updates')
        .update({
          synced_to_airtable: true,
          last_airtable_sync: now,
        })
        .eq('id', updateId)
        .catch((err) => console.error('Failed to mark update synced:', err))
    }
  }
}

/**
 * Log sync failures for manual review
 */
async function logSyncFailures(
  projectId: string,
  failures: Array<{ id: string; error: string }>
): Promise<void> {
  for (const failure of failures) {
    await supabase
      .from('enrichment_sync_log')
      .insert([
        {
          project_id: projectId,
          sync_type: 'enrichment',
          status: 'failed',
          error_message: failure.error,
          attempt_count: 1,
        },
      ])
      .catch((err) => console.error('Failed to log sync failure:', err))
  }
}

/**
 * Log sync errors for debugging
 */
async function logSyncError(projectId: string, error: any): Promise<void> {
  await supabase
    .from('enrichment_sync_log')
    .insert([
      {
        project_id: projectId,
        sync_type: 'enrichment',
        status: 'failed',
        error_message: error instanceof Error ? error.message : String(error),
        attempt_count: 1,
      },
    ])
    .catch((err) => console.error('Failed to log error:', err))
}

/**
 * Serve Inngest functions as API endpoints
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [syncToAirtable],
})
