'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { Ticker, SiteHeader, SiteFooter, DateBanner } from '../components'

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

  const tags = settings.tags ? settings.tags.split(',').map(t => t.trim()).filter(Boolean) : ['writer','hobbyist','culture','food','travel','corporate dystopia']

  return (
    <>
      <Ticker />
      <SiteHeader activePage="/about" />
      <div className="page-wrapper">
        <DateBanner label="ABOUT TYSON REID · The Long Version" />
        <div className="about-page">
          <div className="about-hero">
            <div className="about-photo-frame">
              {settings.avatar_url
                ? <img src={settings.avatar_url} alt="Tyson Reid" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                : <div style={{fontSize:'64px',display:'flex',alignItems:'center',justifyContent:'center',height:'100%'}}>🧑</div>
              }
            </div>
            <div className="about-intro">
              <div className="story-kicker">Who I Am</div>
              <h1 className="about-title">Tyson Reid</h1>
              <div className="about-tags" style={{justifyContent:'flex-start',marginBottom:'20px'}}>
                {tags.map(tag => <span className="tag" key={tag}>{tag}</span>)}
              </div>
              <div className="about-bio-long">{settings.bio || 'A 40-something polymath and serial hobbyist.'}</div>
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
                  { name: 'Travel', desc: "Places I've been, places I want to go, and what it means to be a stranger somewhere." },
                ].map(cat => (
                  <div className="about-category" key={cat.name}>
                    <div className="about-category-name">{cat.name}</div>
                    <div className="about-category-desc">{cat.desc}</div>
                  </div>
                ))}
              </div>
            </div>
            {manifesto.length > 0 && (
              <div className="about-section">
                <div className="section-head">
                  <div className="section-head-title">The Manifesto</div>
                  <div className="section-head-line double"></div>
                </div>
                <div className="about-manifesto">
                  {manifesto.map((item, i) => (
                    <div className="manifesto-item" key={item.id} style={{padding:'12px 0',fontSize:'15px'}}>
                      <div className="manifesto-num">0{i+1}</div>
                      <div className="manifesto-text">{item.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="about-section">
              <div className="section-head">
                <div className="section-head-title">This Site</div>
                <div className="section-head-line double"></div>
              </div>
              <div className="about-colophon">
                <p>This site is built with Next.js, hosted on Vercel, and powered by Supabase. No tracking pixels. No ads. No algorithm deciding what you see.</p>
                <p>The design is intentionally retro — a love letter to the personal web of the 90s, when websites had personality and the internet felt like a city of strangers&apos; apartments rather than a beige apartment complex owned by three companies.</p>
                <p>If you want to build your own corner of the internet, you should. The tools are better than ever. The need has never been greater.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </>
  )
}
