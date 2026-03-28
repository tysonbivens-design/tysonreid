'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function GuestbookPage() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchEntries()
  }, [])

  async function fetchEntries() {
    const { data } = await supabase
      .from('guestbook')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false })
    if (data) setEntries(data)
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name || !message) return
    setSubmitting(true)
    const { error } = await supabase.from('guestbook').insert([{
      name,
      location: location || null,
      message
    }])
    setSubmitting(false)
    if (!error) {
      setSubmitted(true)
      setName('')
      setLocation('')
      setMessage('')
    }
  }

  return (
    <>
      <div className="ticker-bar">
        <div className="ticker-label">★ LIVE ★</div>
        <div className="ticker-track">
          <span>Sign the guestbook — say hello from your corner of the internet</span>
          <span>All entries are reviewed before appearing</span>
          <span>Sign the guestbook — say hello from your corner of the internet</span>
          <span>All entries are reviewed before appearing</span>
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
            <div>GUESTBOOK</div>
          </div>
        </div>
        <nav>
          <Link href="/">[ HOME ]</Link>
          <Link href="/writing">[ WRITING ]</Link>
          <Link href="/studio">[ STUDIO ]</Link>
          <Link href="/photos">[ PHOTOS ]</Link>
          <Link href="/about">[ ABOUT ]</Link>
          <Link href="/guestbook" className="active">[ GUESTBOOK ]</Link>
          <Link href="/now" className="nav-now">NOW PAGE</Link>
        </nav>
      </header>

      <div className="page-wrapper">
        <div className="date-banner">✦ GUESTBOOK · Sign In, Say Hello ✦</div>

        <div className="guestbook-page">
          <div className="guestbook-layout">

            <div className="guestbook-form-section">
              <div className="widget">
                <div className="widget-header">Sign the Guestbook</div>
                <div className="widget-body">
                  {submitted ? (
                    <div className="gb-success">
                      <div style={{fontSize:'32px', marginBottom:'12px'}}>✓</div>
                      <div style={{fontFamily:'Playfair Display, serif', fontSize:'20px', fontStyle:'italic', color:'var(--dark-brown)', marginBottom:'8px'}}>Thanks for signing!</div>
                      <div style={{fontSize:'13px', color:'var(--sage)'}}>Your entry will appear after review. Thanks for being here.</div>
                      <button onClick={() => setSubmitted(false)} className="gb-submit-btn" style={{marginTop:'16px'}}>Sign Again</button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="gb-form">
                      <div className="field-group">
                        <label>Your Name *</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="What should I call you?" required />
                      </div>
                      <div className="field-group">
                        <label>Where are you from?</label>
                        <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="City, internet, Mars..." />
                      </div>
                      <div className="field-group">
                        <label>Leave a message *</label>
                        <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Say hello, share a thought, tell me how you found this place..." rows={4} required />
                      </div>
                      <div style={{fontSize:'12px', color:'var(--sage)', marginTop:'4px'}}>
                        // entries are reviewed before appearing. be kind.
                      </div>
                      <button type="submit" className="gb-submit-btn" disabled={submitting}>
                        {submitting ? 'Sending...' : 'Sign the Guestbook →'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>

            <div className="guestbook-entries-section">
              <div className="section-head">
                <div className="section-head-title">Recent Entries</div>
                <div className="section-head-line double"></div>
              </div>

              {loading ? (
                <div className="loading-state"><div className="loading-text">// loading entries...</div></div>
              ) : entries.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-text">// no entries yet. be the first.</div>
                </div>
              ) : (
                <div className="gb-entries-list">
                  {entries.map(entry => (
                    <div key={entry.id} className="gb-entry-card">
                      <div className="gb-entry-message">&ldquo;{entry.message}&rdquo;</div>
                      <div className="gb-entry-sig">
                        — {entry.name}{entry.location ? `, ${entry.location}` : ''}
                        <span className="gb-entry-date">
                          {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
