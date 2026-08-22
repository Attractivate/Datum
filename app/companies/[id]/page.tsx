'use client'

import { useState } from 'react'
import Link from 'next/link'

interface TimelineEvent {
  date: string
  type: 'mention'
  title: string
  project: string
  source: string
}

interface ProjectRecord {
  name: string
  size?: string
  status: string
}

const mockTimeline: TimelineEvent[] = [
  { date: '14 Aug 2026', type: 'mention', title: 'Bristol Myers Squibb to build new plant in Houston', project: 'Bristol Myers Squibb Biomanufacturing Plant, Houston, Texas', source: 'Pharmaceutical Processing World' },
  { date: '12 Aug 2026', type: 'mention', title: 'BMS adds $2.3 billion to Houston\'s pharma manufacturing boom', project: 'BMS Biomanufacturing Plant, Houston, Texas', source: 'Google News: Pharma Plants' },
  { date: '11 Aug 2026', type: 'mention', title: 'Bristol Myers Squibb selects Texas site to build $2.3bn biopharma campus', project: 'Bristol Myers Squibb Biomanufacturing Plant, Texas, USA', source: 'Google News: Pharma Plants' },
  { date: '11 Aug 2026', type: 'mention', title: 'Bristol Myers Squibb commits $2.3bn to modular Texas manufacturing facility', project: 'Bristol Myers Squibb Biomanufacturing Plant, Texas', source: 'Google News: Pharma Plants' },
  { date: '11 Aug 2026', type: 'mention', title: 'BMS banks on Texas for $2.3bn multi-modal manufacturing facility', project: 'BMS Biomanufacturing Plant, Texas', source: 'Google News: Pharma Plants' },
  { date: '11 Aug 2026', type: 'mention', title: 'BMS announces $2.3bn Houston manufacturing investment', project: 'BMS Biomanufacturing Plant, Houston, Texas', source: 'Google News: Pharma Plants' },
]

const mockProjects: ProjectRecord[] = [
  { name: 'Bristol Myers Squibb Biomanufacturing Plant, Houston, Texas', size: '600,000 sq ft / $2.3B', status: 'Needs review' },
  { name: 'BMS (Bristol Myers Squibb) Biomanufacturing Plant, Houston, Texas', size: '$2.3B', status: 'Needs review' },
  { name: 'Bristol Myers Squibb Biomanufacturing Plant, Texas, USA', size: '$2.3B biopharma campus', status: 'Needs review' },
  { name: 'Bristol Myers Squibb commits $2.3bn to modular Texas manufacturing facility', size: '$2.3B', status: 'Needs review' },
  { name: 'BMS adds $2.3 billion to Houston\'s pharma manufacturing boom', size: '$2.3 billion', status: 'Needs review' },
  { name: 'BMS banks on Texas for $2.3bn multi-modal manufacturing facility', size: '$2.3B', status: 'Needs review' },
]

const mockSources = [
  { title: 'Bristol Myers Squibb to build new plant in Houston', source: 'Pharmaceutical Processing World · 14 Aug 2026' },
  { title: 'BMS adds $2.3 billion to Houston\'s pharma manufacturing boom', source: 'Google News: Pharma Plants · 12 Aug 2026' },
  { title: 'Bristol Myers Squibb selects Texas site to build $2.3bn biopharma campus', source: 'Google News: Pharma Plants · 11 Aug 2026' },
  { title: 'Bristol Myers Squibb commits $2.3bn to modular Texas manufacturing facility', source: 'Google News: Pharma Plants · 11 Aug 2026' },
  { title: 'BMS banks on Texas for $2.3bn multi-modal manufacturing facility', source: 'Google News: Pharma Plants · 11 Aug 2026' },
  { title: 'BMS announces $2.3bn Houston manufacturing investment', source: 'Google News: Pharma Plants · 11 Aug 2026' },
]

