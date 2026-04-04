'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { Ticker, SiteHeader, SiteFooter, DateBanner } from '../components'

export default function StudioPage() {
  const [videos, setVideos] = useState([])
  const [projects, setProjects] = useState([])
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [{ data: videosData }, { data: projectsData }, { data: settingsData }] = await Promise.all([
        supabase.from('videos').select('*').eq('active', true).order('sort_order'),
        supabase.from('projects').select('*').eq('active', true).order('sort_order'),
        supabase.from('site_settings').select('*')
      ])
      setVideos(videosData || [])
      setProjects(projectsData || [])
      if (settingsData) {
        const s = {}
        settingsData.forEach(row => { s[row.key] = row.value })
        setSettings(s)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <>
      <Ticker />
      <SiteHeader activePage="/studio" />
      <div className="page-wrapper">
        <DateBanner label="THE STUDIO · Videos, Projects & Creative Work" />
        <div className="studio-page">
          <div className="studio-header">
            <h1 className="writing-title">The Studio</h1>
            <p className="writing-subtitle">An amateur YouTuber and serial hobbyist, making things for the love of it.</p>
          </div>

          <div className="section-head">
            <div className="section-head-title">Recent Videos</div>
            <div className="section-head-line double"></div>
            {settings.youtube_url && settings.youtube_url !== '#' && (
              <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="section-all">YouTube Channel →</a>
            )}
          </div>

          {loading ? (
            <div className="loading-state"><div className="loading-text">// loading...</div></div>
          ) : videos.length === 0 ? (
            <div className="empty-state"><div className="empty-text">// videos coming soon.</div></div>
          ) : (
            <div className="studio-grid">
              {videos.map(video => (
                <div key={video.id} className="studio-card">
                  {video.youtube_id ? (
                    <div className="video-embed">
                      <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${video.youtube_id}`} title={video.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    </div>
                  ) : video.video_url ? (
                    <div className="video-embed">
                      <video src={video.video_url} controls style={{width:'100%',height:'100%'}} />
                    </div>
                  ) : (
                    <div className="video-placeholder">
                      <div className="video-placeholder-icon">▶</div>
                      <div className="video-placeholder-text">// video coming soon</div>
                    </div>
                  )}
                  <div className="studio-card-body">
                    <div className="studio-card-title">{video.title}</div>
                    {video.description && <div className="studio-card-desc">{video.description}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {projects.length > 0 && (
            <>
              <div className="section-head" style={{marginTop:'48px'}}>
                <div className="section-head-title">Current Projects</div>
                <div className="section-head-line double"></div>
              </div>
              <div className="projects-grid">
                {projects.map(project => (
                  <div key={project.id} className="project-card"
                    onClick={() => project.url && window.open(project.url, '_blank')}
                    style={{cursor: project.url ? 'pointer' : 'default'}}>
                    <div className="project-icon">{project.icon}</div>
                    <div className="project-status">{project.status}</div>
                    <div className="project-name">{project.name}</div>
                    {project.description && <div className="project-desc">{project.description}</div>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <SiteFooter />
    </>
  )
}
