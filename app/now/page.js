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
    { icon: '📖', label: 'Reading', value: nowData.reading },
    { icon: '🎵', label: 'Listening', value: nowData.listening },
    { icon: '🎬', label: 'Watching', value: nowData.watching },
    { icon: '🛠', label: 'Making', value: nowData.making },
    { icon: '🌍', label: 'Thinking About', value: nowData.thinking },
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
