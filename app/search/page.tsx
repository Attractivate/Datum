'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface SearchResult {
  id: string
  title: string
  type: 'Project' | 'Company' | 'Contact'
  meta: string[]
  desc: string
  tags: string[]
}

const mockResults: SearchResult[] = [
  {
    id: '1',
    title: 'Permian Solar II, Texas',
    type: 'Project',
    meta: ['🔋 500 MW Solar', '📍 Midland, TX', '📅 Under Construction'],
    desc: 'NextEra-developed 500 MW solar farm with 150 MW battery storage. Interconnects to ERCOT grid. Expected commissioning Q2 2027.',
    tags: ['NextEra Energy', 'ERCOT', 'Battery Storage', '2027 COD'],
  },
  {
    id: '2',
    title: 'NextEra Energy',
    type: 'Company',
    meta: ['⚡ Developer & Owner', '📍 Juno Beach, FL', '💼 63 projects tracked'],
    desc: 'Leading renewable energy developer. Active in solar, wind, and battery storage across Texas, California, and Southwest. $12.5 GW portfolio.',
    tags: ['Solar', 'Wind', 'Battery Storage', 'S&P 500'],
  },
  {
    id: '3',
    title: 'Sunset Solar Complex, West Texas',
    type: 'Project',
    meta: ['🔋 1.2 GW Solar', '📍 Pecos County, TX', '📅 Permitting'],
    desc: 'Large-scale 1.2 GW solar + 400 MW battery storage project. Developer: Brookfield Renewable. PPA signed with Southern Company. FID expected Q3 2026.',
    tags: ['Brookfield Renewable', 'Southern Company', '1.2 GW', 'Battery'],
  },
  {
    id: '4',
    title: 'Sunrun Utility Solutions',
    type: 'Company',
    meta: ['⚡ Developer & EPC', '📍 San Francisco, CA', '💼 28 projects tracked'],
    desc: 'Distributed solar and energy services company. Texas operations focus on utility-scale projects and residential rollout. $3.2 GW active portfolio.',
    tags: ['Solar', 'Distributed Energy', 'Utility-Scale', 'NASDAQ'],
  },
  {
    id: '5',
    title: 'Desert Edge 400 MW, Culberson County',
    type: 'Project',
    meta: ['🔋 400 MW Solar', '📍 Culberson County, TX', '📅 Announced'],
    desc: 'Proposed 400 MW fixed-tilt solar project on 2,800 acres. Developer: Clearway Energy. PPA negotiations underway with major utility off-taker.',
    tags: ['Clearway Energy', '400 MW', 'Early Stage', '2024 News'],
  },
]

