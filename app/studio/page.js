'use client'

import Link from 'next/link'

const VIDEOS = [
  {
    id: 'placeholder1',
    title: 'I Tried Developing Film for 30 Days',
    description: 'A month-long experiment with analog photography, a secondhand Pentax K1000, and the patience it takes to not see your photos immediately.',
    date: 'Jan 20, 2025',
    youtubeId: '', // paste YouTube video ID here
  },
  {
    id: 'placeholder2',
    title: 'My Sourdough Journey (Month 3)',
    description: 'Everything I learned in 90 days of keeping a starter alive and baking bread that actually tastes like something.',
    date: 'Dec 15, 2024',
    youtubeId: '',
  },
]

export default function StudioPage() {
  return (
    <>
      <div className="ticker-bar">
        <div className="ticker-label">★ LIVE ★</div>
        <div className="ticker-track">
          <span>The Studio — videos, photos, and creative work</span>
          <span>Amateur YouTuber. Serial hobbyist. Making things for the love of it.</span>
          <span>The Studio — videos, photos, and creative work</span>
          <span>Amateur YouTuber. Serial hobbyist. Making things for the love of it.</span>
        </div>
      </div>

      <header>
        <div className="header-top">
          <div className="header-meta-left">
            <div>EST. 2025</div>
            <div>INDEPENDENT SINCE DAY ONE</div>
            <div>NO ALGORITHMS · NO ADS</div>
          </div>
          <div className="site-title-block">
            <div className="site-eyebrow">Welcome to</div>
            <div className="site-name">Tyson Reid</div>
            <div className="site-tagline">Presence is resistance. Curation is revolutionary.</div>
          </div>
          <div className="header-meta-right">
            <div>EST. 2025</div>
            <div>THE STUDIO</div>
          </div>
        </div>
        <nav>
          <Link href="/">[ HOME ]</Link>
          <Link href="/writing">[ WRITING ]</Link>
          <Link href="/studio" className="active">[ STUDIO ]</Link>
          <Link href="/photos">[ PHOTOS ]</Link>
          <Link href="/about">[ ABOUT ]</Link>
          <Link href="/guestbook">[ GUESTBOOK ]</Link>
          <Link href="/now" className="nav-now">NOW PAGE</Link>
        </nav>
      </header>

      <div className="page-wrapper">
        <div className="date-banner">✦ THE STUDIO · Videos, Projects & Creative Work ✦</div>

        <div className="studio-page">
          <div className="studio-header">
            <h1 className="writing-title">The Studio</h1>
            <p className="writing-subtitle">An amateur YouTuber and serial hobbyist, making things for the love of it. No sponsorships. No algorithm chasing. Just projects.</p>
          </div>

          <div className="section-head">
            <div className="section-head-title">Recent Videos</div>
            <div className="section-head-line double"></div>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="section-all">YouTube Channel →</a>
          </div>

          <div className="studio-grid">
            {VIDEOS.map(video => (
              <div key={video.id} className="studio-card">
                {video.youtubeId ? (
                  <div className="video-embed">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${video.youtubeId}`}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="video-placeholder">
                    <div className="video-placeholder-icon">▶</div>
                    <div className="video-placeholder-text">// video coming soon</div>
                  </div>
                )}
                <div className="studio-card-body">
                  <div className="studio-card-date">{video.date}</div>
                  <div className="studio-card-title">{video.title}</div>
                  <div className="studio-card-desc">{video.description}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="section-head" style={{marginTop:'48px'}}>
            <div className="section-head-title">Current Projects</div>
            <div className="section-head-line double"></div>
          </div>

          <div className="projects-grid">
            {[
              { icon: '📷', name: 'Analog Photography', status: 'Active', desc: 'Shooting on a Pentax K1000. Developing at home. Learning to slow down.' },
              { icon: '🍞', name: 'Sourdough', status: 'Active', desc: 'Month 3 of keeping a starter alive. The bread is getting better.' },
              { icon: '🎬', name: 'YouTube Channel', status: 'Active', desc: 'Amateur videos about hobbies, culture, and the slow life.' },
              { icon: '✍️', name: 'This Website', status: 'Always Building', desc: 'An ongoing experiment in owning your corner of the internet.' },
            ].map(project => (
              <div key={project.name} className="project-card">
                <div className="project-icon">{project.icon}</div>
                <div className="project-status">{project.status}</div>
                <div className="project-name">{project.name}</div>
                <div className="project-desc">{project.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer>
        <div className="footer-bottom" style={{maxWidth:'1200px', margin:'0 auto'}}>
          <div className="made-with">Made with <span className="pixel-heart">♥</span> and intentionality</div>
          <Link href="/" style={{color:'var(--muted-gold)', fontFamily:'VT323, monospace', fontSize:'16px', textDecoration:'none'}}>← Back to Home</Link>
          <div>© 2025 Tyson Reid</div>
        </div>
      </footer>
    </>
  )
}
