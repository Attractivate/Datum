'use client'

import { useState, useEffect } from 'react'

interface Project {
  id: string
  name: string
  location?: string
  state?: string
  capacity_mw?: number
}

interface Candidate {
  canonical: Project
  duplicate: Project
  confidence_score: number
  match_reason: string
}

export default function DuplicatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/scan', {
      method: 'POST',
      body: JSON.stringify({ limit: 100 })
    })
      .then(r => r.json())
      .then(d => {
        setCandidates(d.candidates || [])
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-8">Loading duplicates...</div>
  if (!candidates.length) return <div className="p-8">No duplicates found</div>

  const c = candidates[current]

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Review Duplicates</h1>
      <p className="text-gray-600 mb-8">{current + 1} of {candidates.length}</p>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="bg-green-50 p-6 border-2 border-green-200 rounded">
          <h2 className="font-bold text-green-800 mb-4">KEEP THIS</h2>
          <p className="text-xl font-bold mb-2">{c.canonical.name}</p>
          <p className="text-sm text-gray-600">{c.canonical.location}</p>
        </div>
        <div className="bg-red-50 p-6 border-2 border-red-200 rounded">
          <h2 className="font-bold text-red-800 mb-4">MERGE THIS INTO THE LEFT</h2>
          <p className="text-xl font-bold mb-2">{c.duplicate.name}</p>
          <p className="text-sm text-gray-600">{c.duplicate.location}</p>
          <p className="text-xs text-gray-500 mt-4">{c.match_reason} ({(c.confidence_score*100).toFixed(0)}%)</p>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => {
            fetch('/api/merge', {
              method: 'POST',
              body: JSON.stringify({
                action: 'merge',
                canonical_project_id: c.canonical.id,
                duplicate_project_id: c.duplicate.id,
                merged_by: 'user'
              })
            }).then(() => setCurrent(current + 1))
          }}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded"
        >
          ✓ MERGE
        </button>
        <button
          onClick={() => setCurrent(current + 1)}
          className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded"
        >
          SKIP
        </button>
      </div>
    </div>
  )
}
