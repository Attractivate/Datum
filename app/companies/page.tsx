'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Company } from '@/lib/types'

interface CompanyWithStats extends Company {
  stats: {
    owner: { mw: number; count: number; projects: string[] }
    epc: { mw: number; count: number; projects: string[] }
    oem: { mw: number; count: number; projects: string[] }
    total_mw: number
    total_projects: number
    awards: { epc_count: number; oem_count: number; epc_awards: string[]; oem_awards: string[] }
    last_updated: string | null
  }
}

const roles = ['All roles', 'Owner', 'EPC', 'OEM', 'Developer']
const sortOptions = [
  { label: 'Recent activity', key: 'recent' },
  { label: 'Most projects', key: 'projects' },
  { label: 'Largest capacity', key: 'capacity' },
  { label: 'Most awards', key: 'awards' },
  { label: 'Name (A–Z)', key: 'name' },
]

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyWithStats[]>([])
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'table' | 'grid' | 'list'>('table')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All roles')
  const [sortBy, setSortBy] = useState('recent')

  // Fetch companies with stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (search) params.append('search', search)

        const res = await fetch(`/api/companies-with-stats?${params.toString()}`)
        const data = await res.json()

        if (data.success && data.data) {
          setCompanies(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch companies:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [search])

  // Filter companies by role
  const filtered = companies.filter((company) => {
    if (roleFilter === 'All roles') return true
    if (roleFilter === 'Owner') return company.stats.owner.count > 0
    if (roleFilter === 'EPC') return company.stats.epc.count > 0
    if (roleFilter === 'OEM') return company.stats.oem.count > 0
    return true
  })

  // Sort companies
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name)
    }
    if (sortBy === 'projects') {
      return b.stats.total_projects - a.stats.total_projects
    }
    if (sortBy === 'capacity') {
      return b.stats.total_mw - a.stats.total_mw
    }
    if (sortBy === 'awards') {
      const aAwards = a.stats.awards.epc_count + a.stats.awards.oem_count
      const bAwards = b.stats.awards.epc_count + b.stats.awards.oem_count
      return bAwards - aAwards
    }
    if (sortBy === 'recent') {
      const aDate = a.stats.last_updated ? new Date(a.stats.last_updated) : new Date(0)
      const bDate = b.stats.last_updated ? new Date(b.stats.last_updated) : new Date(0)
      return bDate.getTime() - aDate.getTime()
    }
    return 0
  })

  const formatMW = (mw: number) => {
    if (mw === 0) return '—'
    if (mw >= 1000) return `${(mw / 1000).toFixed(1)} GW`
    return `${mw.toFixed(0)} MW`
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'today'
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  return (
    <main style={{ maxWidth: '96rem', margin: '0 auto', padding: '1.4rem clamp(1rem, 3vw, 2rem) 5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0.4rem 1.5rem' }}>
        <h1 style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 900, fontSize: 'clamp(1.6rem, 4vw, 2.1rem)', letterSpacing: '-.03em', lineHeight: 1, margin: 0, marginRight: 'auto' }}>
          Companies
        </h1>
        <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.7rem', color: '#5A5D78' }}>
          {filtered.length} of {companies.length} companies
          {loading && ' (loading...)'}
        </span>
      </div>

      {/* Controls */}
      <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', boxShadow: '0 1px 2px rgba(28,1,64,.06)', padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="search"
            placeholder="Search company name or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: '1 1 18rem', fontFamily: 'inherit', fontSize: '0.92rem', color: '#1C0140', background: '#F4F5FA', border: '1px solid #D6D9E8', borderRadius: '3px', padding: '0.5rem 0.75rem' }}
          />
        </div>

        {/* Role Filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78', width: '4.6rem', flexShrink: 0 }}>Role</span>
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              style={{
                fontFamily: 'inherit', fontSize: '0.8rem', cursor: 'pointer',
                background: roleFilter === role ? '#376BE9' : '#E9EBF5',
                color: roleFilter === role ? '#FFFFFF' : '#1C0140',
                border: '1px solid transparent', borderRadius: '999px', padding: '0.24rem 0.7rem',
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              }}
              onMouseEnter={(e) => { if (roleFilter !== role) e.currentTarget.style.borderColor = '#376BE9' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent' }}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Sort & View Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78' }}>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                fontFamily: 'inherit', fontSize: '0.8rem', background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '3px',
                padding: '0.4rem 0.6rem', color: '#1C0140', cursor: 'pointer'
              }}
            >
              {sortOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div style={{ display: 'flex', gap: '0.25rem', background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '0.25rem', width: 'fit-content' }}>
            {(['table', 'grid', 'list'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  background: view === v ? '#376BE9' : 'none',
                  border: 'none',
                  padding: '0.5rem 0.6rem',
                  cursor: 'pointer',
                  color: view === v ? 'white' : '#666',
                  borderRadius: '3px',
                  fontSize: '1rem',
                  transition: 'all 0.15s',
                }}
                title={v === 'table' ? 'Table view' : v === 'grid' ? 'Grid view' : 'List view'}
              >
                {v === 'table' ? '▦' : v === 'grid' ? '⊞' : '☰'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table View (Primary) */}
      {view === 'table' && (
        <div style={{ marginBottom: '2rem', overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(100vh - 300px)', background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1400px' }}>
            <thead>
              <tr style={{ background: '#E9EBF5', borderBottom: '1px solid #D6D9E8', position: 'sticky', top: 0, zIndex: 10 }}>
                <th style={{ padding: '0.8rem', textAlign: 'left', fontWeight: 600, fontSize: '0.75rem', color: '#5A5D78', textTransform: 'uppercase', letterSpacing: '0.08em', minWidth: '200px' }}>Company</th>
                <th style={{ padding: '0.8rem', textAlign: 'center', fontWeight: 600, fontSize: '0.75rem', color: '#5A5D78', textTransform: 'uppercase', letterSpacing: '0.08em', minWidth: '80px' }}>Owner<br/>MW</th>
                <th style={{ padding: '0.8rem', textAlign: 'center', fontWeight: 600, fontSize: '0.75rem', color: '#5A5D78', textTransform: 'uppercase', letterSpacing: '0.08em', minWidth: '80px' }}>EPC<br/>MW</th>
                <th style={{ padding: '0.8rem', textAlign: 'center', fontWeight: 600, fontSize: '0.75rem', color: '#5A5D78', textTransform: 'uppercase', letterSpacing: '0.08em', minWidth: '80px' }}>OEM<br/>MW</th>
                <th style={{ padding: '0.8rem', textAlign: 'center', fontWeight: 600, fontSize: '0.75rem', color: '#5A5D78', textTransform: 'uppercase', letterSpacing: '0.08em', minWidth: '100px' }}>Total<br/>Capacity</th>
                <th style={{ padding: '0.8rem', textAlign: 'center', fontWeight: 600, fontSize: '0.75rem', color: '#5A5D78', textTransform: 'uppercase', letterSpacing: '0.08em', minWidth: '100px' }}>Projects<br/>(O/E/M)</th>
                <th style={{ padding: '0.8rem', textAlign: 'center', fontWeight: 600, fontSize: '0.75rem', color: '#5A5D78', textTransform: 'uppercase', letterSpacing: '0.08em', minWidth: '100px' }}>Awards<br/>(E/O)</th>
                <th style={{ padding: '0.8rem', textAlign: 'left', fontWeight: 600, fontSize: '0.75rem', color: '#5A5D78', textTransform: 'uppercase', letterSpacing: '0.08em', minWidth: '120px' }}>Latest Update</th>
                <th style={{ padding: '0.8rem', textAlign: 'left', fontWeight: 600, fontSize: '0.75rem', color: '#5A5D78', textTransform: 'uppercase', letterSpacing: '0.08em', minWidth: '150px' }}>Location</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((company) => (
                <tr
                  key={company.id}
                  style={{ borderBottom: '1px solid #D6D9E8', transition: 'background 0.1s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F7F9FE'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
                >
                  <td style={{ padding: '0.8rem', fontSize: '0.9rem', fontWeight: 600 }}>
                    <Link href={`/companies/${company.id}`} style={{ color: '#376BE9', textDecoration: 'none' }}>
                      {company.name}
                    </Link>
                  </td>
                  {/* Owner MW */}
                  <td style={{ padding: '0.8rem', fontSize: '0.85rem', textAlign: 'center', fontVariantNumeric: 'tabular-nums', color: company.stats.owner.mw > 0 ? '#1C0140' : '#5A5D78', fontWeight: company.stats.owner.mw > 0 ? 600 : 400 }}>
                    {formatMW(company.stats.owner.mw)}
                  </td>
                  {/* EPC MW */}
                  <td style={{ padding: '0.8rem', fontSize: '0.85rem', textAlign: 'center', fontVariantNumeric: 'tabular-nums', color: company.stats.epc.mw > 0 ? '#1C0140' : '#5A5D78', fontWeight: company.stats.epc.mw > 0 ? 600 : 400 }}>
                    {formatMW(company.stats.epc.mw)}
                  </td>
                  {/* OEM MW */}
                  <td style={{ padding: '0.8rem', fontSize: '0.85rem', textAlign: 'center', fontVariantNumeric: 'tabular-nums', color: company.stats.oem.mw > 0 ? '#1C0140' : '#5A5D78', fontWeight: company.stats.oem.mw > 0 ? 600 : 400 }}>
                    {formatMW(company.stats.oem.mw)}
                  </td>
                  {/* Total Capacity */}
                  <td style={{ padding: '0.8rem', fontSize: '0.85rem', textAlign: 'center', fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#376BE9' }}>
                    {formatMW(company.stats.total_mw)}
                  </td>
                  {/* Projects (O/E/M) */}
                  <td style={{ padding: '0.8rem', fontSize: '0.85rem', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
                    <span style={{ fontWeight: 600, color: '#1C0140' }}>
                      {company.stats.owner.count}/{company.stats.epc.count}/{company.stats.oem.count}
                    </span>
                  </td>
                  {/* Awards (E/O) */}
                  <td style={{ padding: '0.8rem', fontSize: '0.85rem', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
                    {company.stats.awards.epc_count === 0 && company.stats.awards.oem_count === 0 ? (
                      <span style={{ color: '#5A5D78' }}>—</span>
                    ) : (
                      <span>
                        <span style={{ fontWeight: 600, color: company.stats.awards.epc_count > 0 ? '#376BE9' : '#5A5D78' }}>
                          {company.stats.awards.epc_count}
                        </span>
                        <span style={{ color: '#D6D9E8', margin: '0 0.2rem' }}>/</span>
                        <span style={{ fontWeight: 600, color: company.stats.awards.oem_count > 0 ? '#376BE9' : '#5A5D78' }}>
                          {company.stats.awards.oem_count}
                        </span>
                      </span>
                    )}
                  </td>
                  {/* Latest Update */}
                  <td style={{ padding: '0.8rem', fontSize: '0.85rem', color: '#5A5D78' }}>
                    {formatDate(company.stats.last_updated)}
                  </td>
                  {/* Location */}
                  <td style={{ padding: '0.8rem', fontSize: '0.85rem', color: '#5A5D78' }}>
                    {company.headquarters || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid View */}
      {view === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {sorted.map((company) => (
            <div
              key={company.id}
              style={{ background: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '6px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', transition: 'all 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#376BE9'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e0e0e0'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div>
                <Link href={`/companies/${company.id}`} style={{ fontWeight: 600, fontSize: '1rem', color: '#376BE9', textDecoration: 'none' }}>
                  {company.name}
                </Link>
                <div style={{ fontSize: '0.75rem', color: '#5A5D78', marginTop: '0.25rem' }}>
                  {company.headquarters}
                </div>
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.75rem', padding: '0.6rem 0', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.65rem', color: '#5A5D78', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Owner</div>
                  <div style={{ fontWeight: 600, color: '#1C0140' }}>{formatMW(company.stats.owner.mw)}</div>
                  <div style={{ fontSize: '0.7rem', color: '#5A5D78' }}>({company.stats.owner.count})</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.65rem', color: '#5A5D78', textTransform: 'uppercase', marginBottom: '0.3rem' }}>EPC</div>
                  <div style={{ fontWeight: 600, color: '#1C0140' }}>{formatMW(company.stats.epc.mw)}</div>
                  <div style={{ fontSize: '0.7rem', color: '#5A5D78' }}>({company.stats.epc.count})</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.65rem', color: '#5A5D78', textTransform: 'uppercase', marginBottom: '0.3rem' }}>OEM</div>
                  <div style={{ fontWeight: 600, color: '#1C0140' }}>{formatMW(company.stats.oem.mw)}</div>
                  <div style={{ fontSize: '0.7rem', color: '#5A5D78' }}>({company.stats.oem.count})</div>
                </div>
              </div>

              {/* Total Capacity */}
              <div style={{ padding: '0.6rem 0', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.65rem', color: '#5A5D78', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Total Capacity</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#376BE9' }}>{formatMW(company.stats.total_mw)}</div>
              </div>

              {/* Awards */}
              {(company.stats.awards.epc_count > 0 || company.stats.awards.oem_count > 0) && (
                <div style={{ padding: '0.4rem 0' }}>
                  <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.65rem', color: '#5A5D78', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Awards</div>
                  <div style={{ fontSize: '0.8rem', color: '#376BE9', fontWeight: 600 }}>
                    {company.stats.awards.epc_count > 0 && <div>EPC: {company.stats.awards.epc_count}</div>}
                    {company.stats.awards.oem_count > 0 && <div>OEM: {company.stats.awards.oem_count}</div>}
                  </div>
                </div>
              )}

              {/* Latest Update */}
              <div style={{ fontSize: '0.75rem', color: '#5A5D78', marginTop: 'auto' }}>
                Updated {formatDate(company.stats.last_updated)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {sorted.map((company) => (
            <div
              key={company.id}
              style={{ background: '#FFFFFF', border: '1px solid #e0e0e0', borderRadius: '6px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', transition: 'all 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#376BE9'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e0e0e0'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link href={`/companies/${company.id}`} style={{ fontWeight: 600, fontSize: '1rem', color: '#376BE9', textDecoration: 'none' }}>
                  {company.name}
                </Link>
                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.3rem' }}>
                  {company.headquarters} • {company.stats.total_projects} projects • {formatMW(company.stats.total_mw)}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0, fontSize: '0.85rem', color: '#5A5D78' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 600, color: '#1C0140' }}>{company.stats.owner.count}</div>
                  <div style={{ fontSize: '0.7rem' }}>Owner</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 600, color: '#1C0140' }}>{company.stats.epc.count}</div>
                  <div style={{ fontSize: '0.7rem' }}>EPC</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 600, color: '#1C0140' }}>{company.stats.oem.count}</div>
                  <div style={{ fontSize: '0.7rem' }}>OEM</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {sorted.length === 0 && !loading && (
        <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#5A5D78', fontSize: '0.95rem' }}>
          {companies.length === 0 ? 'No companies found.' : 'No companies match your filters.'}
        </div>
      )}

      {/* Pagination Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 0', color: '#666', fontSize: '0.9rem', borderTop: '1px solid #f0f0f0', marginTop: '2rem' }}>
        <div>
          Showing {sorted.length} of {filtered.length} companies{filtered.length !== companies.length && ` (filtered from ${companies.length})`}
        </div>
      </div>
    </main>
  )
}
