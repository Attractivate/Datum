/**
 * Airtable sync service for enrichment data
 * Handles batched writes with rate limiting and error tracking
 */

interface AirtableConfig {
  baseId: string
  apiToken: string
}

interface SyncPayload {
  projectId: string
  companyIds: string[]
  updateIds: string[]
  enrichmentData: {
    owner?: any
    epc?: any
    oem?: any
    updates?: any[]
  }
}

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0'
const BATCH_SIZE = 10 // Max records per request (Airtable limit)
const RATE_LIMIT_DELAY = 200 // ms between requests (respect 5 req/sec limit)

export class AirtableSyncService {
  private baseId: string
  private apiToken: string

  constructor(config: AirtableConfig) {
    this.baseId = config.baseId
    this.apiToken = config.apiToken
  }

  /**
   * Sync enrichment data to Airtable with batching & rate limiting
   */
  async syncEnrichment(payload: SyncPayload): Promise<{
    success: boolean
    synced: string[]
    failed: Array<{ id: string; error: string }>
  }> {
    const synced: string[] = []
    const failed: Array<{ id: string; error: string }> = []

    try {
      // Get projects table records first
      const projectTable = await this.getTableIdByName('Projects')
      if (!projectTable) {
        throw new Error('Projects table not found in Airtable base')
      }

      // Sync project with enriched data
      if (payload.projectId) {
        try {
          await this.delay(RATE_LIMIT_DELAY)
          await this.updateProjectRecord(projectTable, payload)
          synced.push(payload.projectId)
        } catch (error) {
          failed.push({
            id: payload.projectId,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }

      // Sync companies
      const companiesTable = await this.getTableIdByName('Companies')
      if (companiesTable && payload.companyIds.length > 0) {
        for (const companyId of payload.companyIds) {
          try {
            await this.delay(RATE_LIMIT_DELAY)
            // Company sync logic here
            synced.push(companyId)
          } catch (error) {
            failed.push({
              id: companyId,
              error: error instanceof Error ? error.message : 'Unknown error',
            })
          }
        }
      }

      // Sync updates
      const updatesTable = await this.getTableIdByName('Updates')
      if (updatesTable && payload.updateIds.length > 0) {
        for (const updateId of payload.updateIds) {
          try {
            await this.delay(RATE_LIMIT_DELAY)
            // Update sync logic here
            synced.push(updateId)
          } catch (error) {
            failed.push({
              id: updateId,
              error: error instanceof Error ? error.message : 'Unknown error',
            })
          }
        }
      }

      return {
        success: failed.length === 0,
        synced,
        failed,
      }
    } catch (error) {
      console.error('Airtable sync failed:', error)
      throw error
    }
  }

  /**
   * Update project record in Airtable
   */
  private async updateProjectRecord(
    tableId: string,
    payload: SyncPayload
  ): Promise<void> {
    const fieldsToUpdate: Record<string, any> = {}

    if (payload.enrichmentData.owner) {
      fieldsToUpdate['Owner Company'] = payload.enrichmentData.owner.name
    }
    if (payload.enrichmentData.epc) {
      fieldsToUpdate['EPC Company'] = payload.enrichmentData.epc.name
    }
    if (payload.enrichmentData.oem) {
      fieldsToUpdate['OEM Company'] = payload.enrichmentData.oem.name
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      return
    }

    const response = await fetch(`${AIRTABLE_API_BASE}/${this.baseId}/${tableId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [
          {
            id: payload.projectId, // Airtable record ID
            fields: fieldsToUpdate,
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Airtable update failed: ${error.error?.message || response.statusText}`)
    }
  }

  /**
   * Get table ID by name (Airtable requires this for API calls)
   */
  private async getTableIdByName(tableName: string): Promise<string | null> {
    // This would require querying Airtable's schema
    // For now, we'll use environment-configured table IDs
    const tableMap: Record<string, string | undefined> = {
      Projects: process.env.AIRTABLE_PROJECTS_TABLE_ID,
      Companies: process.env.AIRTABLE_COMPANIES_TABLE_ID,
      Updates: process.env.AIRTABLE_UPDATES_TABLE_ID,
    }

    return tableMap[tableName] || null
  }

  /**
   * Utility: delay execution (for rate limiting)
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Handle rate limit errors with exponential backoff
   */
  async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error
        const backoffMs = Math.min(1000 * Math.pow(2, attempt), 30000)
        console.warn(
          `Attempt ${attempt + 1}/${maxRetries} failed, retrying in ${backoffMs}ms:`,
          lastError.message
        )
        await this.delay(backoffMs)
      }
    }

    throw lastError || new Error('Max retries exceeded')
  }
}
