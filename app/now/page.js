'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { Ticker, SiteHeader, SiteFooter, DateBanner } from '../components'

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
    { icon: '📖', label: 'Reading', value: nowData.reading, url: nowData.reading_url },
    { icon: '🎵', label: 'Listening', value: nowData.listening, url: nowData.listening_url },
    { icon: '🎬', label: 'Watching', value: nowData.watching, url: nowData.watching_url },
    { icon: '🛠', label: 'Making', value: nowData.making, url: nowData.making_url },
    { icon: '🌍', label: 'Thinking About', value: nowData.thinking, url: nowData.thinking_url },
  ].filter(i => i.value) : []

  return (
    <>
      <Ticker />
      <SiteHeader activePage="/now" />
      <div className="page-wrapper">
        <DateBanner label="THE NOW PAGE · What's Actually Happening · Updated Regularly" />
        <div className="now-page">
          <div className="now-page-header">
            <h1 className="now-page-title">Now</h1>
            <p className="now-page-sub">
              This is a <a href="https://nownownow.com/about" target="_blank" rel="noopener noreferrer">/now page</a>.
              Last updated: {nowData?.updated_at ? new Date(nowData.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '...'}
            </p>
          </div>
          {loading ? (
            <div className="loading-state"><div className="loading-text">// loading...</div></div>
          ) : (
            <div className="now-page-grid">
              {nowItems.map(item => {
                const inner = (
                  <>
                    <div className="now-card-icon">{item.icon}</div>
                    <div className="now-card-label">{item.label}</div>
                    <div className="now-card-value">{item.value}</div>
                    {item.url && (
                      <div style={{marginTop:'8px', fontFamily:'VT323, monospace', fontSize:'13px', color:'var(--link-blue)', letterSpacing:'1px'}}>
                        Visit →
                      </div>
                    )}
                  </>
                )
                return item.url ? (
                  <a
                    key={item.label}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="now-card"
                    style={{textDecoration:'none'}}
                  >
                    {inner}
                  </a>
                ) : (
                  <div className="now-card" key={item.label}>{inner}</div>
                )
              })}
            </div>
          )}
          <div className="now-page-footer">
            <div className="now-page-note">
              <div className="story-kicker">A note on /now pages</div>
              <p>The /now page concept was created by <a href="https://sive.rs/now" target="_blank" rel="noopener noreferrer">Derek Sivers</a>. Instead of a static "about" page, tell people what you're actually doing <em>right now</em>.</p>
              <p>Presence is resistance. Curation is revolutionary.</p>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </>
  )
}