export default function SearchPage() {
  const [results, setResults] = useState<SearchResult[]>(mockResults)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('solar texas 2026')
  const [tab, setTab] = useState('all')

  // Fetch search results from API
  useEffect(() => {
    if (search.length < 2) {
      setResults(mockResults)
      return
    }

    const fetchResults = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        params.append('q', search)
        params.append('limit', '50')

        const res = await fetch(`/api/search?${params.toString()}`)
        const data = await res.json()

        // Transform API results to UI format with deduplication
        if (data.success && data.data) {
          const transformed: SearchResult[] = []
          const seenIds = new Set<string>()

          // Deduplicate projects by ID
          data.data.projects?.forEach((p: any) => {
            if (!seenIds.has(p.id)) {
              seenIds.add(p.id)
              transformed.push({
                id: p.id,
                title: p.name,
                type: 'Project',
                meta: [p.capacity_mw ? `${p.capacity_mw} MW` : '', p.location, p.stage],
                desc: p.description || p.type || '',
                tags: [p.name],
              })
            }
          })

          // Deduplicate companies by ID
          data.data.companies?.forEach((c: any) => {
            if (!seenIds.has(c.id)) {
              seenIds.add(c.id)
              transformed.push({
                id: c.id,
                title: c.name,
                type: 'Company',
                meta: [c.location, `${c.projects_count} projects tracked`],
                desc: c.description || '',
                tags: [c.name],
              })
            }
          })

          setResults(transformed.length > 0 ? transformed : mockResults)
        } else {
          setResults(mockResults)
        }
      } catch (error) {
        console.error('Failed to fetch search results:', error)
        setResults(mockResults)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [search])

  return (
    <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', width: '100%' }}>
      {/* Search Hero */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem' }}>🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects, companies, news..."
            style={{
              width: '100%',
              padding: '1rem 1rem 1rem 3rem',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              background: '#FFFFFF',
              color: '#1a1a1a',
              fontSize: '1rem',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#376BE9')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#e0e0e0')}
          />
        </div>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '1.1rem', color: '#666' }}>
          Results for <span style={{ fontWeight: 600, color: '#1a1a1a' }}>"{search}"</span>
        </div>
        <div style={{ fontSize: '0.9rem', color: '#666' }}>127 results · 0.23s</div>
      </div>

      {/* Split Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2rem' }}>
        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Type Filter */}
          <div style={{ background: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ padding: '0.8rem', background: '#f0f0f0', fontWeight: 600, fontSize: '0.85rem', borderBottom: '1px solid #e0e0e0', textTransform: 'uppercase', letterSpacing: '0.03em', color: '#666' }}>
              Type
            </div>
            <div style={{ padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <input type="checkbox" id="type-proj" defaultChecked />
                <label htmlFor="type-proj" style={{ cursor: 'pointer', flex: 1 }}>Projects</label>
                <span style={{ color: '#666', fontSize: '0.8rem' }}>89</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <input type="checkbox" id="type-comp" defaultChecked />
                <label htmlFor="type-comp" style={{ cursor: 'pointer', flex: 1 }}>Companies</label>
                <span style={{ color: '#666', fontSize: '0.8rem' }}>38</span>
              </div>
            </div>
          </div>

          {/* Stage Filter */}
          <div style={{ background: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ padding: '0.8rem', background: '#f0f0f0', fontWeight: 600, fontSize: '0.85rem', borderBottom: '1px solid #e0e0e0', textTransform: 'uppercase', letterSpacing: '0.03em', color: '#666' }}>
              Stage
            </div>
            <div style={{ padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { id: 'stage-ann', label: 'Announced', count: 34, checked: true },
                { id: 'stage-perm', label: 'Permitting', count: 28, checked: false },
                { id: 'stage-cons', label: 'Under Construction', count: 18, checked: false },
                { id: 'stage-comm', label: 'Commissioning', count: 9, checked: false },
              ].map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <input type="checkbox" id={item.id} defaultChecked={item.checked} />
                  <label htmlFor={item.id} style={{ cursor: 'pointer', flex: 1 }}>{item.label}</label>
                  <span style={{ color: '#666', fontSize: '0.8rem' }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Capacity Filter */}
          <div style={{ background: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ padding: '0.8rem', background: '#f0f0f0', fontWeight: 600, fontSize: '0.85rem', borderBottom: '1px solid #e0e0e0', textTransform: 'uppercase', letterSpacing: '0.03em', color: '#666' }}>
              Capacity
            </div>
            <div style={{ padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { id: 'cap-100', label: '< 100 MW', count: 12 },
                { id: 'cap-500', label: '100–500 MW', count: 42 },
                { id: 'cap-1000', label: '500 MW–1 GW', count: 23 },
                { id: 'cap-1000p', label: '> 1 GW', count: 12 },
              ].map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <input type="checkbox" id={item.id} />
                  <label htmlFor={item.id} style={{ cursor: 'pointer', flex: 1 }}>{item.label}</label>
                  <span style={{ color: '#666', fontSize: '0.8rem' }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Region Filter */}
          <div style={{ background: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ padding: '0.8rem', background: '#f0f0f0', fontWeight: 600, fontSize: '0.85rem', borderBottom: '1px solid #e0e0e0', textTransform: 'uppercase', letterSpacing: '0.03em', color: '#666' }}>
              Region
            </div>
            <div style={{ padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { id: 'reg-tx', label: 'Texas', count: 67, checked: true },
                { id: 'reg-ca', label: 'California', count: 23, checked: false },
                { id: 'reg-az', label: 'Arizona', count: 19, checked: false },
                { id: 'reg-fl', label: 'Florida', count: 10, checked: false },
              ].map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <input type="checkbox" id={item.id} defaultChecked={item.checked} />
                  <label htmlFor={item.id} style={{ cursor: 'pointer', flex: 1 }}>{item.label}</label>
                  <span style={{ color: '#666', fontSize: '0.8rem' }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e0e0e0', marginBottom: '1.5rem' }}>
            {[
              { id: 'all', label: 'All Results' },
              { id: 'projects', label: 'Projects (89)' },
              { id: 'companies', label: 'Companies (38)' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '0.8rem 1.2rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: tab === t.id ? '3px solid #376BE9' : '3px solid transparent',
                  color: tab === t.id ? '#1a1a1a' : '#666',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Results List */}
          {tab === 'all' && (
            <div>
              {results.map((result) => (
                <Link
                  href={result.type === 'Project' ? `/projects/${result.id}` : `/companies/${result.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    key={result.id}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      padding: '1.2rem',
                      marginBottom: '1rem',
                      transition: 'all 0.15s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#376BE9'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e0e0e0'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.6rem' }}>
                      <div style={{ color: '#376BE9', fontWeight: 600, fontSize: '1rem' }}>
                        {result.title}
                      </div>
                    <span style={{ background: '#f0f0f0', color: '#666', padding: '0.25rem 0.6rem', borderRadius: '3px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>
                      {result.type}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#666', marginBottom: '0.6rem' }}>
                    {result.meta.map((m, i) => (
                      <span key={i}>{m}</span>
                    ))}
                  </div>

                  <div style={{ fontSize: '0.9rem', lineHeight: 1.5, color: '#1a1a1a', marginBottom: '0.8rem' }}>
                    {result.desc}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {result.tags.map((tag, i) => (
                      <span key={i} style={{ background: '#f0f0f0', color: '#666', padding: '0.3rem 0.6rem', borderRadius: '3px', fontSize: '0.75rem' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {tab === 'projects' && (
            <div>
              {results
                .filter((r) => r.type === 'Project')
                .map((result) => (
                  <Link
                    key={result.id}
                    href={`/projects/${result.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        padding: '1.2rem',
                        marginBottom: '1rem',
                        transition: 'all 0.15s',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#376BE9'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e0e0e0'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.6rem' }}>
                        <div style={{ color: '#376BE9', fontWeight: 600, fontSize: '1rem' }}>
                          {result.title}
                        </div>
                        <span style={{ background: '#f0f0f0', color: '#666', padding: '0.25rem 0.6rem', borderRadius: '3px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>
                          {result.type}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#666', marginBottom: '0.6rem' }}>
                        {result.meta.map((m, i) => (
                          <span key={i}>{m}</span>
                        ))}
                      </div>
                      <div style={{ fontSize: '0.9rem', lineHeight: 1.5, color: '#1a1a1a', marginBottom: '0.8rem' }}>
                        {result.desc}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {result.tags.map((tag, i) => (
                          <span key={i} style={{ background: '#f0f0f0', color: '#666', padding: '0.3rem 0.6rem', borderRadius: '3px', fontSize: '0.75rem' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          )}

          {tab === 'companies' && (
            <div>
              {results
                .filter((r) => r.type === 'Company')
                .map((result) => (
                  <Link
                    key={result.id}
                    href={`/companies/${result.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        padding: '1.2rem',
                        marginBottom: '1rem',
                        transition: 'all 0.15s',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#376BE9'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e0e0e0'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.6rem' }}>
                        <div style={{ color: '#376BE9', fontWeight: 600, fontSize: '1rem' }}>
                          {result.title}
                        </div>
                        <span style={{ background: '#f0f0f0', color: '#666', padding: '0.25rem 0.6rem', borderRadius: '3px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>
                          {result.type}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#666', marginBottom: '0.6rem' }}>
                        {result.meta.map((m, i) => (
                          <span key={i}>{m}</span>
                        ))}
                      </div>
                      <div style={{ fontSize: '0.9rem', lineHeight: 1.5, color: '#1a1a1a', marginBottom: '0.8rem' }}>
                        {result.desc}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {result.tags.map((tag, i) => (
                          <span key={i} style={{ background: '#f0f0f0', color: '#666', padding: '0.3rem 0.6rem', borderRadius: '3px', fontSize: '0.75rem' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          )}

          {/* Pagination */}
          <div style={{ textAlign: 'center', padding: '2rem 0', color: '#666', fontSize: '0.9rem' }}>
            Showing 1–5 of 127 results · <Link href="#" style={{ color: '#376BE9', textDecoration: 'none', margin: '0 0.5rem' }}>← Previous</Link> · <Link href="#" style={{ color: '#376BE9', textDecoration: 'none', margin: '0 0.5rem' }}>Next →</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
