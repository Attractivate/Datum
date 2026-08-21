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
  { id: '6', name: '245 MW Solar — Ameren Transmission Company Of Illinois, Scott County, IL (MISO J4031)', type: 'Power Plant · New Build', owner: 'Not published', location: 'Scott County, IL', state: 'IL', stage: 'Permitting/Planning', capacity: '245.0 MW', capacityValue: 245, milestone: '—', industryRaw: 'Power Generation', industryDisplay: 'Power Generation', pastDue: false, needsReview: false },
  { id: '7', name: 'Desert Jewel Storage', type: 'Power Plant · New Build', owner: 'Not published', location: 'San Diego County, CA', state: 'CA', stage: 'Permitting/Planning', capacity: '200.0 MW', capacityValue: 200, milestone: 'Aug 2029', industryRaw: 'Power Generation', industryDisplay: 'Power Generation', pastDue: false, needsReview: false },
  { id: '8', name: 'Myers Solar and Storage', type: 'Power Plant · New Build', owner: 'Belltown Power Texas 2, LLC', location: 'Goliad County, TX', state: 'TX', stage: 'Permitting/Planning', capacity: '176.6 MW (2 units)', capacityValue: 176.6, milestone: 'Aug 2028', industryRaw: 'Power Generation', industryDisplay: 'Power Generation', pastDue: false, needsReview: false },
  { id: '9', name: 'Montezuma II', type: 'Power Plant · New Build', owner: 'Not published', location: 'Solano County, CA', state: 'CA', stage: 'Permitting/Planning', capacity: '78.0 MW', capacityValue: 78, milestone: 'Jan 2012', industryRaw: 'Power Generation', industryDisplay: 'Power Generation', pastDue: true, needsReview: false },
  { id: '10', name: 'Frostburg 138 kV', type: 'Power Plant · New Build', owner: 'Not published', location: 'Allegany County, MD', state: 'MD', stage: 'Permitting/Planning', capacity: '80.0 MW', capacityValue: 80, milestone: 'Dec 2021', industryRaw: 'Power Generation', industryDisplay: 'Power Generation', pastDue: true, needsReview: false },
  { id: '11', name: 'SeaOne Corpus Christi, LLC', type: 'LNG Export Terminal', owner: 'SeaOne Corpus Christi, LLC', location: 'United States', state: '', stage: 'Approved', capacity: '1.50 Bcf/d', capacityValue: 0, milestone: '—', industryRaw: 'Oil & Gas', industryDisplay: 'Oil & Gas', pastDue: false, needsReview: false },
  { id: '12', name: 'Terafab chip plant', type: 'Chip Manufacturing', owner: 'Tesla and SpaceX', location: 'Texas', state: 'TX', stage: 'Announced', capacity: '$16.8 bn', capacityValue: 0, milestone: '—', industryRaw: 'Hi Tech', industryDisplay: 'Hi Tech', pastDue: false, needsReview: false },
  { id: '13', name: 'Amazon Gilroy Data Center', type: 'Data Center', owner: 'Amazon', location: 'Gilroy, California', state: 'CA', stage: 'Under Construction', capacity: '—', capacityValue: 0, milestone: '—', industryRaw: 'Hi Tech', industryDisplay: 'Hi Tech', pastDue: false, needsReview: false },
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
          {[{ label: 'All', val: 'all', count: '4,081' }, { label: 'Power Generation', val: 'Power Generation', count: '1,842' }, { label: 'Power Delivery', val: 'Power Delivery', count: '654' }, { label: 'Oil & Gas', val: 'Oil & Gas', count: '892' }, { label: 'Hi Tech', val: 'Hi Tech', count: '425' }, { label: 'Life Sciences', val: 'Life Sciences', count: '168' }].map(({ label, val, count }) => (
            <button
              key={val}
              onClick={() => setFilters({ ...filters, ind: val })}
              style={{
                fontFamily: 'inherit', fontSize: '0.8rem', cursor: 'pointer',
                background: filters.ind === val ? '#376BE9' : '#E9EBF5',
                color: filters.ind === val ? '#FFFFFF' : '#1C0140',
                border: '1px solid transparent', borderRadius: '999px', padding: '0.24rem 0.7rem',
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              }}
              onMouseEnter={(e) => { if (filters.ind !== val) e.currentTarget.style.borderColor = '#376BE9' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent' }}
            >
              {label} <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.66rem', color: filters.ind === val ? 'rgba(255,255,255,.75)' : '#5A5D78' }}>{count}</span>
            </button>
          ))}
        </div>

        {/* Capacity Filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78', width: '4.6rem', flexShrink: 0 }}>Capacity</span>
          {[{ label: 'Any', val: 'all', count: '3,723' }, { label: 'Under 100 MW', val: '0-100', count: '456' }, { label: '100–250 MW', val: '100-250', count: '623' }, { label: '250–500 MW', val: '250-500', count: '734' }, { label: '500 MW–1 GW', val: '500-1000', count: '892' }, { label: '1 GW+', val: '1000-', count: '358' }].map(({ label, val, count }) => (
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
              {label} <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.66rem', color: filters.mw === val ? 'rgba(255,255,255,.75)' : '#5A5D78' }}>{count}</span>
            </button>
          ))}
        </div>

        {/* Stage Filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78', width: '4.6rem', flexShrink: 0 }}>Stage</span>
          {[{ label: 'Any', val: 'all', count: '4,081' }, { label: 'Permitting', val: 'Permitting/Planning', count: '2,145' }, { label: 'Announced', val: 'Announced', count: '1,234' }, { label: 'Under Construction', val: 'Under Construction', count: '542' }, { label: 'Approved', val: 'Approved', count: '160' }].map(({ label, val, count }) => (
            <button
              key={val}
              onClick={() => setFilters({ ...filters, stage: val })}
              style={{
                fontFamily: 'inherit', fontSize: '0.8rem', cursor: 'pointer',
                background: filters.stage === val ? '#376BE9' : '#E9EBF5',
                color: filters.stage === val ? '#FFFFFF' : '#1C0140',
                border: '1px solid transparent', borderRadius: '999px', padding: '0.24rem 0.7rem',
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              }}
              onMouseEnter={(e) => { if (filters.stage !== val) e.currentTarget.style.borderColor = '#376BE9' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent' }}
            >
              {label} <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.66rem', color: filters.stage === val ? 'rgba(255,255,255,.75)' : '#5A5D78' }}>{count}</span>
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
            <option value="all">Any state — 4,081</option>
            <option value="TX">Texas — 1,524</option>
            <option value="CA">California — 826</option>
            <option value="IL">Illinois — 342</option>
            <option value="NY">New York — 287</option>
            <option value="OH">Ohio — 256</option>
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
            Past due only <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.66rem', color: filters.past ? 'rgba(250,242,220,.75)' : '#5A5D78' }}>134</span>
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
            Needs review <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.66rem', color: filters.review ? 'rgba(255,255,255,.75)' : '#5A5D78' }}>169</span>
          </button>
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