export default function CompanyDetail() {
  const [timelineFilter, setTimelineFilter] = useState('all')

  const filteredTimeline = timelineFilter === 'all' ? mockTimeline : []

  return (
    <main style={{ maxWidth: '84rem', margin: '0 auto', padding: '1.4rem clamp(1rem, 3vw, 2rem) 5rem', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
      {/* Breadcrumb */}
      <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.7rem', letterSpacing: '0.08em', color: '#5A5D78' }}>
        <Link href="/companies" style={{ color: '#376BE9', textDecoration: 'none' }}>Companies</Link>
        {' / Bristol Myers Squibb'}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <h1 style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 900, fontSize: 'clamp(1.7rem, 4.5vw, 2.4rem)', letterSpacing: '-.03em', lineHeight: 1.02, margin: 0 }}>
          Bristol Myers Squibb
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
          <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', background: '#376BE9', color: '#FFFFFF', padding: '0.22rem 0.55rem', borderRadius: '2px' }}>
            Owner
          </span>
          <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', background: '#E9EBF5', color: '#5A5D78', padding: '0.22rem 0.55rem', borderRadius: '2px' }}>
            Life Sciences
          </span>
          <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', background: '#E9EBF5', color: '#5A5D78', padding: '0.22rem 0.55rem', borderRadius: '2px' }}>
            Active — last seen 14 Aug 2026
          </span>
        </div>
      </div>

      {/* Duplicate Banner */}
      <div style={{ background: '#FAF2DC', border: '3px solid #8A6A12', borderRadius: '4px', padding: '0.85rem 1.1rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem 1rem' }}>
        <div style={{ flex: '1 1 22rem' }}>
          <div style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#8A6A12', margin: 0 }}>
            Possible duplicate record
          </div>
          <p style={{ margin: '0.15rem 0 0', fontSize: '0.88rem', color: '#5A5D78' }}>
            <strong>BMS (Bristol Myers Squibb)</strong> holds 3 more projects and 3 more events, all describing the same Houston facility. Acronym-and-expansion pairs don't collapse automatically — this one needs your call.
          </p>
        </div>
        <button style={{ fontFamily: 'inherit', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer', background: '#8A6A12', color: '#FAF2DC', border: 'none', borderRadius: '3px', padding: '0.42rem 0.9rem', whiteSpace: 'nowrap' }}>
          Review merge
        </button>
        <button style={{ fontFamily: 'inherit', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer', background: 'transparent', color: '#8A6A12', border: '1px solid #8A6A12', borderRadius: '3px', padding: '0.42rem 0.9rem', whiteSpace: 'nowrap' }}>
          Not a duplicate
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(9.5rem, 1fr))', gap: '0.7rem' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '0.8rem 0.95rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.08rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
          <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78' }}>Projects</div>
          <div style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1.55rem', lineHeight: 1.15, letterSpacing: '-0.02em' }}>6</div>
          <div style={{ fontSize: '0.78rem', color: '#5A5D78', lineHeight: 1.3 }}>Across 1 real facility — see below</div>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '0.8rem 0.95rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.08rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
          <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78' }}>Announced value</div>
          <div style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1.55rem', lineHeight: 1.15, letterSpacing: '-0.02em' }}>$2.3B</div>
          <div style={{ fontSize: '0.78rem', color: '#5A5D78', lineHeight: 1.3 }}>600,000 sq ft, Houston</div>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '0.8rem 0.95rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.08rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
          <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78' }}>Events</div>
          <div style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1.55rem', lineHeight: 1.15, letterSpacing: '-0.02em' }}>6</div>
          <div style={{ fontSize: '0.78rem', color: '#5A5D78', lineHeight: 1.3 }}>All coverage, no awards yet</div>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '0.8rem 0.95rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.08rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
          <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78' }}>First seen</div>
          <div style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1.55rem', lineHeight: 1.15, letterSpacing: '-0.02em' }}>11 Aug</div>
          <div style={{ fontSize: '0.78rem', color: '#5A5D78', lineHeight: 1.3 }}>2026 — Google News: Pharma Plants</div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 20rem', gap: '1.4rem', alignItems: 'start' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          {/* Timeline Panel */}
          <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', boxShadow: '0 1px 2px rgba(28,1,64,.06)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '0.75rem 1.05rem', borderBottom: '1px solid #D6D9E8', display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0.4rem 0.8rem' }}>
              <h2 style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1rem', margin: 0, marginRight: 'auto' }}>Timeline</h2>
              <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.68rem', color: '#5A5D78' }}>6 events</span>
            </div>
            <div style={{ padding: '1.05rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {(['all', 'sig', 'company'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTimelineFilter(f)}
                    style={{
                      fontFamily: 'inherit',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      background: timelineFilter === f ? '#376BE9' : '#E9EBF5',
                      color: timelineFilter === f ? '#FFFFFF' : '#1C0140',
                      border: '1px solid transparent',
                      borderRadius: '999px',
                      padding: '0.24rem 0.7rem',
                    }}
                  >
                    {f === 'all' ? 'All activity' : f === 'sig' ? 'Significant only' : 'Company-level'}
                  </button>
                ))}
              </div>

              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 0 }}>
                {mockTimeline.map((event, idx) => (
                  <li key={idx} style={{ display: 'grid', gridTemplateColumns: '5.4rem 1fr', gap: '0.2rem 0.9rem', padding: '0.75rem 0', borderBottom: '1px solid #D6D9E8', position: 'relative' }}>
                    <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.7rem', color: '#5A5D78', paddingTop: '0.15rem', whiteSpace: 'nowrap' }}>
                      {event.date}
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.28rem', minWidth: 0 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', background: '#E9EBF5', color: '#5A5D78', padding: '0.16rem 0.42rem', borderRadius: '2px', whiteSpace: 'nowrap' }}>
                          News Mention
                        </span>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.94rem', lineHeight: 1.35, color: '#1C0140' }}>
                        {event.title}
                      </div>
                      <div style={{ fontSize: '0.81rem', color: '#5A5D78' }}>
                        <span style={{ color: '#376BE9', fontWeight: 600 }}>{event.project}</span>
                        <span style={{ opacity: 0.4 }}> · </span>
                        <span>{event.source}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Projects Panel */}
          <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', boxShadow: '0 1px 2px rgba(28,1,64,.06)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '0.75rem 1.05rem', borderBottom: '1px solid #D6D9E8', display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0.4rem 0.8rem' }}>
              <h2 style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1rem', margin: 0, marginRight: 'auto' }}>Projects</h2>
              <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.68rem', color: '#5A5D78' }}>6 records · 1 facility</span>
            </div>
            <div style={{ padding: '1.05rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ border: '1px solid #D6D9E8', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ background: '#E9EBF5', padding: '0.6rem 0.85rem', display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0.35rem 0.7rem' }}>
                  <span style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '0.95rem', marginRight: 'auto' }}>
                    Houston biomanufacturing plant — $2.3B
                  </span>
                  <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', background: '#8A6A12', color: '#FAF2DC', padding: '0.16rem 0.42rem', borderRadius: '2px', whiteSpace: 'nowrap' }}>
                    6 records, 1 project
                  </span>
                </div>
                {mockProjects.map((proj, idx) => (
                  <div key={idx} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0.25rem 0.7rem', padding: '0.55rem 0.85rem', borderTop: '1px solid #D6D9E8', fontSize: '0.86rem' }}>
                    <span style={{ color: '#376BE9', fontWeight: 600, flex: '1 1 16rem', minWidth: 0 }}>
                      {proj.name}
                    </span>
                    {proj.size && (
                      <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.72rem', color: '#5A5D78' }}>
                        {proj.size}
                      </span>
                    )}
                    <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.62rem', color: '#8A6A12', whiteSpace: 'nowrap' }}>
                      {proj.status}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ background: '#E9EBF5', borderLeft: '2px solid #376BE9', padding: '0.7rem 0.9rem', fontSize: '0.85rem', color: '#5A5D78', borderRadius: '0 3px 3px 0' }}>
                <strong style={{ color: '#1C0140', fontWeight: 600 }}>Six records, one plant.</strong> Each outlet's story became its own project because the owner resolved to two different company records and the location came through as "Houston, Texas", "Texas" and "Texas, USA". The page clusters them so the company reads correctly while the underlying records still need merging.
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          {/* At a Glance */}
          <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', boxShadow: '0 1px 2px rgba(28,1,64,.06)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '0.75rem 1.05rem', borderBottom: '1px solid #D6D9E8' }}>
              <h3 style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1rem', margin: 0 }}>At a glance</h3>
            </div>
            <div style={{ padding: '1.05rem', display: 'flex', flexDirection: 'column' }}>
              {[
                { dt: 'Roles played', dd: 'Owner' },
                { dt: 'Sectors', dd: 'Life Sciences' },
                { dt: 'Active projects', dd: '6' },
                { dt: 'States', dd: 'Texas' },
                { dt: 'First seen', dd: '11 Aug 2026' },
                { dt: 'Last activity', dd: '14 Aug 2026' },
                { dt: 'Record origin', dd: 'Pipeline' },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.42rem 0', borderBottom: '1px solid #D6D9E8', fontSize: '0.86rem' }}>
                  <dt style={{ color: '#5A5D78', margin: 0 }}>{item.dt}</dt>
                  <dd style={{ margin: 0, fontWeight: 600, textAlign: 'right' }}>{item.dd}</dd>
                </div>
              ))}
            </div>
          </div>

          {/* Contacts */}
          <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', boxShadow: '0 1px 2px rgba(28,1,64,.06)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '0.75rem 1.05rem', borderBottom: '1px solid #D6D9E8', display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0.4rem 0.8rem' }}>
              <h3 style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1rem', margin: 0, marginRight: 'auto' }}>Contacts</h3>
              <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.68rem', color: '#5A5D78' }}>0</span>
            </div>
            <div style={{ padding: '1.05rem' }}>
              <div style={{ background: '#E9EBF5', border: '1px dashed #D6D9E8', borderRadius: '3px', padding: '0.85rem 0.95rem', fontSize: '0.86rem', color: '#5A5D78' }}>
                <strong style={{ color: '#1C0140', fontWeight: 600 }}>No one named yet.</strong> Extraction reads headlines and RSS summaries, not full articles, so most stories name nobody. Contacts fill in slowly — an executive quoted in an announcement is the usual catch.
              </div>
            </div>
          </div>

          {/* Sources */}
          <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', boxShadow: '0 1px 2px rgba(28,1,64,.06)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '0.75rem 1.05rem', borderBottom: '1px solid #D6D9E8', display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0.4rem 0.8rem' }}>
              <h3 style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1rem', margin: 0, marginRight: 'auto' }}>Sources</h3>
              <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.68rem', color: '#5A5D78' }}>6</span>
            </div>
            <div style={{ padding: '1.05rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {mockSources.map((src, idx) => (
                <a key={idx} href="#" style={{ fontSize: '0.84rem', color: '#376BE9', textDecoration: 'none', fontWeight: 600, lineHeight: 1.3 }}>
                  {src.title}
                  <span style={{ display: 'block', fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.66rem', color: '#5A5D78', fontWeight: 400 }}>
                    {src.source}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
