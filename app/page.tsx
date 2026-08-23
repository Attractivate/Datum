'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import type { Project, Company } from '@/lib/types'

interface Event {
  id: string
  day: string
  date: string
  industry: string
  significant: boolean
  type: string
  title: string
  project: string
  project_id?: string
  company: string
  company_id?: string
  location: string
  source: string
  source_url?: string
  mergedSources?: number
}

// Empty initial events array - will be populated with real data on mount
const initialEvents: Event[] = []

const overdueProjects = [
  { name: 'Montezuma II', location: 'Solano County, CA', overdue: '13 yr overdue' },
  { name: 'Frostburg 138 kV', location: 'Allegany County, MD', overdue: '4 yr overdue' },
  { name: 'Fresno Cogeneration Expansion', location: 'Fresno County, CA', overdue: '3 yr overdue' },
  { name: 'Daggett Solar 3', location: 'San Bernardino County, CA', overdue: '3 yr overdue' },
  { name: 'Los Esteros Critical Energy', location: 'Santa Clara County, CA', overdue: '2 yr overdue' },
  { name: 'NY QP556 AC', location: 'Oneida/Albany County, NY', overdue: '2 yr overdue' },
]

interface ProjectStats {
  totalProjects: number
  pastDueProjects: number
  projectsByIndustry: Record<string, number>
}

