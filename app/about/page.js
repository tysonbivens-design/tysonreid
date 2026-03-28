'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function AboutPage() {
  const [settings, setSettings] = useState({})
  const [manifesto, setManifesto] = useState([])

  useEffect(() => {
    async function fetchData() {
      const [{ data: settingsData }, { data: manifestoData }] = await Promise.all([
        supabase.from('site_settings').select('*'),
        supabase.from('manifesto_items').select('*').order('sort_order')
      ])
      if (settingsData) {
        const s = {}
        settingsData.forEach(row => { s[row.key] = row.value })
        setSettings(s)
      }
      if (manifestoData) setManifesto(manifestoData)
    }
    fetchData()
  }, [])

  return (
    <>
      <div className="ticker-bar">
        <div className="ticker-label">★ LIVE ★</div>
        <div className="ticker-track">
          <span>A 40-something polymath navigating corporate dystopia with humor and hope</span>
          <span>Presence is resistance. Curation is revolutionary.</span>
          <span>A 40-something polymath navigating corporate dystopia with humor and hope</span>
          <span>Presence is resistance. Curation is revolutionary.</span>
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
            <div>ABOUT</div>
          </div>
        </div>
        <nav>
          <Link href="/">[ HOME ]</Link>
          <Link href="/writing">[ WRITING ]</Link>
          <Link href="/studio">[ STUDIO ]</Link>
          <Link href="/photos">[ PHOTOS ]</Link>
          <Link href="/about" className="active">[ ABOUT ]</Link>
          <Link href="/guestbook">[ GUESTBOOK ]</Link>
          <Link href="/now" className="nav-now">NOW PAGE</Link>
        </nav>
      </header>

      <div className="page-wrapper">
        <div className="date-banner">✦ ABOUT TYSON REID · The Long Version ✦</div>

        <div className="about-page">
          <div className="about-hero">
            <div className="about-photo-frame">
              <div className="about-photo-placeholder">🧑</div>
            </div>
            <div className="about-intro">
              <div className="story-kicker">Who I Am</div>
              <h1 className="about-title">Tyson Reid</h1>
              <div className="about-tags" style={{justifyContent:'flex-start', marginBottom:'20px'}}>
                {['writer','hobbyist','culture','food','travel','corporate dystopia'].map(tag => (
                  <span className="tag" key={tag}>{tag}</span>
                ))}
              </div>
              <div className="about-bio-long">
                {settings.bio || 'A 40-something polymath and serial hobbyist, kindred spirit to Tony Bourdain trapped in corporate drudgery.'}
              </div>
            </div>
          </div>

          <div className="about-sections">
            <div className="about-section">
              <div className="section-head">
                <div className="section-head-title">What I Write About</div>
                <div className="section-head-line double"></div>
              </div>
              <div className="about-categories">
                {[
                  { name: 'Corporate Dystopia', desc: 'The absurdity of modern work life, examined with dark humor and just enough hope to keep going.' },
                  { name: 'Culture', desc: 'Film, music, books, and the things that make life worth living despite everything.' },
                  { name: 'Politics', desc: 'Honest takes on the state of things, without the outrage-bait.' },
                  { name: 'Food', desc: 'Recipes, restaurant notes, and meditations on why feeding people is an act of love.' },
                  { name: 'Travel', desc: 'Places I\'ve been, places I want to go, and what it means to be a stranger somewhere.' },
                ].map(cat => (
                  <div className="about-category" key={cat.name}>
                    <div className="about-category-name">{cat.name}</div>
                    <div className="about-category-desc">{cat.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="about-section">
              <div className="section-head">
                <div className="section-head-title">The Manifesto</div>
                <div className="section-head-line double"></div>
              </div>
              <div className="about-manifesto">
                {manifesto.map((item, i) => (
                  <div className="manifesto-item" key={item.id} style={{padding:'12px 0', fontSize:'15px'}}>
                    <div className="manifesto-num">0{i + 1}</div>
                    <div className="manifesto-text">{item.content}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="about-section">
              <div className="section-head">
                <div className="section-head-title">This Site</div>
                <div className="section-head-line double"></div>
              </div>
              <div className="about-colophon">
                <p>This site is built with Next.js, hosted on Vercel, and powered by Supabase. No tracking pixels. No ads. No algorithm deciding what you see. Just a human writing things and putting them on the internet the old way.</p>
                <p>The design is intentionally retro — a love letter to the personal web of the 90s and early 2000s, when websites had personality and the internet felt like a city of strangers&apos; apartments rather than a beige apartment complex owned by three companies.</p>
                <p>If you want to build your own corner of the internet, you should. The tools are better than ever. The need has never been greater.</p>
              </div>
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
