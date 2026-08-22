'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface Event {
  id: string
  day: string
  date: string
  industry: string
  significant: boolean
  type: string
  title: string
  project: string
  company: string
  location: string
  source: string
  mergedSources?: number
}

const mockEvents: Event[] = [
  {
    id: '1',
    day: 'Wednesday 19 August',
    date: 'wed19',
    industry: 'Hi Tech',
    significant: false,
    type: 'News Mention',
    title: 'Google reveals it is behind 506-acre Project Clydesdale data center in Oklahoma',
    project: 'Project Clydesdale',
    company: 'Google',
    location: 'Tulsa County, Oklahoma',
    source: 'News pipeline',
  },
  {
    id: '2',
    day: 'Wednesday 19 August',
    date: 'wed19',
    industry: 'Hi Tech',
    significant: false,
    type: 'News Mention',
    title: 'NVIDIA partners with SB Energy on 10-GW AI "factory" in Ohio',
    project: 'Piketon AI Factory',
    company: 'NVIDIA and SB Energy',
    location: 'Piketon, Ohio',
    source: 'News pipeline',
  },
  {
    id: '3',
    day: 'Wednesday 19 August',
    date: 'wed19',
    industry: 'Life Sciences',
    significant: false,
    type: 'News Mention',
    title: 'Genentech marks topping-out milestone for new Holly Springs manufacturing facility',
    project: 'Holly Springs Fill-Finish',
    company: 'Genentech',
    location: 'Holly Springs, North Carolina',
    source: 'News pipeline',
  },
  {
    id: '4',
    day: 'Wednesday 19 August',
    date: 'wed19',
    industry: 'Power Delivery',
    significant: false,
    type: 'News Mention',
    title: 'Georgia Transmission builds new 230-kV station amid rising demand',
    project: 'Georgia 230-kV Station',
    company: 'Georgia Transmission',
    location: 'Georgia',
    source: 'News pipeline',
  },
  {
    id: '5',
    day: 'Wednesday 19 August',
    date: 'wed19',
    industry: 'Water Infrastructure',
    significant: false,
    type: 'News Mention',
    title: 'Town of Lady Lake receives $1 million from state for water reclamation facility',
    project: 'Lady Lake Water Reclamation',
    company: 'Town of Lady Lake',
    location: 'Lady Lake, Florida',
    source: 'News pipeline',
  },
  {
    id: '6',
    day: 'Wednesday 19 August',
    date: 'wed19',
    industry: 'Life Sciences',
    significant: false,
    type: 'News Mention',
    title: 'Sterigenics opens X-ray sterilisation facility at North Carolina campus',
    project: 'Sterigenics NC Campus',
    company: 'Sterigenics',
    location: 'North Carolina',
    source: 'News pipeline',
  },
  {
    id: '7',
    day: 'Wednesday 19 August',
    date: 'wed19',
    industry: 'Power Delivery',
    significant: false,
    type: 'News Mention',
    title: 'Southern Wisconsin landowners raise concerns over potential BECI 765-kV transmission line',
    project: 'BECI 765-kV Line',
    company: 'Southern Wisconsin',
    location: 'Wisconsin',
    source: 'News pipeline',
  },
  {
    id: '8',
    day: 'Tuesday 18 August',
    date: 'tue18',
    industry: 'Hi Tech',
    significant: false,
    type: 'News Mention',
    title: 'OpenAI announces role in Pike County AI campus expected to create 35,000 construction jobs',
    project: 'Pike County AI Campus',
    company: 'OpenAI',
    location: 'Pike County, Ohio',
    source: 'News pipeline',
  },
  {
    id: '9',
    day: 'Tuesday 18 August',
    date: 'tue18',
    industry: 'Oil & Gas',
    significant: false,
    type: 'News Mention',
    title: 'Proposed gas pipeline for Project Jupiter data center delayed to 2027, filings show',
    project: 'Project Jupiter Pipeline',
    company: 'New Mexico',
    location: 'New Mexico',
    source: 'News pipeline',
  },
  {
    id: '10',
    day: 'Tuesday 18 August',
    date: 'tue18',
    industry: 'Oil & Gas',
    significant: false,
    type: 'News Mention',
    title: 'Controversial $2B Montana pipeline hits a speed bump',
    project: 'Montana Pipeline',
    company: 'Montana',
    location: 'Montana',
    source: 'News pipeline',
  },
  {
    id: '11',
    day: 'Tuesday 18 August',
    date: 'tue18',
    industry: 'Power Generation',
    significant: false,
    type: 'News Mention',
    title: 'Arevon celebrates opening of its Nighthawk Energy Storage Project in Poway',
    project: 'Nighthawk Energy Storage',
    company: 'Arevon',
    location: 'Poway, California',
    source: 'News pipeline',
  },
  {
    id: '12',
    day: 'Monday 17 August',
    date: 'mon17',
    industry: 'Hi Tech',
    significant: true,
    type: 'Contract Award',
    title: 'OEM: Nvidia — Nvidia in talks to invest $1.5bn in SB Energy',
    project: 'Piketon AI Factory',
    company: 'NVIDIA and SB Energy',
    location: 'Piketon, Ohio',
    source: 'News pipeline',
  },
  {
    id: '13',
    day: 'Friday 14 August',
    date: 'fri14',
    industry: 'Power Generation',
    significant: true,
    type: 'Contract Award',
    title: 'EPC: Skanska',
    project: 'Oyster Creek',
    company: 'Skanska named EPC',
    location: '',
    source: 'News pipeline',
  },
  {
    id: '14',
    day: 'Friday 14 August',
    date: 'fri14',
    industry: 'Power Generation',
    significant: true,
    type: 'Contract Award',
    title: 'OEM: Doosan Enerbility',
    project: 'Natrium Nuclear Power Plant',
    company: 'TerraPower',
    location: 'Kemmerer, Wyoming',
    source: 'News pipeline',
    mergedSources: 4,
  },
  {
    id: '15',
    day: 'Thursday 13 August',
    date: 'thu13',
    industry: 'Hi Tech',
    significant: true,
    type: 'Contract Award',
    title: 'EPC: Hillcore',
    project: 'Project Matador',
    company: 'Hillcore named EPC',
    location: '',
    source: 'News pipeline',
  },
  {
    id: '16',
    day: 'Wednesday 12 August',
    date: 'wed12',
    industry: 'Power Delivery',
    significant: true,
    type: 'Stage Change',
    title: 'Stage: Announced → Under Construction',
    project: 'ATC Data Center Connection',
    company: 'American Transmission Co.',
    location: 'Wisconsin',
    source: 'News pipeline',
  },
]

