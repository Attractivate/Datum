import { Inngest } from 'inngest'

export const inngest = new Inngest({
  id: 'datum',
  name: 'Datum Enrichment Pipeline',
  retryConfig: {
    initialDelayMs: 1000,
    maxAttempts: 3,
    backoffFactor: 2.0,
  },
})

export const events = {
  enrichmentSyncRequired: inngest.createEventType({
    name: 'enrichment/sync-required',
    data: {
      type: 'object',
      properties: {
        projectId: { type: 'string' },
        companyIds: { type: 'array', items: { type: 'string' } },
        updateIds: { type: 'array', items: { type: 'string' } },
        enrichmentData: { type: 'object' },
      },
      required: ['projectId'],
    },
  }),
}
