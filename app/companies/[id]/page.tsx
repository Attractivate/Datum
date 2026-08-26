'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'

interface TimelineEvent {
  id: string
  created_at: string
  event_type: string
  title: string
  description?: string
  source_url?: string
  is_significant: boolean
}

interface Project {
  id: string
  name: string
  size?: string
  status: string
  role?: string
}

interface Contact {
  id: string
  name: string
  title: string
  email?: string
  phone?: string
  linkedin_url?: string
}

interface Company {
  id: string
  name: string
  headquarters?: string
  industry_id?: string
  description?: string
  projects_count?: number
  created_at?: string
  updated_at?: string
  projects?: Project[]
  updates?: TimelineEvent[]
  contacts?: Contact[]
}

export default function CompanyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [company, setCompany] = useState<Company | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [timelineFilter, setTimelineFilter] = useState('all')

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/companies/${id}`)
        const data = await res.json()
        if (data.success && data.data) {
          setCompany(data.data)

          // Fetch contacts for this company
          const contactsRes = await fetch(`/api/companies/${id}/contacts`)
          const contactsData = await contactsRes.json()
          if (contactsData.success && contactsData.data) {
            setContacts(contactsData.data)
          }

          // Fetch projects for this company
          const projectsRes = await fetch(`/api/companies/${id}/projects`)
          const projectsData = await projectsRes.json()
          if (projectsData.success && projectsData.data) {
            setProjects(projectsData.data)
          }
        }
      } catch (error) {
        console.error('Failed to fetch company:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompany()
  }, [id])

  if (loading || !company) {
    return (
      <main style={{ maxWidth: '84rem', margin: '0 auto', padding: '1.4rem clamp(1rem, 3vw, 2rem) 5rem', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
        <div style={{ fontSize: '1.2rem', color: '#5A5D78' }}>Loading company details...</div>
      </main>
    )
  }

  const updates = company.updates || []

  return (
    <main style={{ maxWidth: '84rem', margin: '0 auto', padding: '1.4rem clamp(1rem, 3vw, 2rem) 5rem', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
      {/* Breadcrumb */}
      <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.7rem', letterSpacing: '0.08em', color: '#5A5D78' }}>
        <Link href="/companies" style={{ color: '#376BE9', textDecoration: 'none' }}>Companies</Link>
        {' / '}{company.name}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <h1 style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 900, fontSize: 'clamp(1.7rem, 4.5vw, 2.4rem)', letterSpacing: '-.03em', lineHeight: 1.02, margin: 0 }}>
          {company.name}
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
          <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', background: '#376BE9', color: '#FFFFFF', padding: '0.22rem 0.55rem', borderRadius: '2px' }}>
            Company
          </span>
          {company.headquarters && (
            <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', background: '#E9EBF5', color: '#5A5D78', padding: '0.22rem 0.55rem', borderRadius: '2px' }}>
              {company.headquarters}
            </span>
          )}
          {company.updated_at && (
            <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', background: '#E9EBF5', color: '#5A5D78', padding: '0.22rem 0.55rem', borderRadius: '2px' }}>
              Last updated {new Date(company.updated_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Company Description */}
      {company.description && (
        <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '1.2rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
          <h2 style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1rem', color: '#1C0140', margin: '0 0 0.8rem 0' }}>About</h2>
          <p style={{ fontFamily: 'Source Sans 3,sans-serif', fontSize: '0.95rem', color: '#5A5D78', lineHeight: 1.6, margin: 0 }}>
            {company.description}
          </p>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(9.5rem, 1fr))', gap: '0.7rem' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '0.8rem 0.95rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.08rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
          <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78' }}>Projects</div>
          <div style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1.55rem', lineHeight: 1.15, letterSpacing: '-0.02em' }}>{projects.length}</div>
          <div style={{ fontSize: '0.78rem', color: '#5A5D78', lineHeight: 1.3 }}>tracked projects</div>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '0.8rem 0.95rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.08rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
          <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78' }}>Updates</div>
          <div style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1.55rem', lineHeight: 1.15, letterSpacing: '-0.02em' }}>{updates.length}</div>
          <div style={{ fontSize: '0.78rem', color: '#5A5D78', lineHeight: 1.3 }}>mentions & events</div>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '0.8rem 0.95rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.08rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
          <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78' }}>Contacts</div>
          <div style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1.55rem', lineHeight: 1.15, letterSpacing: '-0.02em' }}>{contacts.length}</div>
          <div style={{ fontSize: '0.78rem', color: '#5A5D78', lineHeight: 1.3 }}>executives tracked</div>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '0.8rem 0.95rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.08rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
          <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78' }}>Added</div>
          <div style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1.55rem', lineHeight: 1.15, letterSpacing: '-0.02em' }}>{company.created_at ? new Date(company.created_at).toLocaleDateString() : '—'}</div>
          <div style={{ fontSize: '0.78rem', color: '#5A5D78', lineHeight: 1.3 }}>to database</div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 20rem', gap: '1.4rem', alignItems: 'start' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          {/* Timeline Panel */}
          {updates.length > 0 && (
            <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', boxShadow: '0 1px 2px rgba(28,1,64,.06)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '0.75rem 1.05rem', borderBottom: '1px solid #D6D9E8', display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0.4rem 0.8rem' }}>
                <h2 style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1rem', margin: 0, marginRight: 'auto' }}>Timeline</h2>
                <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.68rem', color: '#5A5D78' }}>{updates.length} events</span>
              </div>
              <div style={{ padding: '1.05rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {updates.map((update) => (
                    <li key={update.id} style={{ display: 'grid', gridTemplateColumns: '5.4rem 1fr', gap: '0.2rem 0.9rem', padding: '0.75rem 0', borderBottom: '1px solid #D6D9E8', position: 'relative' }}>
                      <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.7rem', color: '#5A5D78', paddingTop: '0.15rem', whiteSpace: 'nowrap' }}>
                        {new Date(update.created_at).toLocaleDateString()}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.28rem', minWidth: 0 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', background: update.is_significant ? '#376BE9' : '#E9EBF5', color: update.is_significant ? '#FFFFFF' : '#5A5D78', padding: '0.16rem 0.42rem', borderRadius: '2px', whiteSpace: 'nowrap' }}>
                            {update.event_type}
                          </span>
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '0.94rem', lineHeight: 1.35, color: '#1C0140' }}>
                          {update.title}
                        </div>
                        {update.description && (
                          <div style={{ fontSize: '0.81rem', color: '#5A5D78' }}>
                            {update.description}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Projects Panel */}
          {projects.length > 0 && (
            <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', boxShadow: '0 1px 2px rgba(28,1,64,.06)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '0.75rem 1.05rem', borderBottom: '1px solid #D6D9E8', display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0.4rem 0.8rem' }}>
                <h2 style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1rem', margin: 0, marginRight: 'auto' }}>Projects</h2>
                <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.68rem', color: '#5A5D78' }}>{projects.length} projects</span>
              </div>
              <div style={{ padding: '1.05rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {projects.map((proj, idx) => (
                    <Link key={proj.id} href={`/projects/${proj.id}`} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0.25rem 0.7rem', padding: '0.55rem 0.85rem', borderTop: idx === 0 ? 'none' : '1px solid #D6D9E8', fontSize: '0.86rem', textDecoration: 'none' }}>
                      <span style={{ color: '#376BE9', fontWeight: 600, flex: '1 1 16rem', minWidth: 0 }}>
                        {proj.name}
                      </span>
                      {proj.role && (
                        <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.72rem', color: '#5A5D78' }}>
                          ({proj.role})
                        </span>
                      )}
                      {proj.status && (
                        <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.62rem', color: '#8A6A12', whiteSpace: 'nowrap' }}>
                          {proj.status}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Contacts Panel */}
          {contacts.length > 0 && (
            <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', boxShadow: '0 1px 2px rgba(28,1,64,.06)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '0.75rem 1.05rem', borderBottom: '1px solid #D6D9E8', display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0.4rem 0.8rem' }}>
                <h2 style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1rem', margin: 0, marginRight: 'auto' }}>Contacts</h2>
                <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.68rem', color: '#5A5D78' }}>{contacts.length} contacts</span>
              </div>
              <div style={{ padding: '1.05rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {contacts.map((contact, idx) => (
                  <div key={contact.id} style={{ padding: '0.75rem', borderTop: idx === 0 ? 'none' : '1px solid #D6D9E8', borderLeft: '3px solid #376BE9', background: '#F9FAFB', borderRadius: '2px', fontSize: '0.88rem' }}>
                    <div style={{ fontWeight: 600, color: '#1C0140', marginBottom: '0.2rem' }}>
                      {contact.name}
                    </div>
                    {contact.title && (
                      <div style={{ fontSize: '0.78rem', color: '#5A5D78', marginBottom: '0.4rem' }}>
                        {contact.title}
                      </div>
                    )}
                    <div style={{ fontSize: '0.78rem', color: '#5A5D78', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      {contact.email && (
                        <div>
                          <a href={`mailto:${contact.email}`} style={{ color: '#376BE9', textDecoration: 'none' }}>
                            📧 {contact.email}
                          </a>
                        </div>
                      )}
                      {contact.phone && (
                        <div>
                          <a href={`tel:${contact.phone}`} style={{ color: '#376BE9', textDecoration: 'none' }}>
                            📞 {contact.phone}
                          </a>
                        </div>
                      )}
                      {contact.linkedin_url && (
                        <div>
                          <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: '#376BE9', textDecoration: 'none' }}>
                            💼 LinkedIn
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          {/* Description */}
          {company.description && (
            <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', boxShadow: '0 1px 2px rgba(28,1,64,.06)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '0.75rem 1.05rem', borderBottom: '1px solid #D6D9E8' }}>
                <h3 style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1rem', margin: 0 }}>About</h3>
              </div>
              <div style={{ padding: '1.05rem' }}>
                <p style={{ fontSize: '0.9rem', color: '#5A5D78', margin: 0, lineHeight: 1.5 }}>
                  {company.description}
                </p>
              </div>
            </div>
          )}

          {/* Contacts */}
          {contacts.length > 0 && (
            <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', boxShadow: '0 1px 2px rgba(28,1,64,.06)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '0.75rem 1.05rem', borderBottom: '1px solid #D6D9E8', display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0.4rem 0.8rem' }}>
                <h3 style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1rem', margin: 0, marginRight: 'auto' }}>Contacts</h3>
                <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.68rem', color: '#5A5D78' }}>{contacts.length}</span>
              </div>
              <div style={{ padding: '1.05rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {contacts.map((contact) => (
                  <div key={contact.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingBottom: '0.6rem', borderBottom: '1px solid #E9EBF5' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#376BE9' }}>{contact.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#5A5D78' }}>{contact.title}</div>
                    {contact.linkedin_url && (
                      <Link href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#376BE9', textDecoration: 'none' }}>
                        LinkedIn →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
