'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'

interface Milestone {
  id: string
  phase: string
  description: string
  target_date?: string
  status?: string
}

interface Update {
  id: string
  title: string
  description?: string
  event_type: string
  created_at: string
  source_url?: string
  is_significant: boolean
}

interface Company {
  id: string
  name: string
  location?: string
  role?: string
}

interface Contact {
  id: string
  name: string
  title: string
  email: string
  phone: string
  linkedin_url: string
}

interface Project {
  id: string
  name: string
  type?: string
  description?: string
  location?: string
  state?: string
  stage?: string
  status?: string
  capacity_mw?: number
  capacity_unit?: string
  first_seen_date?: string
  milestone_date?: string
  milestone_description?: string
  created_at?: string
  updated_at?: string
  owner?: string | string[]
  developer?: string | string[]
  developer_info?: string
  epc?: string | string[]
  oem?: string | string[]
  epc_award?: boolean | string
  oem_award?: boolean | string
  key_personnel?: string | string[]
  updates?: Update[]
  milestones?: Milestone[]
  companies?: Company[]
}

export default function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [project, setProject] = useState<Project | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'updates' | 'milestones'>('updates')

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/projects/${id}`)
        const data = await res.json()
        if (data.success && data.data) {
          setProject(data.data)

          // Fetch contacts for this project
          const contactsRes = await fetch(`/api/projects/${id}/contacts`)
          const contactsData = await contactsRes.json()
          if (contactsData.success && contactsData.data) {
            setContacts(contactsData.data)
          }
        }
      } catch (error) {
        console.error('Failed to fetch project:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id])

  if (loading || !project) {
    return (
      <main style={{ maxWidth: '96rem', margin: '0 auto', padding: '1.4rem clamp(1rem, 3vw, 2rem) 5rem', display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
        <div style={{ fontSize: '1.2rem', color: '#5A5D78' }}>Loading project details...</div>
      </main>
    )
  }

  const updates = project.updates || []
  const milestones = project.milestones || []
  const companies = project.companies || []

  return (
    <main style={{ maxWidth: '96rem', margin: '0 auto', padding: '1.4rem clamp(1rem, 3vw, 2rem) 5rem', display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#5A5D78' }}>
        <Link href="/projects" style={{ color: '#376BE9', textDecoration: 'none' }}>Projects</Link>
        <span>/</span>
        <span>{project.name}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0.4rem 1.5rem' }}>
        <div style={{ flex: '1 1 auto', minWidth: '15rem' }}>
          <h1 style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 900, fontSize: 'clamp(1.6rem, 4vw, 2.1rem)', letterSpacing: '-.03em', lineHeight: 1, margin: 0, marginBottom: '0.35rem' }}>
            {project.name}
          </h1>
          <p style={{ fontFamily: 'Source Sans 3,sans-serif', fontSize: '0.95rem', color: '#5A5D78', margin: 0 }}>
            {project.type ? `${project.type} · ` : ''}{project.location || ''}
          </p>
        </div>
        <div style={{ fontSize: '0.8rem', textAlign: 'right', color: '#5A5D78' }}>
          <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.7rem', marginBottom: '0.3rem' }}>First seen</div>
          <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.9rem', color: '#1C0140', fontWeight: 600 }}>
            {project.first_seen_date ? new Date(project.first_seen_date).toLocaleDateString() : '—'}
          </div>
        </div>
      </div>

      {/* Stats Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: '1rem' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '0.85rem 1rem 0.95rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
          <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78', marginBottom: '0.4rem' }}>
            Capacity
          </div>
          <div style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1.65rem', lineHeight: 1, color: '#376BE9', marginBottom: '0.15rem' }}>
            {project.capacity_mw ? `${project.capacity_mw.toLocaleString()}` : '—'}
          </div>
          <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.65rem', color: '#5A5D78' }}>
            {project.capacity_unit || 'MW'}
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '0.85rem 1rem 0.95rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
          <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78', marginBottom: '0.4rem' }}>
            Status
          </div>
          <div style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1.65rem', lineHeight: 1, color: '#376BE9', marginBottom: '0.15rem' }}>
            {project.stage || '—'}
          </div>
          <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.65rem', color: '#5A5D78' }}>
            {project.status || 'Unknown'}
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '0.85rem 1rem 0.95rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
          <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78', marginBottom: '0.4rem' }}>
            Updates
          </div>
          <div style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1.65rem', lineHeight: 1, color: '#376BE9', marginBottom: '0.15rem' }}>
            {updates.length}
          </div>
          <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.65rem', color: '#5A5D78' }}>
            mentions
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '0.85rem 1rem 0.95rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
          <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78', marginBottom: '0.4rem' }}>
            Next Milestone
          </div>
          <div style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1.65rem', lineHeight: 1, color: '#376BE9', marginBottom: '0.15rem' }}>
            {project.milestone_date ? new Date(project.milestone_date).toLocaleDateString() : '—'}
          </div>
          <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.65rem', color: '#5A5D78' }}>
            {project.milestone_description || 'No milestone'}
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Left: Updates & Milestones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Toggle Buttons */}
          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-start' }}>
            {['updates', 'milestones'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as 'updates' | 'milestones')}
                style={{
                  fontFamily: 'Source Sans 3,sans-serif',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  background: activeTab === tab ? '#376BE9' : '#E9EBF5',
                  color: activeTab === tab ? '#FFFFFF' : '#1C0140',
                  border: '1px solid transparent',
                  borderRadius: '3px',
                  padding: '0.4rem 0.8rem',
                }}
              >
                {tab === 'updates' ? 'View Updates' : 'View Milestones'}
              </button>
            ))}
          </div>

          {/* Updates Section */}
          {activeTab === 'updates' && (
            <section style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '1.2rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '1px solid #E9EBF5' }}>
                <h2 style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#1C0140', margin: 0 }}>Updates</h2>
                <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.75rem', color: '#5A5D78' }}>{updates.length} events</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {updates.length > 0 ? (
                  updates.map((update) => (
                    <div key={update.id} style={{ paddingBottom: '1.2rem', borderBottom: '1px solid #E9EBF5' }}>
                      <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.75rem', color: '#5A5D78', marginBottom: '0.3rem' }}>
                        {new Date(update.created_at).toLocaleDateString()}
                      </div>
                      <div style={{ display: 'inline-block', fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', background: update.is_significant ? '#376BE9' : '#E4EBFC', color: update.is_significant ? '#FFFFFF' : '#376BE9', padding: '0.25rem 0.6rem', borderRadius: '2px', marginBottom: '0.4rem' }}>
                        {update.event_type}
                      </div>
                      <div style={{ fontFamily: 'Source Sans 3,sans-serif', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.3rem' }}>
                        {update.source_url ? (
                          <a href={update.source_url} target="_blank" rel="noopener noreferrer" style={{ color: '#376BE9', textDecoration: 'none', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
                            {update.title}
                          </a>
                        ) : (
                          <span style={{ color: '#376BE9' }}>{update.title}</span>
                        )}
                      </div>
                      {update.description && (
                        <div style={{ fontSize: '0.8rem', color: '#5A5D78', marginBottom: '0.3rem' }}>
                          {update.description}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '0.9rem', color: '#5A5D78' }}>No updates yet</div>
                )}
              </div>
            </section>
          )}

          {/* Milestones Section */}
          {activeTab === 'milestones' && (
            <section style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '1.2rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '1px solid #E9EBF5' }}>
                <h2 style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#1C0140', margin: 0 }}>Milestones</h2>
                <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.75rem', color: '#5A5D78' }}>{milestones.length} phases</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {milestones.length > 0 ? (
                  milestones.map((milestone) => (
                    <div key={milestone.id} style={{ paddingBottom: '1.2rem', borderBottom: '1px solid #E9EBF5' }}>
                      <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.75rem', color: '#5A5D78', marginBottom: '0.3rem' }}>
                        {milestone.target_date ? new Date(milestone.target_date).toLocaleDateString() : 'TBD'}
                      </div>
                      <div style={{ display: 'inline-block', fontFamily: '"IBM Plex Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', background: '#376BE9', color: '#FFFFFF', padding: '0.25rem 0.6rem', borderRadius: '2px', marginBottom: '0.4rem' }}>
                        {milestone.status || 'Planned'}
                      </div>
                      <div style={{ fontFamily: 'Source Sans 3,sans-serif', fontWeight: 600, fontSize: '0.95rem', color: '#1C0140', marginBottom: '0.3rem' }}>
                        {milestone.phase}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#5A5D78' }}>
                        {milestone.description}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '0.9rem', color: '#5A5D78' }}>No milestones yet</div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Right: Companies & Awards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Awards Section */}
          {(project.epc_award || project.oem_award) && (
            <section style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '1rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
              <h3 style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#1C0140', margin: '0 0 0.8rem 0', paddingBottom: '0.6rem', borderBottom: '1px solid #E9EBF5' }}>
                Awards
              </h3>
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                {project.epc_award && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#E4EBFC', color: '#376BE9', padding: '0.5rem 0.8rem', borderRadius: '3px', fontSize: '0.85rem', fontWeight: 600 }}>
                    <span>🏆</span> EPC Award
                  </div>
                )}
                {project.oem_award && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#FCE4E4', color: '#C24040', padding: '0.5rem 0.8rem', borderRadius: '3px', fontSize: '0.85rem', fontWeight: 600 }}>
                    <span>🏆</span> OEM Award
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Companies Involved */}
          <section style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '1rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
            <h3 style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#1C0140', margin: '0 0 0.8rem 0', paddingBottom: '0.6rem', borderBottom: '1px solid #E9EBF5' }}>
              Companies Involved
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {companies.length > 0 ? (
                companies.map((company) => (
                  <Link key={company.id} href={`/companies/${company.id}`} style={{ display: 'flex', flexDirection: 'column', padding: '0.6rem', borderRadius: '3px', background: '#F9FAFB', textDecoration: 'none', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#F0F4FF'} onMouseLeave={(e) => e.currentTarget.style.background = '#F9FAFB'}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#376BE9' }}>{company.name}</div>
                    {company.role && (
                      <div style={{ fontSize: '0.75rem', color: '#5A5D78', marginTop: '0.1rem' }}>
                        {company.role}
                      </div>
                    )}
                  </Link>
                ))
              ) : (
                <div style={{ fontSize: '0.9rem', color: '#5A5D78' }}>No companies assigned</div>
              )}
            </div>
          </section>

          {/* Contacts */}
          {contacts.length > 0 && (
            <section style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '1rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
              <h3 style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#1C0140', margin: '0 0 0.8rem 0', paddingBottom: '0.6rem', borderBottom: '1px solid #E9EBF5' }}>
                Contacts
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {contacts.map((contact) => (
                  <div key={contact.id} style={{ padding: '0.8rem', background: '#F9FAFB', borderRadius: '3px', borderLeft: '3px solid #376BE9' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1C0140' }}>{contact.name}</div>
                    {contact.title && (
                      <div style={{ fontSize: '0.85rem', color: '#5A5D78', marginTop: '0.2rem' }}>
                        {contact.title}
                      </div>
                    )}
                    <div style={{ fontSize: '0.85rem', color: '#5A5D78', marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
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
                            💼 LinkedIn Profile
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Developer */}
          {project.developer && (
            <section style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '1rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
              <h3 style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#1C0140', margin: '0 0 0.8rem 0', paddingBottom: '0.6rem', borderBottom: '1px solid #E9EBF5' }}>
                Developer
              </h3>
              <div style={{ fontSize: '0.9rem', color: '#5A5D78' }}>
                {Array.isArray(project.developer) ? project.developer.join(', ') : project.developer}
              </div>
              {project.developer_info && (
                <div style={{ fontSize: '0.85rem', color: '#5A5D78', marginTop: '0.6rem' }}>
                  {project.developer_info}
                </div>
              )}
            </section>
          )}

          {/* Project Description */}
          {project.description && (
            <section style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '1rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
              <h3 style={{ fontFamily: 'Chivo,sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#1C0140', margin: '0 0 0.8rem 0', paddingBottom: '0.6rem', borderBottom: '1px solid #E9EBF5' }}>
                Description
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#5A5D78', margin: 0, lineHeight: 1.5 }}>
                {project.description}
              </p>
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
