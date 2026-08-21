'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  type: string
  owner: string
  location: string
  state: string
  stage: string
  capacity: string
  capacityValue: number
  milestone: string
  industryRaw: string
  industryDisplay: string
  pastDue: boolean
  needsReview: boolean
}

const mockProjects: Project[] = [
  { id: '1', name: 'Project Matador Gas Plant (PMG)', type: 'Power Plant · New Build', owner: 'Fermi America', location: 'Carson County, TX', state: 'TX', stage: 'Announced', capacity: '11,679.3 MW (157 units)', capacityValue: 11679.3, milestone: 'Dec 2027', industryRaw: 'Power Generation', industryDisplay: 'Power Generation', pastDue: false, needsReview: false },
  { id: '2', name: 'Intermountain Pumped Storage Project', type: 'Power Plant · New Build', owner: 'Premium Energy Holdings', location: 'Millard County, UT', state: 'UT', stage: 'Announced', capacity: '1,000.0 MW (4 units)', capacityValue: 1000, milestone: 'Jul 2028', industryRaw: 'Power Generation', industryDisplay: 'Power Generation', pastDue: false, needsReview: false },
  { id: '3', name: 'Glass Mountain Wind 1', type: 'Power Plant · New Build', owner: 'Not published', location: 'Reeves County, Texas', state: 'TX', stage: 'Permitting/Planning', capacity: '511.5 MW', capacityValue: 511.5, milestone: '—', industryRaw: 'Power Generation', industryDisplay: 'Power Generation', pastDue: false, needsReview: false },
  { id: '4', name: 'Athens Solar I (Hybrid)', type: 'Power Plant · New Build', owner: 'Vesper Energy Development LLC', location: 'Placer County, CA', state: 'CA', stage: 'Announced', capacity: '500.0 MW (2 units)', capacityValue: 500, milestone: 'Jun 2028', industryRaw: 'Power Generation', industryDisplay: 'Power Generation', pastDue: false, needsReview: false },
  { id: '5', name: 'Daggett Solar 3', type: 'Power Plant · New Build', owner: 'Not published', location: 'San Bernardino County, CA', state: 'CA', stage: 'Permitting/Planning', capacity: '300.0 MW', capacityValue: 300, milestone: 'Aug 2023', industryRaw: 'Power Generation', industryDisplay: 'Power Generation', pastDue: true, needsReview: false },
]

