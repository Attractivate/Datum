'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import type { Project } from '@/lib/types'
import { industriesConfig, capacityBands } from '@/lib/industries-config'

type ProjectRow = Project & {
  owner?: string | { name: string }
}

export default function ProjectsList() {
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [companies, setCompanies] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ ind: 'all', type: 'all', capacity: 'all', stage: 'all', state: 'all', past: false, review: false })
  const [sort, setSort] = useState({ key: 'name', dir: 1 })
  const [perPage, setPerPage] = useState('100')

  // Fetch companies for owner lookup
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch('/api/companies')
        const data = await res.json()
        const lookup: Record<string, string> = {}
        data.data?.forEach((company: any) => {
          lookup[company.id] = company.name
        })
        setCompanies(lookup)
      } catch (error) {
        console.error('Failed to fetch companies:', error)
      }
    }

    fetchCompanies()
  }, [])

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (filters.ind !== 'all') params.append('industry', filters.ind)
        if (filters.type !== 'all') params.append('type', filters.type)
        if (filters.stage !== 'all') params.append('stage', filters.stage)
        if (filters.state !== 'all') params.append('state', filters.state)
        if (filters.capacity !== 'all') params.append('capacity', filters.capacity)
        if (filters.past) params.append('past_due', 'true')
        if (filters.review) params.append('needs_review', 'true')
        if (search) params.append('search', search)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
        try {
          const res = await fetch(`/api/projects?${params.toString()}`, { signal: controller.signal })
          const data = await res.json()
          setProjects(data.data || [])
        } finally {
          clearTimeout(timeoutId)
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error)
        setProjects([])
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [filters, search])

  // Extract unique project types grouped by industry
  const projectTypesByIndustry = useMemo(() => {
    const types: Record<string, Set<string>> = {}
    projects.forEach(p => {
      if (p.industryRaw && typeof p.industryRaw === 'string') {
        const parts = p.industryRaw.split(' - ')
        if (parts.length === 2) {
          const [industry, type] = parts
          if (!types[industry]) types[industry] = new Set()
          types[industry].add(type)
        }
      }
    })
    return Object.entries(types).reduce((acc, [ind, typeSet]) => {
      acc[ind] = Array.from(typeSet).sort()
      return acc
    }, {} as Record<string, string[]>)
  }, [projects])

  // Get available types for selected industry (from config if no data yet, or from projects)
  const availableTypes = useMemo(() => {
    if (filters.ind === 'all') return []
    const configTypes = industriesConfig[filters.ind as keyof typeof industriesConfig]?.types || []
    const dataTypes = projectTypesByIndustry[filters.ind] || []
    // Use data types if we have them, otherwise use config
    return dataTypes.length > 0 ? dataTypes : configTypes
  }, [filters.ind, projectTypesByIndustry])

  // Get industry display name
  const getIndustryDisplayName = (industryKey: string) => {
    if (industryKey === 'all') return 'All'
    return industryKey
  }

  const inBand = (value: number, band: string) => {
    if (band === 'all') return true
    if (value === 0) return false
    const [lo, hi] = band.split('-').map(x => x === '' ? Infinity : parseFloat(x))
    return value >= lo && value < hi
  }

  const filtered = useMemo(() => {
    return projects.filter(p => {
      const matchSearch = search === '' || p.name.toLowerCase().includes(search.toLowerCase()) ||
                         (typeof p.owner === 'string' ? p.owner : p.owner?.name || '').toLowerCase().includes(search.toLowerCase()) ||
                         p.location.toLowerCase().includes(search.toLowerCase())
      const matchCapacity = inBand(p.capacity_mw || 0, filters.capacity)
      const matchStage = filters.stage === 'all' || p.stage === filters.stage
      const matchState = filters.state === 'all' || p.state === filters.state
      const matchPast = !filters.past || p.past_due
      const matchReview = !filters.review || p.needs_review
      const matchType = filters.type === 'all' || (p.industryRaw && p.industryRaw.includes(` - ${filters.type}`))
      return matchSearch && matchCapacity && matchStage && matchState && matchPast && matchReview && matchType
    })
  }, [projects, search, filters])

  const sorted = useMemo(() => {
    const copy = [...filtered]
    copy.sort((a, b) => {
      let aVal: any = sort.key === 'name' ? a.name : a[sort.key as keyof Project]
      let bVal: any = sort.key === 'name' ? b.name : b[sort.key as keyof Project]

      if (sort.key === 'capacity_mw') {
        const aCapacity = a.capacity_mw || 0
        const bCapacity = b.capacity_mw || 0
        if (aCapacity === 0 && bCapacity === 0) return 0
        if (aCapacity === 0) return 1
        if (bCapacity === 0) return -1
        return (aCapacity - bCapacity) * sort.dir
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * sort.dir
      }
      return 0
    })
    return copy
  }, [filtered, sort])

  const displayLimit = perPage === 'all' ? sorted.length : parseInt(perPage)
  const paginated = sorted.slice(0, displayLimit)

  const getOwnerDisplay = (owner: any) => {
    if (Array.isArray(owner)) {
      // Array of linked record IDs - look up company names
      if (owner.length > 0) {
        const names = owner.map(id => {
          const name = companies[id]
          return name || id
        })
        return names.join(', ')
      }
      return '—'
    }
    if (typeof owner === 'object' && owner?.name) {
      return owner.name
    }
    if (typeof owner === 'string') {
      // Single ID - look up company name
      return (companies[owner] || owner) || '—'
    }
    return '—'
  }

  return (
    <main style={{ maxWidth: '96rem', margin: '0 auto', padding: '1.4rem clamp(1rem, 3vw, 2rem) 5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0.4rem 1.5rem' }}>
        <h1 style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 900, fontSize: 'clamp(1.6rem, 4vw, 2.1rem)', letterSpacing: '-.03em', lineHeight: 1, margin: 0, marginRight: 'auto' }}>
          Projects
        </h1>
        <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.7rem', color: '#5A5D78' }}>
          {filtered.length} active · last run 22 Aug 2026
        </span>
      </div>

      {/* Controls */}
      <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', boxShadow: '0 1px 2px rgba(28,1,64,.06)', padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="search"
            placeholder="Search project, owner or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: '1 1 18rem', fontFamily: 'inherit', fontSize: '0.92rem', color: '#1C0140', background: '#F4F5FA', border: '1px solid #D6D9E8', borderRadius: '3px', padding: '0.5rem 0.75rem' }}
          />
        </div>

        {/* Industry Filter - Dynamic from config */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78', width: '4.6rem', flexShrink: 0 }}>Industry</span>
          <button
            onClick={() => setFilters({ ...filters, ind: 'all', type: 'all' })}
            style={{
              fontFamily: 'inherit', fontSize: '0.8rem', cursor: 'pointer',
              background: filters.ind === 'all' ? '#376BE9' : '#E9EBF5',
              color: filters.ind === 'all' ? '#FFFFFF' : '#1C0140',
              border: '1px solid transparent', borderRadius: '999px', padding: '0.24rem 0.7rem',
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            }}
            onMouseEnter={(e) => { if (filters.ind !== 'all') e.currentTarget.style.borderColor = '#376BE9' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent' }}
          >
            All
          </button>
          {Object.keys(industriesConfig).map((ind) => (
            <button
              key={ind}
              onClick={() => setFilters({ ...filters, ind, type: 'all' })}
              style={{
                fontFamily: 'inherit', fontSize: '0.8rem', cursor: 'pointer',
                background: filters.ind === ind ? '#376BE9' : '#E9EBF5',
                color: filters.ind === ind ? '#FFFFFF' : '#1C0140',
                border: '1px solid transparent', borderRadius: '999px', padding: '0.24rem 0.7rem',
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              }}
              onMouseEnter={(e) => { if (filters.ind !== ind) e.currentTarget.style.borderColor = '#376BE9' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent' }}
            >
              {ind}
            </button>
          ))}
        </div>

        {/* Project Type Filter */}
        {availableTypes.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78', width: '4.6rem', flexShrink: 0 }}>Type</span>
            <button
              onClick={() => setFilters({ ...filters, type: 'all' })}
              style={{
                fontFamily: 'inherit', fontSize: '0.8rem', cursor: 'pointer',
                background: filters.type === 'all' ? '#376BE9' : '#E9EBF5',
                color: filters.type === 'all' ? '#FFFFFF' : '#1C0140',
                border: '1px solid transparent', borderRadius: '999px', padding: '0.24rem 0.7rem',
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              }}
              onMouseEnter={(e) => { if (filters.type !== 'all') e.currentTarget.style.borderColor = '#376BE9' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent' }}
            >
              Any
            </button>
            {availableTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilters({ ...filters, type })}
                style={{
                  fontFamily: 'inherit', fontSize: '0.8rem', cursor: 'pointer',
                  background: filters.type === type ? '#376BE9' : '#E9EBF5',
                  color: filters.type === type ? '#FFFFFF' : '#1C0140',
                  border: '1px solid transparent', borderRadius: '999px', padding: '0.24rem 0.7rem',
                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                }}
                onMouseEnter={(e) => { if (filters.type !== type) e.currentTarget.style.borderColor = '#376BE9' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent' }}
              >
                {type}
              </button>
            ))}
          </div>
        )}

        {/* Capacity Filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78', width: '4.6rem', flexShrink: 0 }}>Capacity</span>
          <button
            onClick={() => setFilters({ ...filters, capacity: 'all' })}
            style={{
              fontFamily: 'inherit', fontSize: '0.8rem', cursor: 'pointer',
              background: filters.capacity === 'all' ? '#376BE9' : '#E9EBF5',
              color: filters.capacity === 'all' ? '#FFFFFF' : '#1C0140',
              border: '1px solid transparent', borderRadius: '999px', padding: '0.24rem 0.7rem',
            }}
            onMouseEnter={(e) => { if (filters.capacity !== 'all') e.currentTarget.style.borderColor = '#376BE9' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent' }}
          >
            Any
          </button>
          {capacityBands.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilters({ ...filters, capacity: value })}
              style={{
                fontFamily: 'inherit', fontSize: '0.8rem', cursor: 'pointer',
                background: filters.capacity === value ? '#376BE9' : '#E9EBF5',
                color: filters.capacity === value ? '#FFFFFF' : '#1C0140',
                border: '1px solid transparent', borderRadius: '999px', padding: '0.24rem 0.7rem',
              }}
              onMouseEnter={(e) => { if (filters.capacity !== value) e.currentTarget.style.borderColor = '#376BE9' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent' }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Stage Filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78', width: '4.6rem', flexShrink: 0 }}>Stage</span>
          <button
            onClick={() => setFilters({ ...filters, stage: 'all' })}
            style={{
              fontFamily: 'inherit', fontSize: '0.8rem', cursor: 'pointer',
              background: filters.stage === 'all' ? '#376BE9' : '#E9EBF5',
              color: filters.stage === 'all' ? '#FFFFFF' : '#1C0140',
              border: '1px solid transparent', borderRadius: '999px', padding: '0.24rem 0.7rem',
            }}
            onMouseEnter={(e) => { if (filters.stage !== 'all') e.currentTarget.style.borderColor = '#376BE9' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent' }}
          >
            Any
          </button>
          {['Permitting/Planning', 'Announced', 'Under Construction', 'Approved'].map((stage) => (
            <button
              key={stage}
              onClick={() => setFilters({ ...filters, stage })}
              style={{
                fontFamily: 'inherit', fontSize: '0.8rem', cursor: 'pointer',
                background: filters.stage === stage ? '#376BE9' : '#E9EBF5',
                color: filters.stage === stage ? '#FFFFFF' : '#1C0140',
                border: '1px solid transparent', borderRadius: '999px', padding: '0.24rem 0.7rem',
              }}
              onMouseEnter={(e) => { if (filters.stage !== stage) e.currentTarget.style.borderColor = '#376BE9' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent' }}
            >
              {stage}
            </button>
          ))}
        </div>

        {/* State Filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78', width: '4.6rem', flexShrink: 0 }}>State</span>
          <select
            value={filters.state}
            onChange={(e) => setFilters({ ...filters, state: e.target.value })}
            style={{
              fontFamily: 'inherit', fontSize: '0.8rem', cursor: 'pointer',
              background: filters.state !== 'all' ? '#376BE9' : '#E9EBF5',
              color: filters.state !== 'all' ? '#FFFFFF' : '#1C0140',
              border: '1px solid #D6D9E8', borderRadius: '3px', padding: '0.35rem 0.7rem',
            }}
            onMouseEnter={(e) => { if (filters.state === 'all') e.currentTarget.style.borderColor = '#376BE9' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#D6D9E8' }}
          >
            <option value="all">Any state</option>
            <option value="TX">Texas</option>
            <option value="CA">California</option>
            <option value="IL">Illinois</option>
            <option value="NY">New York</option>
            <option value="OH">Ohio</option>
          </select>
          <span style={{ fontSize: '0.74rem', color: '#5A5D78' }}>50 states available</span>
        </div>

        {/* Flags Filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78', width: '4.6rem', flexShrink: 0 }}>Flags</span>
          <button
            onClick={() => setFilters({ ...filters, past: !filters.past })}
            style={{
              fontFamily: 'inherit', fontSize: '0.8rem', cursor: 'pointer',
              background: filters.past ? '#8A6A12' : '#E9EBF5',
              color: filters.past ? '#FAF2DC' : '#1C0140',
              border: '1px solid transparent', borderRadius: '999px', padding: '0.24rem 0.7rem',
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            }}
            onMouseEnter={(e) => { if (!filters.past) e.currentTarget.style.borderColor = '#376BE9' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent' }}
          >
            Past due only
          </button>
          <button
            onClick={() => setFilters({ ...filters, review: !filters.review })}
            style={{
              fontFamily: 'inherit', fontSize: '0.8rem', cursor: 'pointer',
              background: filters.review ? '#376BE9' : '#E9EBF5',
              color: filters.review ? '#FFFFFF' : '#1C0140',
              border: '1px solid transparent', borderRadius: '999px', padding: '0.24rem 0.7rem',
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            }}
            onMouseEnter={(e) => { if (!filters.review) e.currentTarget.style.borderColor = '#376BE9' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent' }}
          >
            Needs review
          </button>
        </div>
      </div>

      {/* Result Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0.4rem 1rem', fontSize: '0.85rem', color: '#5A5D78' }}>
        <span>{loading ? 'Loading...' : `Showing ${paginated.length} of ${sorted.length} filtered (${projects.length} total)`}</span>
        <select
          value={perPage}
          onChange={(e) => setPerPage(e.target.value)}
          style={{ fontFamily: 'inherit', fontSize: '0.82rem', color: '#1C0140', background: '#F4F5FA', border: '1px solid #D6D9E8', borderRadius: '3px', padding: '0.32rem 0.5rem', cursor: 'pointer' }}
        >
          <option value="10">10 per page</option>
          <option value="100">100 per page</option>
          <option value="500">500 per page</option>
          <option value="all">All</option>
        </select>
        <button onClick={() => setFilters({ ind: 'all', type: 'all', capacity: 'all', stage: 'all', state: 'all', past: false, review: false })} style={{ fontFamily: 'inherit', fontSize: '0.82rem', background: 'none', border: 'none', cursor: 'pointer', color: '#376BE9', fontWeight: 600, padding: 0, marginLeft: 'auto' }}>
          Clear filters
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', boxShadow: '0 1px 2px rgba(28,1,64,.06)', overflowX: 'auto', overflowY: 'auto', maxHeight: '800px' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '66rem' }}>
          <thead>
            <tr>
              <th onClick={() => setSort({ key: 'name', dir: sort.key === 'name' ? -sort.dir : 1 })} style={{ position: 'sticky', top: 0, zIndex: 1, background: '#E9EBF5', fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A5D78', textAlign: 'left', padding: '0.6rem 0.8rem', borderBottom: '1px solid #D6D9E8', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                Project <span style={{ opacity: sort.key === 'name' ? 1 : 0.45 }}>{sort.key === 'name' && (sort.dir === 1 ? '↑' : '↓') || '↕'}</span>
              </th>
              <th style={{ position: 'sticky', top: 0, zIndex: 1, background: '#E9EBF5', fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A5D78', textAlign: 'left', padding: '0.6rem 0.8rem', borderBottom: '1px solid #D6D9E8' }}>Owner</th>
              <th style={{ position: 'sticky', top: 0, zIndex: 1, background: '#E9EBF5', fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A5D78', textAlign: 'left', padding: '0.6rem 0.8rem', borderBottom: '1px solid #D6D9E8' }}>EPC</th>
              <th style={{ position: 'sticky', top: 0, zIndex: 1, background: '#E9EBF5', fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A5D78', textAlign: 'left', padding: '0.6rem 0.8rem', borderBottom: '1px solid #D6D9E8' }}>OEM</th>
              <th style={{ position: 'sticky', top: 0, zIndex: 1, background: '#E9EBF5', fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A5D78', textAlign: 'left', padding: '0.6rem 0.8rem', borderBottom: '1px solid #D6D9E8' }}>Awards</th>
              <th style={{ position: 'sticky', top: 0, zIndex: 1, background: '#E9EBF5', fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A5D78', textAlign: 'left', padding: '0.6rem 0.8rem', borderBottom: '1px solid #D6D9E8' }}>Location</th>
              <th onClick={() => setSort({ key: 'stage', dir: sort.key === 'stage' ? -sort.dir : 1 })} style={{ position: 'sticky', top: 0, zIndex: 1, background: '#E9EBF5', fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A5D78', textAlign: 'left', padding: '0.6rem 0.8rem', borderBottom: '1px solid #D6D9E8', cursor: 'pointer' }}>
                Stage <span style={{ opacity: sort.key === 'stage' ? 1 : 0.45 }}>{sort.key === 'stage' && (sort.dir === 1 ? '↑' : '↓') || '↕'}</span>
              </th>
              <th onClick={() => setSort({ key: 'capacity_mw', dir: sort.key === 'capacity_mw' ? -sort.dir : 1 })} style={{ position: 'sticky', top: 0, zIndex: 1, background: '#E9EBF5', fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A5D78', textAlign: 'left', padding: '0.6rem 0.8rem', borderBottom: '1px solid #D6D9E8', cursor: 'pointer' }}>
                Capacity <span style={{ opacity: sort.key === 'capacity_mw' ? 1 : 0.45 }}>{sort.key === 'capacity_mw' && (sort.dir === 1 ? '↑' : '↓') || '↕'}</span>
              </th>
              <th style={{ position: 'sticky', top: 0, zIndex: 1, background: '#E9EBF5', fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A5D78', textAlign: 'left', padding: '0.6rem 0.8rem', borderBottom: '1px solid #D6D9E8' }}>
                Milestone
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #D6D9E8', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = '#F7F9FE'} onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}>
                <td style={{ padding: '0.6rem 0.8rem', verticalAlign: 'top', fontSize: '0.88rem' }}>
                  <a href={`/projects/${p.id}`} style={{ fontWeight: 600, color: '#376BE9', display: 'block', lineHeight: 1.3, textDecoration: 'none' }}>{p.name}</a>
                  <span style={{ fontSize: '0.74rem', color: '#1C0140', display: 'block', marginTop: '0.1rem', opacity: 0.8 }}>{p.type}</span>
                  {p.source_url && (
                    <a href={p.source_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#376BE9', textDecoration: 'none', marginTop: '0.2rem', display: 'block' }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
                      View source →
                    </a>
                  )}
                </td>
                <td style={{ padding: '0.6rem 0.8rem', fontSize: '0.85rem' }}>{getOwnerDisplay(p.owner)}</td>
                <td style={{ padding: '0.6rem 0.8rem', fontSize: '0.85rem' }}>{getOwnerDisplay(p.epc)}</td>
                <td style={{ padding: '0.6rem 0.8rem', fontSize: '0.85rem' }}>{getOwnerDisplay(p.oem)}</td>
                <td style={{ padding: '0.6rem 0.8rem', fontSize: '0.85rem' }}>
                  {(p.epc_award || p.oem_award) ? (
                    <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                      {p.epc_award && <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.7rem', background: '#E4EBFC', color: '#376BE9', padding: '0.2rem 0.4rem', borderRadius: '2px', fontWeight: 600 }}>EPC</span>}
                      {p.oem_award && <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.7rem', background: '#FCE4E4', color: '#C24040', padding: '0.2rem 0.4rem', borderRadius: '2px', fontWeight: 600 }}>OEM</span>}
                    </div>
                  ) : (
                    <span style={{ color: '#5A5D78' }}>—</span>
                  )}
                </td>
                <td style={{ padding: '0.6rem 0.8rem', fontSize: '0.85rem' }}>{p.location}</td>
                <td style={{ padding: '0.6rem 0.8rem' }}>
                  <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.62rem', letterSpacing: '0.05em', padding: '0.16rem 0.42rem', borderRadius: '2px', background: p.stage === 'Under Construction' ? '#E4EBFC' : '#E9EBF5', color: p.stage === 'Under Construction' ? '#376BE9' : '#5A5D78', whiteSpace: 'nowrap' }}>
                    {p.stage}
                  </span>
                </td>
                <td style={{ padding: '0.6rem 0.8rem', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{p.capacity_mw ? `${p.capacity_mw.toLocaleString()} ${p.capacity_unit || 'MW'}` : '—'}</td>
                <td style={{ padding: '0.6rem 0.8rem', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', color: p.past_due ? '#8A6A12' : 'inherit', fontWeight: p.past_due ? 600 : 'normal' }}>
                  {p.milestone_date ? new Date(p.milestone_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : '—'}
                  {p.past_due && <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.62rem', color: '#8A6A12', marginTop: '0.1rem' }}>overdue</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginated.length === 0 && (
          <div style={{ padding: '2.5rem 1.25rem', textAlign: 'center', color: '#5A5D78', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <strong style={{ color: '#1C0140', fontFamily: 'Chivo,sans-serif', fontSize: '1.05rem' }}>{sorted.length === 0 ? 'No projects match those filters' : 'Loading...'}</strong>
            <span>{sorted.length === 0 ? 'Try widening the capacity band or clearing the state.' : ''}</span>
          </div>
        )}
      </div>

      {/* Footnote */}
      <div style={{ fontSize: '0.83rem', color: '#5A5D78', background: '#E9EBF5', borderLeft: '2px solid #376BE9', padding: '0.7rem 0.95rem', borderRadius: '0 3px 3px 0' }}>
        <strong style={{ color: '#1C0140', fontWeight: 600 }}>Capacity sorts on parsed megawatts.</strong> Rows measured in Bcf/d or dollars, and projects with no stated size, sort last rather than counting as zero — an unknown size is not a small one. State filters work off a normalised code, so "Texas" and "TX" count as one place.
      </div>
    </main>
  )
}
