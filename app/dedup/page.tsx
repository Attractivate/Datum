'use client'

import { useState, useEffect } from 'react'

interface Project {
  id: string
  name: string
  location?: string
  state?: string
  capacity_mw?: number
  developer_id?: string
  owner_id?: string
}

interface Candidate {
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

export default function DeduplicationPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [merging, setMerging] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadCandidates()
  }, [])

  async function loadCandidates() {
    try {
      setLoading(true)
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 100 })
      })
      const data = await res.json()
      setCandidates(data.candidates || [])
      setMessage(`Found ${data.candidates_found} duplicate candidates`)
    } catch (error) {
      setMessage(`Error loading candidates: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  async function merge() {
    if (currentIndex >= candidates.length) return

    const current = candidates[currentIndex]
    setMerging(true)

    try {
      const res = await fetch('/api/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'merge',
          canonical_project_id: current.canonical.id,
          duplicate_project_id: current.duplicate.id,
          merged_by: 'user'
        })
      })

      if (res.ok) {
        const result = await res.json()
        setMessage(
          `✓ Merged "${current.duplicate.name}" into "${current.canonical.name}"`
        )
        moveNext()
      } else {
        const error = await res.json()
        setMessage(`✗ Error: ${error.error}`)
      }
    } catch (error) {
      setMessage(`Error: ${error}`)
    } finally {
      setMerging(false)
    }
  }

  function skip() {
    moveNext()
  }

  function moveNext() {
    if (currentIndex < candidates.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setMessage('')
    } else {
      setMessage('No more candidates to review')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Deduplication Review</h1>
        <p>Loading candidates...</p>
      </div>
    )
  }

  if (candidates.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Deduplication Review</h1>
        <p>No duplicate candidates found</p>
      </div>
    )
  }

  const current = candidates[currentIndex]

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Deduplication Review</h1>
      <p className="text-gray-600 mb-6">
        {currentIndex + 1} of {candidates.length} candidates
      </p>

      {message && (
        <div
          className={`mb-6 p-4 rounded ${
            message.startsWith('✓')
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Canonical (Keep) */}
        <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50">
          <h2 className="font-bold text-green-800 mb-4">KEEP (Canonical)</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-gray-600">Name</p>
              <p className="text-lg font-bold">{current.canonical.name}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Location</p>
              <p>{current.canonical.location || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">State</p>
              <p>{current.canonical.state || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Capacity</p>
              <p>{current.canonical.capacity_mw ? `${current.canonical.capacity_mw} MW` : '—'}</p>
            </div>
            <div className="text-xs text-gray-500 pt-2 border-t">
              <p>Updates: {current.data_summary.updates_count}</p>
              <p>Milestones: {current.data_summary.milestones_count}</p>
              <p>Companies: {current.data_summary.companies_linked}</p>
            </div>
          </div>
        </div>

        {/* Duplicate (Merge Into) */}
        <div className="border-2 border-red-200 rounded-lg p-6 bg-red-50">
          <h2 className="font-bold text-red-800 mb-4">MERGE (Duplicate)</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-gray-600">Name</p>
              <p className="text-lg font-bold">{current.duplicate.name}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Location</p>
              <p>{current.duplicate.location || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">State</p>
              <p>{current.duplicate.state || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Capacity</p>
              <p>{current.duplicate.capacity_mw ? `${current.duplicate.capacity_mw} MW` : '—'}</p>
            </div>
            <div className="text-xs text-gray-500 pt-2 border-t">
              <p>Match: {current.match_reason}</p>
              <p>Score: {(current.confidence_score * 100).toFixed(0)}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <button
          onClick={merge}
          disabled={merging}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded disabled:opacity-50"
        >
          {merging ? 'Merging...' : '✓ Merge These Projects'}
        </button>
        <button
          onClick={skip}
          disabled={merging}
          className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded disabled:opacity-50"
        >
          Skip / Not a Match
        </button>
      </div>

      {currentIndex < candidates.length - 1 && (
        <button
          onClick={loadCandidates}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Reload Candidates
        </button>
      )}
    </div>
  )
}
