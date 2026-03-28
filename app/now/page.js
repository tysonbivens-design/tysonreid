'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function NowPage() {
  const [nowData, setNowData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNow() {
      const { data } = await supabase.from('now_page').select('*').single()
      if (data) setNowData(data)
      setLoading(false)
    }
    fetchNow()
  }, [])

  const nowItems = nowData ? [
    { icon: '📖', label: 'Reading', value: nowData.reading },
    { icon: '🎵', label: 'Listening', value: nowData.listening },
    { icon: '🎬', label: 'Watching', value: nowData.watching },
    { icon: '🛠', label: 'Making', value: nowData.making },
    { icon: '🌍', label: 'Thinking About', value: nowData.thinking },
  ].filter(i => i.value) : []

  return (
    <>
      <div className="ticker-bar">
        <div className="ticker-label">★ LIVE ★</div>
        <div className="ticker-track">
          <span>This is a /now page — inspired by Derek Sivers</span>
          <span>Updated whenever something changes</span>
          <span>No algorithm. No feed. Just what&apos;s actually happening.</span>
          <span>This is a /now page — inspired by Derek Sivers</span>
          <span>Updated whenever something changes</span>
          <span>No algorithm. No feed. Just what&apos;s actually happening.</span>
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
            <div>THE NOW PAGE</div>
          </div>
        </div>
        <nav>
          <Link href="/">[ HOME ]</Link>
          <Link href="/writing">[ WRITING ]</Link>
          <Link href="/studio">[ STUDIO ]</Link>
          <Link href="/photos">[ PHOTOS ]</Link>
          <Link href="/about">[ ABOUT ]</Link>
          <Link href="/guestbook">[ GUESTBOOK ]</Link>
          <Link href="/now" className="nav-now">NOW PAGE</Link>
        </nav>
      </header>

      <div className="page-wrapper">
        <div className="date-banner">
          ✦ THE NOW PAGE · What&apos;s Actually Happening · Updated Regularly ✦
        </div>

        <div className="now-page">
          <div className="now-page-header">
            <h1 className="now-page-title">Now</h1>
            <p className="now-page-sub">
              This is a <a href="https://nownownow.com/about" target="_blank" rel="noopener noreferrer">/now page</a>. 
              It tells you what I&apos;m focused on at this point in my life. 
              Last updated: {nowData?.updated_at ? new Date(nowData.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '...'}
            </p>
          </div>

          {loading ? (
            <div className="loading-state"><div className="loading-text">// loading...</div></div>
          ) : (
            <div className="now-page-grid">
              {nowItems.map(item => (
                <div className="now-card" key={item.label}>
                  <div className="now-card-icon">{item.icon}</div>
                  <div className="now-card-label">{item.label}</div>
                  <div className="now-card-value">{item.value}</div>
                </div>
              ))}
            </div>
          )}

          <div className="now-page-footer">
            <div className="now-page-note">
              <div className="story-kicker">A note on /now pages</div>
              <p>
                The /now page concept was created by <a href="https://sive.rs/now" target="_blank" rel="noopener noreferrer">Derek Sivers</a>. 
                It&apos;s a simple idea: instead of a static &ldquo;about&rdquo; page, tell people what you&apos;re actually doing <em>right now</em>. 
                No performance. No curation for the algorithm. Just honest presence.
              </p>
              <p>
                Presence is resistance. Curation is revolutionary.
              </p>
            </div>
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
