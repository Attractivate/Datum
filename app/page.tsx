'use client'

export default function Home() {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 flex flex-col gap-6">

      {/* Page Head with Runstamp */}
      <div className="flex flex-wrap items-end gap-2 lg:gap-6">
        <h1 style={{ fontFamily: 'Chivo, ui-sans-serif, system-ui, sans-serif', fontWeight: 900, fontSize: 'clamp(1.6rem, 4vw, 2.1rem)', letterSpacing: '-0.03em', lineHeight: 1, margin: 0, marginRight: 'auto' }}>
          What Changed
        </h1>
        <div style={{ fontFamily: '"IBM Plex Mono", ui-monospace, monospace', fontSize: '0.7rem', letterSpacing: '0.06em', color: '#5A5D78', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#376BE9', boxShadow: '0 0 0 3px #E4EBFC', display: 'inline-block' }}></span>
          Last run {dateStr}, {timeStr} · 8 pipelines
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" style={{ gap: '0.7rem' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '0.85rem 1rem 0.95rem', display: 'flex', flexDirection: 'column', gap: '0.1rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
          <div style={{ fontFamily: '"IBM Plex Mono", ui-monospace, monospace', fontSize: '0.62rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78' }}>Active Projects</div>
          <div style={{ fontFamily: 'Chivo, sans-serif', fontWeight: 700, fontSize: '1.85rem', lineHeight: 1.1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>4,081</div>
          <div style={{ fontSize: '0.8rem', color: '#5A5D78', lineHeight: 1.35 }}>Across six industries</div>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '0.85rem 1rem 0.95rem', display: 'flex', flexDirection: 'column', gap: '0.1rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
          <div style={{ fontFamily: '"IBM Plex Mono", ui-monospace, monospace', fontSize: '0.62rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78' }}>Events This Week</div>
          <div style={{ fontFamily: 'Chivo, sans-serif', fontWeight: 700, fontSize: '1.85rem', lineHeight: 1.1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>153</div>
          <div style={{ fontSize: '0.8rem', color: '#5A5D78', lineHeight: 1.35 }}>New activity on tracked projects</div>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '0.85rem 1rem 0.95rem', display: 'flex', flexDirection: 'column', gap: '0.1rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
          <div style={{ fontFamily: '"IBM Plex Mono", ui-monospace, monospace', fontSize: '0.62rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78' }}>Significant</div>
          <div style={{ fontFamily: 'Chivo, sans-serif', fontWeight: 700, fontSize: '1.85rem', lineHeight: 1.1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>5</div>
          <div style={{ fontSize: '0.8rem', color: '#5A5D78', lineHeight: 1.35 }}>Awards, stage changes, filings — deduplicated</div>
        </div>
        <div style={{ background: '#FAF2DC', border: '1px solid #D8AE4C', borderRadius: '4px', padding: '0.85rem 1rem 0.95rem', display: 'flex', flexDirection: 'column', gap: '0.1rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
          <div style={{ fontFamily: '"IBM Plex Mono", ui-monospace, monospace', fontSize: '0.62rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#8A6A12' }}>Past Due</div>
          <div style={{ fontFamily: 'Chivo, sans-serif', fontWeight: 700, fontSize: '1.85rem', lineHeight: 1.1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', color: '#8A6A12' }}>134</div>
          <div style={{ fontSize: '0.8rem', color: '#8A6A12', lineHeight: 1.35, opacity: 0.85 }}>Milestone date passed, no update since</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '0.8rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.7rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontFamily: '"IBM Plex Mono", ui-monospace, monospace', fontSize: '0.62rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78', width: '5.2rem', flexShrink: 0 }}>Industry</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            <button style={{ fontFamily: 'inherit', fontSize: '0.82rem', cursor: 'pointer', background: '#376BE9', color: '#FFFFFF', border: '1px solid transparent', borderRadius: '999px', padding: '0.28rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              All <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.68rem', color: 'rgba(255,255,255,.75)', fontVariantNumeric: 'tabular-nums' }}>4,081</span>
            </button>
            <button style={{ fontFamily: 'inherit', fontSize: '0.82rem', cursor: 'pointer', background: '#E9EBF5', color: '#1C0140', border: '1px solid transparent', borderRadius: '999px', padding: '0.28rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', transition: 'all 200ms' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#376BE9'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}>
              Power Generation <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.68rem', color: '#5A5D78', fontVariantNumeric: 'tabular-nums' }}>3,843</span>
            </button>
            <button style={{ fontFamily: 'inherit', fontSize: '0.82rem', cursor: 'pointer', background: '#E9EBF5', color: '#1C0140', border: '1px solid transparent', borderRadius: '999px', padding: '0.28rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', transition: 'all 200ms' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#376BE9'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}>
              Oil &amp; Gas <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.68rem', color: '#5A5D78', fontVariantNumeric: 'tabular-nums' }}>83</span>
            </button>
            <button style={{ fontFamily: 'inherit', fontSize: '0.82rem', cursor: 'pointer', background: '#E9EBF5', color: '#1C0140', border: '1px solid transparent', borderRadius: '999px', padding: '0.28rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', transition: 'all 200ms' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#376BE9'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}>
              Hi Tech <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.68rem', color: '#5A5D78', fontVariantNumeric: 'tabular-nums' }}>51</span>
            </button>
            <button style={{ fontFamily: 'inherit', fontSize: '0.82rem', cursor: 'pointer', background: '#E9EBF5', color: '#1C0140', border: '1px solid transparent', borderRadius: '999px', padding: '0.28rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', transition: 'all 200ms' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#376BE9'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}>
              Power Delivery <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.68rem', color: '#5A5D78', fontVariantNumeric: 'tabular-nums' }}>35</span>
            </button>
            <button style={{ fontFamily: 'inherit', fontSize: '0.82rem', cursor: 'pointer', background: '#E9EBF5', color: '#1C0140', border: '1px solid transparent', borderRadius: '999px', padding: '0.28rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', transition: 'all 200ms' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#376BE9'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}>
              Water <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.68rem', color: '#5A5D78', fontVariantNumeric: 'tabular-nums' }}>28</span>
            </button>
            <button style={{ fontFamily: 'inherit', fontSize: '0.82rem', cursor: 'pointer', background: '#E9EBF5', color: '#1C0140', border: '1px solid transparent', borderRadius: '999px', padding: '0.28rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', transition: 'all 200ms' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#376BE9'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}>
              Life Sciences <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.68rem', color: '#5A5D78', fontVariantNumeric: 'tabular-nums' }}>26</span>
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontFamily: '"IBM Plex Mono", ui-monospace, monospace', fontSize: '0.62rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5A5D78', width: '5.2rem', flexShrink: 0 }}>Activity</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            <button style={{ fontFamily: 'inherit', fontSize: '0.82rem', cursor: 'pointer', background: '#376BE9', color: '#FFFFFF', border: '1px solid transparent', borderRadius: '999px', padding: '0.28rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              All activity <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.68rem', color: 'rgba(255,255,255,.75)', fontVariantNumeric: 'tabular-nums' }}>153</span>
            </button>
            <button style={{ fontFamily: 'inherit', fontSize: '0.82rem', cursor: 'pointer', background: '#E9EBF5', color: '#1C0140', border: '1px solid transparent', borderRadius: '999px', padding: '0.28rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', transition: 'all 200ms' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#376BE9'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}>
              Significant only <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.68rem', color: '#5A5D78', fontVariantNumeric: 'tabular-nums' }}>5</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feed + Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ gap: '1.5rem', alignItems: 'start' }}>

        {/* Feed */}
        <div className="lg:col-span-2 flex flex-col gap-4" style={{ gap: '1.1rem' }}>
          <section>
            <div style={{ fontFamily: '"IBM Plex Mono", ui-monospace, monospace', fontSize: '0.66rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5A5D78', paddingBottom: '0.35rem', borderBottom: '1px solid #D6D9E8', display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.4rem' }}>
              <span>Wednesday 19 August</span>
              <span>7 events</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <article style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderRadius: '4px', padding: '0.8rem 0.95rem', display: 'grid', gap: '0.3rem 0.9rem', gridTemplateColumns: '1fr', boxShadow: '0 1px 2px rgba(28,1,64,.06)', borderLeft: '3px solid transparent', transition: 'all 200ms' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#376BE9'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', padding: '0.18rem 0.45rem', borderRadius: '2px', background: '#E9EBF5', color: '#5A5D78', whiteSpace: 'nowrap' }}>News Mention</span>
                  <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.66rem', color: '#5A5D78', marginLeft: 'auto', whiteSpace: 'nowrap' }}>News pipeline</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.97rem', lineHeight: 1.35 }}>Google reveals it is behind 506-acre Project Clydesdale data center in Oklahoma</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem 0.7rem', fontSize: '0.82rem', color: '#5A5D78' }}>
                  <span style={{ color: '#376BE9', fontWeight: 600 }}>Project Clydesdale</span>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span>Google</span>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span>Tulsa County, Oklahoma</span>
                </div>
              </article>
            </div>
          </section>
        </div>

        {/* Attention Panel */}
        <div style={{ background: '#FFFFFF', border: '1px solid #D6D9E8', borderTop: '3px solid #8A6A12', borderRadius: '4px', padding: '1rem 1.1rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.7rem', boxShadow: '0 1px 2px rgba(28,1,64,.06)' }}>
          <h2 style={{ fontFamily: 'Chivo, sans-serif', fontWeight: 700, fontSize: '1.02rem', margin: 0, display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
            Needs attention <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.72rem', color: '#8A6A12', fontVariantNumeric: 'tabular-nums' }}>134</span>
          </h2>
          <p style={{ margin: 0, fontSize: '0.87rem', color: '#5A5D78' }}>Projected milestone date has passed with no update since. The oldest have been quiet for years.</p>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { name: 'Montezuma II', where: 'Solano County, CA', when: '13 yr overdue' },
              { name: 'Frostburg 138 kV', where: 'Allegany County, MD', when: '4 yr overdue' },
              { name: 'Fresno Cogeneration Expansion', where: 'Fresno County, CA', when: '3 yr overdue' },
              { name: 'Daggett Solar 3', where: 'San Bernardino County, CA', when: '3 yr overdue' },
              { name: 'Los Esteros Critical Energy', where: 'Santa Clara County, CA', when: '2 yr overdue' },
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0.3rem 0.8rem', padding: '0.5rem 0', borderBottom: idx < 4 ? '1px solid #D6D9E8' : 'none', fontSize: '0.87rem' }}>
                <span style={{ fontWeight: 600, color: '#376BE9' }}>{item.name}</span>
                <span style={{ color: '#5A5D78' }}>{item.where}</span>
                <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.72rem', color: '#8A6A12', marginLeft: 'auto', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{item.when}</span>
              </div>
            ))}
          </div>
          <a href="#" style={{ fontSize: '0.84rem', color: '#376BE9', fontWeight: 600, textDecoration: 'none', alignSelf: 'flex-start' }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>Review all 134 →</a>
        </div>
      </div>
    </main>
  );
}