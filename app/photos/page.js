'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function PhotosPage() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    async function fetchPhotos() {
      const { data } = await supabase.from('photos').select('*').eq('active', true).order('sort_order')
      setPhotos(data || [])
      setLoading(false)
    }
    fetchPhotos()
  }, [])

  return (
    <>
      <div className="ticker-bar">
        <div className="ticker-label">★ LIVE ★</div>
        <div className="ticker-track">
          <span>Photo gallery — film, digital, and everything in between</span>
          <span>Shooting on a Pentax K1000 and whatever else is nearby</span>
          <span>Photo gallery — film, digital, and everything in between</span>
          <span>Shooting on a Pentax K1000 and whatever else is nearby</span>
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
            <div>PHOTOS</div>
          </div>
        </div>
        <nav>
          <Link href="/">[ HOME ]</Link>
          <Link href="/writing">[ WRITING ]</Link>
          <Link href="/studio">[ STUDIO ]</Link>
          <Link href="/photos" className="active">[ PHOTOS ]</Link>
          <Link href="/about">[ ABOUT ]</Link>
          <Link href="/guestbook">[ GUESTBOOK ]</Link>
          <Link href="/now" className="nav-now">NOW PAGE</Link>
        </nav>
      </header>

      <div className="page-wrapper">
        <div className="date-banner">✦ PHOTO GALLERY · Film & Digital ✦</div>

        <div className="photos-page">
          <div className="photos-header">
            <h1 className="writing-title">The Camera Roll</h1>
            <p className="writing-subtitle">Film photography, digital snapshots, and whatever catches my eye. No filters. No curation for likes. Just photos.</p>
          </div>

          {loading ? (
            <div className="loading-state"><div className="loading-text">// loading photos...</div></div>
          ) : photos.length === 0 ? (
            <div className="empty-state">
              <div className="widget" style={{maxWidth:'500px', margin:'0 auto'}}>
                <div className="widget-header">Gallery Coming Soon</div>
                <div className="widget-body" style={{textAlign:'center', padding:'32px 20px'}}>
                  <div style={{fontSize:'48px', marginBottom:'16px'}}>📷</div>
                  <div style={{fontFamily:'Playfair Display, serif', fontSize:'20px', fontStyle:'italic', color:'var(--dark-brown)', marginBottom:'12px'}}>Photos are on their way</div>
                  <div style={{fontSize:'13px', color:'var(--sage)', lineHeight:'1.7'}}>Currently shooting on a Pentax K1000. The gallery will be live soon.</div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="photos-grid">
                {photos.map(photo => (
                  <div key={photo.id} className="photo-grid-item" onClick={() => setSelected(photo)} style={{cursor:'pointer'}}>
                    <img src={photo.url} alt={photo.caption || ''} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                    <div className="photo-grid-overlay">
                      <span>{photo.caption || '📷'}</span>
                    </div>
                  </div>
                ))}
              </div>

              {selected && (
                <div className="photo-lightbox" onClick={() => setSelected(null)}>
                  <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
                    <img src={selected.url} alt={selected.caption || ''} />
                    {selected.caption && <div className="lightbox-caption">{selected.caption}</div>}
                    <button onClick={() => setSelected(null)} className="lightbox-close">✕ Close</button>
                  </div>
                </div>
              )}
            </>
          )}
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
