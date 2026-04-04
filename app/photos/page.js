'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { Ticker, SiteHeader, SiteFooter, DateBanner } from '../components'

export default function PhotosPage() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    async function fetchPhotos() {
      const { data } = await supabase.from('photos').select('*').eq('active', true).order('sort_order')
      setPhotos(data || [])
      setLoading(false)
    }
    fetchPhotos()
  }, [])

  const categories = ['All', ...new Set(photos.map(p => p.category).filter(Boolean))]
  const filtered = activeCategory === 'All' ? photos : photos.filter(p => p.category === activeCategory)

  return (
    <>
      <Ticker />
      <SiteHeader activePage="/photos" />
      <div className="page-wrapper">
        <DateBanner label="PHOTO GALLERY · Film & Digital" />
        <div className="photos-page">
          <div className="photos-header">
            <h1 className="writing-title">The Camera Roll</h1>
            <p className="writing-subtitle">Film photography, digital snapshots, and whatever catches my eye. No filters. No curation for likes. Just photos.</p>
          </div>

          {photos.length > 0 && categories.length > 1 && (
            <div className="category-filter" style={{marginBottom:'24px'}}>
              {categories.map(cat => (
                <button key={cat} className={`cat-btn ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
                  {cat}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="loading-state"><div className="loading-text">// loading photos...</div></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="widget" style={{maxWidth:'500px',margin:'0 auto'}}>
                <div className="widget-header">Gallery Coming Soon</div>
                <div className="widget-body" style={{textAlign:'center',padding:'32px 20px'}}>
                  <div style={{fontSize:'48px',marginBottom:'16px'}}>📷</div>
                  <div style={{fontFamily:'Playfair Display, serif',fontSize:'20px',fontStyle:'italic',color:'var(--dark-brown)',marginBottom:'12px'}}>Photos are on their way</div>
                  <div style={{fontSize:'13px',color:'var(--sage)',lineHeight:'1.7'}}>Currently shooting on a Pentax K1000. Check back soon.</div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="photos-grid">
                {filtered.map(photo => (
                  <div key={photo.id} className="photo-grid-item" onClick={() => setSelected(photo)} style={{cursor:'pointer'}}>
                    <img src={photo.url} alt={photo.caption || ''} style={{width:'100%',height:'100%',objectFit:'cover'}} />
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
      <SiteFooter />
    </>
  )
}