const overdueProjects = [
  { name: 'Montezuma II', location: 'Solano County, CA', overdue: '13 yr overdue' },
  { name: 'Frostburg 138 kV', location: 'Allegany County, MD', overdue: '4 yr overdue' },
  { name: 'Fresno Cogeneration Expansion', location: 'Fresno County, CA', overdue: '3 yr overdue' },
  { name: 'Daggett Solar 3', location: 'San Bernardino County, CA', overdue: '3 yr overdue' },
  { name: 'Los Esteros Critical Energy', location: 'Santa Clara County, CA', overdue: '2 yr overdue' },
  { name: 'NY QP556 AC', location: 'Oneida/Albany County, NY', overdue: '2 yr overdue' },
]

export default function WhatChangedPage() {
  const [industryFilter, setIndustryFilter] = useState('all')
  const [significanceFilter, setSignificanceFilter] = useState('all')

  const dayGroups = useMemo(() => {
    const groups = new Map<string, Event[]>()
    mockEvents.forEach(event => {
      if (!groups.has(event.day)) {
        groups.set(event.day, [])
      }
      groups.get(event.day)!.push(event)
    })
    return Array.from(groups.entries())
  }, [])

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
          <div style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1.85rem', lineHeight: 1.1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>4,081</div>
          <div style={{ fontSize: '0.8rem', color: '#5A5D78', lineHeight: 1.35 }}>Across six industries</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '0.85rem 1rem 0.95rem', display: 'flex', flexDirection: 'column', gap: '0.1rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
          <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.62rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78' }}>Events this week</div>
          <div style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1.85rem', lineHeight: 1.1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>153</div>
          <div style={{ fontSize: '0.8rem', color: '#5A5D78', lineHeight: 1.35 }}>New activity on tracked projects</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '0.85rem 1rem 0.95rem', display: 'flex', flexDirection: 'column', gap: '0.1rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
          <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.62rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78' }}>Significant</div>
          <div style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1.85rem', lineHeight: 1.1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>5</div>
          <div style={{ fontSize: '0.8rem', color: '#5A5D78', lineHeight: 1.35 }}>Awards, stage changes, filings — deduplicated</div>
        </div>

        <div style={{ background: '#FAF2DC', border: '1px solid #8A6A12', borderRadius: '4px', padding: '0.85rem 1rem 0.95rem', display: 'flex', flexDirection: 'column', gap: '0.1rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
          <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.62rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#8A6A12' }}>Past due</div>
          <div style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1.85rem', lineHeight: 1.1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', color: '#8A6A12' }}>134</div>
          <div style={{ fontSize: '0.8rem', color: '#8A6A12', lineHeight: 1.35, opacity: 0.85 }}>Milestone date passed, no update since</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '0.8rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.7rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.62rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78', width: '5.2rem', flexShrink: 0 }}>Industry</span>
          {[
            { key: 'all', label: 'All', count: 4081 },
            { key: 'Power Generation', label: 'Power Generation', count: 3843 },
            { key: 'Oil & Gas', label: 'Oil & Gas', count: 83 },
            { key: 'Hi Tech', label: 'Hi Tech', count: 51 },
            { key: 'Power Delivery', label: 'Power Delivery', count: 35 },
            { key: 'Water Infrastructure', label: 'Water', count: 28 },
            { key: 'Life Sciences', label: 'Life Sciences', count: 26 },
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
            { key: 'all', label: 'All activity', count: 153 },
            { key: 'sig', label: 'Significant only', count: 5 },
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
                      <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.66rem', color: '#5A5D78', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                        {event.source}
                      </span>
                    </div>

                    <div style={{ fontWeight: 600, fontSize: '0.97rem', lineHeight: 1.35 }}>
                      {event.title}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem 0.7rem', fontSize: '0.82rem', color: '#5A5D78' }}>
                      <span style={{ color: '#376BE9', fontWeight: 600 }}>{event.project}</span>
                      <span style={{ opacity: 0.4 }}>·</span>
                      <span>{event.company}</span>
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