export default function ProjectsList() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ ind: 'all', mw: 'all', stage: 'all', state: 'all', past: false, review: false })
  const [sort, setSort] = useState({ key: 'name', dir: 1 })

  const inBand = (value: number, band: string) => {
    if (band === 'all') return true
    if (value === 0) return false
    const [lo, hi] = band.split('-').map(x => x === '' ? Infinity : parseFloat(x))
    return value >= lo && value < hi
  }

  const filtered = useMemo(() => {
    return mockProjects.filter(p => {
      const matchSearch = search === '' || p.name.toLowerCase().includes(search.toLowerCase()) ||
                         p.owner.toLowerCase().includes(search.toLowerCase()) ||
                         p.location.toLowerCase().includes(search.toLowerCase())
      const matchInd = filters.ind === 'all' || p.industryRaw === filters.ind
      const matchMw = inBand(p.capacityValue, filters.mw)
      const matchStage = filters.stage === 'all' || p.stage === filters.stage
      const matchState = filters.state === 'all' || p.state === filters.state
      const matchPast = !filters.past || p.pastDue
      const matchReview = !filters.review || p.needsReview
      return matchSearch && matchInd && matchMw && matchStage && matchState && matchPast && matchReview
    })
  }, [search, filters])

  const sorted = useMemo(() => {
    const copy = [...filtered]
    copy.sort((a, b) => {
      let aVal: any = sort.key === 'name' ? a.name : a[sort.key as keyof Project]
      let bVal: any = sort.key === 'name' ? b.name : b[sort.key as keyof Project]

      if (sort.key === 'mw') {
        if (a.capacityValue === 0 && b.capacityValue === 0) return 0
        if (a.capacityValue === 0) return 1
        if (b.capacityValue === 0) return -1
        return (a.capacityValue - b.capacityValue) * sort.dir
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * sort.dir
      }
      return 0
    })
    return copy
  }, [filtered, sort])

  return (
    <main style={{ maxWidth: '96rem', margin: '0 auto', padding: '1.4rem clamp(1rem, 3vw, 2rem) 5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0.4rem 1.5rem' }}>
        <h1 style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 900, fontSize: 'clamp(1.6rem, 4vw, 2.1rem)', letterSpacing: '-.03em', lineHeight: 1, margin: 0, marginRight: 'auto' }}>
          Projects
        </h1>
        <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.7rem', color: '#5A5D78' }}>
          {filtered.length} active · last run 19 Aug 2026
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

        {/* Industry Filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78', width: '4.6rem', flexShrink: 0 }}>Industry</span>
          {['all', 'Power Generation', 'Oil & Gas', 'Hi Tech', 'Power Delivery', 'Water Infrastructure', 'Life Sciences'].map((ind, idx) => (
            <button
              key={ind}
              onClick={() => setFilters({ ...filters, ind })}
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
              {ind === 'all' ? 'All' : ind.split(' ')[0]} {ind !== 'all' && idx === 5 && <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.66rem', color: filters.ind === ind ? 'rgba(255,255,255,.75)' : '#5A5D78' }}>28</span>}
            </button>
          ))}
        </div>

        {/* Capacity Filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78', width: '4.6rem', flexShrink: 0 }}>Capacity</span>
          {[{ label: 'Any', val: 'all' }, { label: 'Under 100 MW', val: '0-100' }, { label: '100–250 MW', val: '100-250' }].map(({ label, val }) => (
            <button
              key={val}
              onClick={() => setFilters({ ...filters, mw: val })}
              style={{
                fontFamily: 'inherit', fontSize: '0.8rem', cursor: 'pointer',
                background: filters.mw === val ? '#376BE9' : '#E9EBF5',
                color: filters.mw === val ? '#FFFFFF' : '#1C0140',
                border: '1px solid transparent', borderRadius: '999px', padding: '0.24rem 0.7rem',
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              }}
              onMouseEnter={(e) => { if (filters.mw !== val) e.currentTarget.style.borderColor = '#376BE9' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent' }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Result Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0.4rem 1rem', fontSize: '0.85rem', color: '#5A5D78' }}>
        <span>Showing <strong style={{ color: '#1C0140', fontVariantNumeric: 'tabular-nums' }}>{sorted.length}</strong> of <strong style={{ color: '#1C0140' }}>4,081</strong> projects</span>
        <button onClick={() => setFilters({ ind: 'all', mw: 'all', stage: 'all', state: 'all', past: false, review: false })} style={{ fontFamily: 'inherit', fontSize: '0.82rem', background: 'none', border: 'none', cursor: 'pointer', color: '#376BE9', fontWeight: 600, padding: 0, marginLeft: 'auto' }}>
          Clear filters
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', boxShadow: '0 1px 2px rgba(28,1,64,.06)', overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '58rem' }}>
          <thead>
            <tr>
              <th onClick={() => setSort({ key: 'name', dir: sort.key === 'name' ? -sort.dir : 1 })} style={{ position: 'sticky', top: 0, zIndex: 1, background: '#E9EBF5', fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A5D78', textAlign: 'left', padding: '0.6rem 0.8rem', borderBottom: '1px solid #D6D9E8', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                Project <span style={{ opacity: sort.key === 'name' ? 1 : 0.45 }}>{sort.key === 'name' && (sort.dir === 1 ? '↑' : '↓') || '↕'}</span>
              </th>
              <th style={{ position: 'sticky', top: 0, zIndex: 1, background: '#E9EBF5', fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A5D78', textAlign: 'left', padding: '0.6rem 0.8rem', borderBottom: '1px solid #D6D9E8' }}>Owner</th>
              <th style={{ position: 'sticky', top: 0, zIndex: 1, background: '#E9EBF5', fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A5D78', textAlign: 'left', padding: '0.6rem 0.8rem', borderBottom: '1px solid #D6D9E8' }}>Location</th>
              <th onClick={() => setSort({ key: 'stage', dir: sort.key === 'stage' ? -sort.dir : 1 })} style={{ position: 'sticky', top: 0, zIndex: 1, background: '#E9EBF5', fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A5D78', textAlign: 'left', padding: '0.6rem 0.8rem', borderBottom: '1px solid #D6D9E8', cursor: 'pointer' }}>
                Stage <span style={{ opacity: sort.key === 'stage' ? 1 : 0.45 }}>{sort.key === 'stage' && (sort.dir === 1 ? '↑' : '↓') || '↕'}</span>
              </th>
              <th onClick={() => setSort({ key: 'capacityValue', dir: sort.key === 'capacityValue' ? -sort.dir : 1 })} style={{ position: 'sticky', top: 0, zIndex: 1, background: '#E9EBF5', fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A5D78', textAlign: 'left', padding: '0.6rem 0.8rem', borderBottom: '1px solid #D6D9E8', cursor: 'pointer' }}>
                Capacity <span style={{ opacity: sort.key === 'capacityValue' ? 1 : 0.45 }}>{sort.key === 'capacityValue' && (sort.dir === 1 ? '↑' : '↓') || '↕'}</span>
              </th>
              <th onClick={() => setSort({ key: 'milestone', dir: sort.key === 'milestone' ? -sort.dir : 1 })} style={{ position: 'sticky', top: 0, zIndex: 1, background: '#E9EBF5', fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A5D78', textAlign: 'left', padding: '0.6rem 0.8rem', borderBottom: '1px solid #D6D9E8', cursor: 'pointer' }}>
                Milestone <span style={{ opacity: sort.key === 'milestone' ? 1 : 0.45 }}>{sort.key === 'milestone' && (sort.dir === 1 ? '↑' : '↓') || '↕'}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #D6D9E8', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = '#F7F9FE'} onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}>
                <td style={{ padding: '0.6rem 0.8rem', verticalAlign: 'top', fontSize: '0.88rem' }}>
                  <a href="#" style={{ fontWeight: 600, color: '#376BE9', display: 'block', lineHeight: 1.3, textDecoration: 'none' }}>{p.name}</a>
                  <span style={{ fontSize: '0.74rem', color: '#5A5D78', display: 'block', marginTop: '0.1rem' }}>{p.type}</span>
                </td>
                <td style={{ padding: '0.6rem 0.8rem' }}>{p.owner}</td>
                <td style={{ padding: '0.6rem 0.8rem' }}>{p.location}</td>
                <td style={{ padding: '0.6rem 0.8rem' }}>
                  <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.62rem', letterSpacing: '0.05em', padding: '0.16rem 0.42rem', borderRadius: '2px', background: p.stage === 'Under Construction' ? '#E4EBFC' : '#E9EBF5', color: p.stage === 'Under Construction' ? '#376BE9' : '#5A5D78', whiteSpace: 'nowrap' }}>
                    {p.stage}
                  </span>
                </td>
                <td style={{ padding: '0.6rem 0.8rem', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{p.capacity || '—'}</td>
                <td style={{ padding: '0.6rem 0.8rem', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', color: p.pastDue ? '#8A6A12' : 'inherit', fontWeight: p.pastDue ? 600 : 'normal' }}>
                  {p.milestone}
                  {p.pastDue && <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.62rem', color: '#8A6A12', marginTop: '0.1rem' }}>3 yr overdue</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div style={{ padding: '2.5rem 1.25rem', textAlign: 'center', color: '#5A5D78', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <strong style={{ color: '#1C0140', fontFamily: 'Chivo,sans-serif', fontSize: '1.05rem' }}>No projects match those filters</strong>
            <span>Try widening the capacity band or clearing the state.</span>
          </div>
        )}
      </div>

      {/* Footnote */}
      <div style={{ fontSize: '0.83rem', color: '#5A5D78', background: '#E9EBF5', borderLeft: '2px solid #376BE9', padding: '0.7rem 0.95rem', borderRadius: '0 3px 3px 0' }}>
        <strong style={{ color: '#1C0140', fontWeight: 600 }}>Capacity sorts on parsed megawatts.</strong> Rows measured in Bcf/d or dollars, and the 358 with no stated size, sort last rather than counting as zero — an unknown size is not a small one. State filters work off a normalised code, so "Texas" and "TX" count as one place.
      </div>
    </main>
  )
}
