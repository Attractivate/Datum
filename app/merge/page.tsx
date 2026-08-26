'use client'

import { useState } from 'react'

interface Record {
  id: string
  name: string
  location?: string
}

type RecordType = 'projects' | 'companies'

export default function MergePage() {
  const [recordType, setRecordType] = useState<RecordType>('projects')
  const [sourceSearch, setSourceSearch] = useState('')
  const [duplicateSearch, setDuplicateSearch] = useState('')
  const [sourceResults, setSourceResults] = useState<Record[]>([])
  const [duplicateResults, setDuplicateResults] = useState<Record[]>([])
  const [selectedSource, setSelectedSource] = useState<Record | null>(null)
  const [selectedDuplicate, setSelectedDuplicate] = useState<Record | null>(null)
  const [loading, setLoading] = useState(false)
  const [searching, setSearcing] = useState(false)
  const [message, setMessage] = useState('')

  const searchRecords = async (query: string, setResults: any) => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setSearcing(true)
    try {
      const endpoint = recordType === 'projects' ? '/api/projects' : '/api/companies'
      const res = await fetch(`${endpoint}?search=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.records || [])
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setSearcing(false)
    }
  }

  const handleMerge = async () => {
    if (!selectedSource || !selectedDuplicate) {
      setMessage('Please select both source and duplicate records')
      return
    }

    if (selectedSource.id === selectedDuplicate.id) {
      setMessage('Cannot merge a record with itself')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const endpoint = recordType === 'projects' ? '/api/merge' : '/api/merge-companies'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'merge',
          canonical_project_id: selectedSource.id,
          duplicate_project_id: selectedDuplicate.id,
          canonical_id: selectedSource.id,
          duplicate_id: selectedDuplicate.id,
          merged_by: 'user'
        })
      })

      const data = await res.json()

      if (data.success) {
        setMessage(`✓ Successfully merged "${selectedDuplicate.name}" into "${selectedSource.name}"`)
        setSelectedSource(null)
        setSelectedDuplicate(null)
        setSourceSearch('')
        setDuplicateSearch('')
        setSourceResults([])
        setDuplicateResults([])
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(`✗ Merge failed: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      setMessage(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Merge Records</h1>
      <p className="text-gray-600 mb-8">Select source record to keep and duplicate record to merge</p>

      {/* Record Type Selector */}
      <div className="mb-8 flex gap-4">
        <button
          onClick={() => {
            setRecordType('projects')
            setSelectedSource(null)
            setSelectedDuplicate(null)
          }}
          className={`px-6 py-2 rounded font-semibold transition ${
            recordType === 'projects'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📊 Projects
        </button>
        <button
          onClick={() => {
            setRecordType('companies')
            setSelectedSource(null)
            setSelectedDuplicate(null)
          }}
          className={`px-6 py-2 rounded font-semibold transition ${
            recordType === 'companies'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          🏢 Companies
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded ${
            message.startsWith('✓')
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Source Record */}
        <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
          <h2 className="font-bold text-green-800 mb-4">📌 SOURCE RECORD (Keep)</h2>

          {selectedSource ? (
            <div className="mb-4">
              <p className="font-bold text-lg text-gray-900">{selectedSource.name}</p>
              {selectedSource.location && <p className="text-sm text-gray-600">{selectedSource.location}</p>}
              <button
                onClick={() => setSelectedSource(null)}
                className="mt-2 text-sm text-green-600 hover:text-green-800 font-semibold"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="space-y-2 mb-4">
              <input
                type="text"
                placeholder={`Search ${recordType}...`}
                value={sourceSearch}
                onChange={(e) => {
                  setSourceSearch(e.target.value)
                  searchRecords(e.target.value, setSourceResults)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <div className="max-h-64 overflow-y-auto space-y-1">
                {sourceResults.map((record) => (
                  <button
                    key={record.id}
                    onClick={() => setSelectedSource(record)}
                    className="w-full text-left px-3 py-2 hover:bg-green-100 rounded text-sm"
                  >
                    <div className="font-semibold text-gray-900">{record.name}</div>
                    {record.location && <div className="text-gray-600 text-xs">{record.location}</div>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Duplicate Record */}
        <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200">
          <h2 className="font-bold text-red-800 mb-4">🗑️ TO BE MERGED</h2>

          {selectedDuplicate ? (
            <div className="mb-4">
              <p className="font-bold text-lg text-gray-900">{selectedDuplicate.name}</p>
              {selectedDuplicate.location && <p className="text-sm text-gray-600">{selectedDuplicate.location}</p>}
              <button
                onClick={() => setSelectedDuplicate(null)}
                className="mt-2 text-sm text-red-600 hover:text-red-800 font-semibold"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="space-y-2 mb-4">
              <input
                type="text"
                placeholder={`Search ${recordType}...`}
                value={duplicateSearch}
                onChange={(e) => {
                  setDuplicateSearch(e.target.value)
                  searchRecords(e.target.value, setDuplicateResults)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <div className="max-h-64 overflow-y-auto space-y-1">
                {duplicateResults.map((record) => (
                  <button
                    key={record.id}
                    onClick={() => setSelectedDuplicate(record)}
                    className="w-full text-left px-3 py-2 hover:bg-red-100 rounded text-sm"
                  >
                    <div className="font-semibold text-gray-900">{record.name}</div>
                    {record.location && <div className="text-gray-600 text-xs">{record.location}</div>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleMerge}
        disabled={loading || !selectedSource || !selectedDuplicate}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
      >
        {loading ? 'Merging...' : '💾 Save & Merge'}
      </button>
    </div>
  )
}