export default function WhatChangedPage() {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [loading, setLoading] = useState(false)
  const [industryFilter, setIndustryFilter] = useState('all')
  const [significanceFilter, setSignificanceFilter] = useState('all')
  const [stats, setStats] = useState<ProjectStats>({ totalProjects: 0, pastDueProjects: 0, projectsByIndustry: {} })

  // Fetch project stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/projects')
        const data = await res.json()

        if (data.data && Array.isArray(data.data)) {
          const projects = data.data
          const projectsByIndustry: Record<string, number> = {}
          let pastDueCount = 0

          projects.forEach((p: any) => {
            const industry = p.industry || 'Unknown'
            projectsByIndustry[industry] = (projectsByIndustry[industry] || 0) + 1

            if (p.past_due) {
              pastDueCount++
            }
          })

          setStats({
            totalProjects: projects.length,
            pastDueProjects: pastDueCount,
            projectsByIndustry
          })
        }
      } catch (error) {
        console.error('Failed to fetch project stats:', error)
      }
    }

    fetchStats()
  }, [])

  // Fetch projects with source links and display as events
  useEffect(() => {
    const fetchProjectsAsEvents = async () => {
      try {
        setLoading(true)

        // Fetch companies for lookup
        const companiesRes = await fetch('/api/companies')
        const companiesData = await companiesRes.json()
        const companyLookup: Record<string, string> = {}
        companiesData.data?.forEach((c: any) => {
          companyLookup[c.id] = c.name
        })

        const res = await fetch('/api/projects?limit=100')
        const data = await res.json()

        if (data.data && Array.isArray(data.data)) {
          // Filter projects that have source URLs and transform to events
          const transformed: Event[] = data.data
            .filter((p: any) => p.source_url) // Only show projects with source URLs
            .slice(0, 20)
            .map((p: any) => {
              const ownerId = Array.isArray(p.owner) ? p.owner[0] : p.owner
              return {
                id: p.id,
                day: p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Unknown',
                date: p.created_at || new Date().toISOString(),
                industry: p.industry || 'Unknown',
                significant: false,
                type: 'Project Update',
                title: p.name,
                project: p.name,
                project_id: p.id,
                company: ownerId ? companyLookup[ownerId] || ownerId : '',
                company_id: ownerId,
                location: p.location || '',
                source: 'Source',
                source_url: p.source_url,
              }
            })
          setEvents(transformed)
        } else {
          setEvents([])
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error)
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    fetchProjectsAsEvents()
  }, [])

  const dayGroups = useMemo(() => {
    const groups = new Map<string, Event[]>()
    events.forEach(event => {
      if (!groups.has(event.day)) {
        groups.set(event.day, [])
      }
      groups.get(event.day)!.push(event)
    })
    return Array.from(groups.entries())
  }, [events])

  const filteredDayGroups = useMemo(() => {
    return dayGroups.map(([day, events]) => {
      const filtered = events.filter(e => {
        const matchInd = industryFilter === 'all' || e.industry === industryFilter
        const matchSig = significanceFilter === 'all' || e.significant
        return matchInd && matchSig
      })
      return { day, events: filtered }
    })
  }, [industryFilter, significanceFilter, dayGroups])

  const hasResults = filteredDayGroups.some(group => group.events.length > 0)

  return (
    <main style={{ maxWidth: '84rem', margin: '0 auto', padding: '1.75rem clamp(1rem, 3vw, 2rem) 5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Head */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '0.5rem 1.5rem' }}>
        <h1 style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 900, fontSize: 'clamp(1.6rem, 4vw, 2.1rem)', letterSpacing: '-0.03em', lineHeight: 1, margin: 0, marginRight: 'auto' }}>
          What Changed
        </h1>
        <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.7rem', letterSpacing: '0.06em', color: '#5A5D78', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#376BE9', boxShadow: '0 0 0 3px #E4EBFC' }}></div>
          Last run 19 Aug 2026, 10:04 CDT · 8 pipelines
        </div>
      </div>

      {/* Stats Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(10.5rem, 1fr))', gap: '0.7rem' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '0.85rem 1rem 0.95rem', display: 'flex', flexDirection: 'column', gap: '0.1rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
          <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.62rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78' }}>Active projects</div>
          <div style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1.85rem', lineHeight: 1.1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{stats.totalProjects.toLocaleString()}</div>
          <div style={{ fontSize: '0.8rem', color: '#5A5D78', lineHeight: 1.35 }}>Across six industries</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '0.85rem 1rem 0.95rem', display: 'flex', flexDirection: 'column', gap: '0.1rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
          <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.62rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78' }}>Events this week</div>
          <div style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1.85rem', lineHeight: 1.1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{events.length}</div>
          <div style={{ fontSize: '0.8rem', color: '#5A5D78', lineHeight: 1.35 }}>New activity on tracked projects</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '0.85rem 1rem 0.95rem', display: 'flex', flexDirection: 'column', gap: '0.1rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
          <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.62rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78' }}>Significant</div>
          <div style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1.85rem', lineHeight: 1.1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{events.filter(e => e.significant).length}</div>
          <div style={{ fontSize: '0.8rem', color: '#5A5D78', lineHeight: 1.35 }}>Awards, stage changes, filings — deduplicated</div>
        </div>

        <div style={{ background: '#FAF2DC', border: '1px solid #8A6A12', borderRadius: '4px', padding: '0.85rem 1rem 0.95rem', display: 'flex', flexDirection: 'column', gap: '0.1rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
          <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.62rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#8A6A12' }}>Past due</div>
          <div style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1.85rem', lineHeight: 1.1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', color: '#8A6A12' }}>{stats.pastDueProjects.toLocaleString()}</div>
          <div style={{ fontSize: '0.8rem', color: '#8A6A12', lineHeight: 1.35, opacity: 0.85 }}>Milestone date passed, no update since</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '0.8rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.7rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.62rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78', width: '5.2rem', flexShrink: 0 }}>Industry</span>
          {[
            { key: 'all', label: 'All', count: stats.totalProjects },
            { key: 'Power Generation', label: 'Power Generation', count: stats.projectsByIndustry['Power Generation'] || 0 },
            { key: 'Power Delivery', label: 'Power Delivery', count: stats.projectsByIndustry['Power Delivery'] || 0 },
            { key: 'Oil & Gas', label: 'Oil & Gas', count: stats.projectsByIndustry['Oil & Gas'] || 0 },
            { key: 'Hi Tech', label: 'Hi Tech', count: stats.projectsByIndustry['Hi Tech'] || 0 },
            { key: 'Life Sciences', label: 'Life Sciences', count: stats.projectsByIndustry['Life Sciences'] || 0 },
            { key: 'Water', label: 'Water', count: stats.projectsByIndustry['Water'] || 0 },
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => setIndustryFilter(filter.key)}
              style={{
                fontFamily: 'inherit',
                fontSize: '0.82rem',
                cursor: 'pointer',
                background: industryFilter === filter.key ? '#376BE9' : '#E9EBF5',
                color: industryFilter === filter.key ? '#FFFFFF' : '#1C0140',
                border: industryFilter === filter.key ? '1px solid #376BE9' : '1px solid transparent',
                borderRadius: '999px',
                padding: '0.28rem 0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (industryFilter !== filter.key) {
                  (e.target as HTMLButtonElement).style.borderColor = '#376BE9'
                }
              }}
              onMouseLeave={(e) => {
                if (industryFilter !== filter.key) {
                  (e.target as HTMLButtonElement).style.borderColor = 'transparent'
                }
              }}
            >
              {filter.label}
              <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.68rem', color: industryFilter === filter.key ? 'rgba(255,255,255,0.75)' : '#5A5D78', fontVariantNumeric: 'tabular-nums' }}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.62rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78', width: '5.2rem', flexShrink: 0 }}>Activity</span>
          {[
            { key: 'all', label: 'All activity', count: events.length },
            { key: 'sig', label: 'Significant only', count: events.filter(e => e.significant).length },
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => setSignificanceFilter(filter.key)}
              style={{
                fontFamily: 'inherit',
                fontSize: '0.82rem',
                cursor: 'pointer',
                background: significanceFilter === filter.key ? '#376BE9' : '#E9EBF5',
                color: significanceFilter === filter.key ? '#FFFFFF' : '#1C0140',
                border: significanceFilter === filter.key ? '1px solid #376BE9' : '1px solid transparent',
                borderRadius: '999px',
                padding: '0.28rem 0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (significanceFilter !== filter.key) {
                  (e.target as HTMLButtonElement).style.borderColor = '#376BE9'
                }
              }}
              onMouseLeave={(e) => {
                if (significanceFilter !== filter.key) {
                  (e.target as HTMLButtonElement).style.borderColor = 'transparent'
                }
              }}
            >
              {filter.label}
              <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.68rem', color: significanceFilter === filter.key ? 'rgba(255,255,255,0.75)' : '#5A5D78', fontVariantNumeric: 'tabular-nums' }}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 21rem', gap: '1.5rem', alignItems: 'start' } as any}>
        {/* Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {filteredDayGroups.map(({ day, events }) => (
            events.length > 0 && (
              <section key={day} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.66rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5A5D78', paddingBottom: '0.35rem', borderBottom: '1px solid #D6D9E8', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                  <span>{day}</span>
                  <span>{events.length} {events.length === 1 ? 'event' : 'events'}</span>
                </div>

                {events.map(event => (
                  <article
                    key={event.id}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #D6D9E8',
                      borderRadius: '4px',
                      padding: '0.8rem 0.95rem',
                      display: 'grid',
                      gap: '0.3rem 0.9rem',
                      gridTemplateColumns: '1fr',
                      boxShadow: '0 1px 2px rgba(28,1,64,.06)',
                      borderLeft: '3px solid ' + (event.significant ? '#376BE9' : 'transparent'),
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      const elem = e.currentTarget as HTMLElement
                      elem.style.borderColor = '#376BE9'
                      elem.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'
                    }}
                    onMouseLeave={(e) => {
                      const elem = e.currentTarget as HTMLElement
                      elem.style.borderColor = '#D6D9E8'
                      elem.style.boxShadow = '0 1px 2px rgba(28,1,64,.06)'
                    }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.45rem' }}>
                      <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', padding: '0.18rem 0.45rem', borderRadius: '2px', background: event.significant ? '#376BE9' : '#E9EBF5', color: event.significant ? '#FFFFFF' : '#5A5D78', whiteSpace: 'nowrap' }}>
                        {event.type}
                      </span>
                      {event.mergedSources && (
                        <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.06em', padding: '0.18rem 0.45rem', borderRadius: '2px', background: '#E4EBFC', color: '#376BE9', whiteSpace: 'nowrap' }}>
                          {event.mergedSources} sources
                        </span>
                      )}
                      {event.source_url ? (
                        <a href={event.source_url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.66rem', color: '#376BE9', marginLeft: 'auto', whiteSpace: 'nowrap', textDecoration: 'none', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
                          {event.source}
                        </a>
                      ) : (
                        <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.66rem', color: '#5A5D78', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                          {event.source}
                        </span>
                      )}
                    </div>

                    <div style={{ fontWeight: 600, fontSize: '0.97rem', lineHeight: 1.35 }}>
                      {event.source_url ? (
                        <a href={event.source_url} target="_blank" rel="noopener noreferrer" style={{ color: '#1C0140', textDecoration: 'none', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
                          {event.title}
                        </a>
                      ) : (
                        event.title
                      )}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem 0.7rem', fontSize: '0.82rem', color: '#5A5D78' }}>
                      {event.project_id ? (
                        <Link href={`/projects/${event.project_id}`} style={{ color: '#376BE9', fontWeight: 600, textDecoration: 'none', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
                          {event.project}
                        </Link>
                      ) : (
                        <span style={{ color: '#376BE9', fontWeight: 600 }}>{event.project}</span>
                      )}
                      <span style={{ opacity: 0.4 }}>·</span>
                      {event.company_id ? (
                        <Link href={`/companies/${event.company_id}`} style={{ color: '#5A5D78', textDecoration: 'none', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
                          {event.company}
                        </Link>
                      ) : (
                        <span>{event.company}</span>
                      )}
                      {event.location && (
                        <>
                          <span style={{ opacity: 0.4 }}>·</span>
                          <span>{event.location}</span>
                        </>
                      )}
                    </div>
                  </article>
                ))}
              </section>
            )
          ))}

          {!hasResults && (
            <div style={{ background: '#E9EBF5', border: '1px dashed #D6D9E8', borderRadius: '4px', padding: '2rem 1.25rem', textAlign: 'center', color: '#5A5D78', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <strong style={{ color: '#1C0140', fontFamily: 'Chivo,sans-serif', fontSize: '1.05rem' }}>Nothing matches those filters</strong>
              <span>Significant events are rare — 5 in the whole base so far. Widen to all activity to see the rest.</span>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderTop: '3px solid #8A6A12', borderRadius: '4px', padding: '1rem 1.1rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.7rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
          <h2 style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1.02rem', margin: 0, display: 'flex', alignItems: 'baseline', gap: '0.6rem', color: '#1C0140' }}>
            Needs attention
            <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.72rem', color: '#8A6A12', fontVariantNumeric: 'tabular-nums' }}>134</span>
          </h2>

          <p style={{ margin: 0, fontSize: '0.87rem', color: '#5A5D78' }}>
            Projected milestone date has passed with no update since. The oldest have been quiet for years.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {overdueProjects.map((project, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'baseline',
                  gap: '0.3rem 0.8rem',
                  padding: '0.5rem 0',
                  borderBottom: i < overdueProjects.length - 1 ? '1px solid #D6D9E8' : 'none',
                  fontSize: '0.87rem',
                }}
              >
                <span style={{ fontWeight: 600, color: '#376BE9' }}>{project.name}</span>
                <span style={{ color: '#5A5D78' }}>{project.location}</span>
                <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.72rem', color: '#8A6A12', marginLeft: 'auto', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                  {project.overdue}
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/projects"
            style={{
              fontSize: '0.84rem',
              color: '#376BE9',
              fontWeight: 600,
              textDecoration: 'none',
              alignSelf: 'flex-start',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            Review all 134 →
          </Link>
        </div>
      </div>
    </main>
  )
}