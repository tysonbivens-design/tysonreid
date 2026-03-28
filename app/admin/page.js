'use client'

import { useState, useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TipTapLink from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { supabase } from '../../lib/supabase'

const CATEGORIES = ['Corporate Dystopia', 'Culture', 'Politics', 'Food', 'Travel']

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function extractYoutubeId(input) {
  if (!input) return ''
  if (input.length === 11 && !input.includes('/')) return input
  const match = input.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : input
}

function Toolbar({ editor }) {
  if (!editor) return null
  return (
    <div className="editor-toolbar">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'active' : ''}>B</button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'active' : ''}>I</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'active' : ''}>H2</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'active' : ''}>H3</button>
      <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'active' : ''}>❝</button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'active' : ''}>• List</button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'active' : ''}>1. List</button>
      <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>─ Rule</button>
      <button onClick={() => { const url = window.prompt('URL:'); if (url) editor.chain().focus().setLink({ href: url }).run() }} className={editor.isActive('link') ? 'active' : ''}>🔗 Link</button>
      <button onClick={() => editor.chain().focus().unsetLink().run()}>Unlink</button>
    </div>
  )
}

export default function AdminPage() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('posts')
  const [saveMsg, setSaveMsg] = useState('')
  const [saving, setSaving] = useState(false)

  const [posts, setPosts] = useState([])
  const [subscribers, setSubscribers] = useState([])
  const [nowPage, setNowPage] = useState({ reading: '', listening: '', watching: '', making: '', thinking: '' })
  const [tickerItems, setTickerItems] = useState([])
  const [manifestoItems, setManifestoItems] = useState([])
  const [siteSettings, setSiteSettings] = useState({ bio: '', tagline: '', eyebrow: '', footer_about: '' })
  const [videos, setVideos] = useState([])
  const [photos, setPhotos] = useState([])
  const [guestbookEntries, setGuestbookEntries] = useState([])

  const [editingPost, setEditingPost] = useState(null)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [status, setStatus] = useState('draft')
  const [featured, setFeatured] = useState(false)

  const [newTicker, setNewTicker] = useState('')
  const [newManifesto, setNewManifesto] = useState('')

  const [videoTitle, setVideoTitle] = useState('')
  const [videoDesc, setVideoDesc] = useState('')
  const [videoYoutubeInput, setVideoYoutubeInput] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [videoUploading, setVideoUploading] = useState(false)
  const [editingVideo, setEditingVideo] = useState(null)
  const videoFileRef = useRef()

  const [photoCaption, setPhotoCaption] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoUploading, setPhotoUploading] = useState(false)
  const photoFileRef = useRef()

  const [editingEntry, setEditingEntry] = useState(null)
  const [editMessage, setEditMessage] = useState('')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')

  const editor = useEditor({
    extensions: [StarterKit, TipTapLink.configure({ openOnClick: false }), Placeholder.configure({ placeholder: 'Start writing...' })],
    content: '',
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); setLoading(false) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) { fetchPosts(); fetchSubscribers(); fetchNowPage(); fetchTickerItems(); fetchManifestoItems(); fetchSiteSettings(); fetchVideos(); fetchPhotos(); fetchGuestbook() }
  }, [session])

  useEffect(() => { if (!editingPost && title) setSlug(slugify(title)) }, [title, editingPost])

  async function signIn(e) { e.preventDefault(); setAuthError(''); const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) setAuthError(error.message) }
  async function signOut() { await supabase.auth.signOut() }

  async function fetchPosts() { const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false }); setPosts(data || []) }
  async function fetchSubscribers() { const { data } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false }); setSubscribers(data || []) }
  async function fetchNowPage() { const { data } = await supabase.from('now_page').select('*').single(); if (data) setNowPage(data) }
  async function fetchTickerItems() { const { data } = await supabase.from('ticker_items').select('*').order('sort_order'); if (data) setTickerItems(data) }
  async function fetchManifestoItems() { const { data } = await supabase.from('manifesto_items').select('*').order('sort_order'); if (data) setManifestoItems(data) }
  async function fetchSiteSettings() { const { data } = await supabase.from('site_settings').select('*'); if (data) { const s = {}; data.forEach(r => { s[r.key] = r.value }); setSiteSettings(s) } }
  async function fetchVideos() { const { data } = await supabase.from('videos').select('*').order('sort_order'); setVideos(data || []) }
  async function fetchPhotos() { const { data } = await supabase.from('photos').select('*').order('sort_order'); setPhotos(data || []) }
  async function fetchGuestbook() { const { data } = await supabase.from('guestbook').select('*').order('created_at', { ascending: false }); setGuestbookEntries(data || []) }

  function newPost() { setEditingPost(null); setTitle(''); setSlug(''); setExcerpt(''); setCategory(CATEGORIES[0]); setStatus('draft'); setFeatured(false); editor?.commands.setContent(''); setView('editor') }
  function editPost(post) { setEditingPost(post); setTitle(post.title); setSlug(post.slug); setExcerpt(post.excerpt || ''); setCategory(post.category || CATEGORIES[0]); setStatus(post.status); setFeatured(post.featured || false); editor?.commands.setContent(post.content || ''); setView('editor') }

  async function savePost(publishNow = false) {
    setSaving(true); setSaveMsg('')
    const content = editor?.getHTML() || ''
    const finalStatus = publishNow ? 'published' : status
    const finalSlug = slug || slugify(title)
    const postData = { title, slug: finalSlug, excerpt, content, category, status: finalStatus, featured, updated_at: new Date().toISOString(), ...(publishNow && !editingPost?.published_at ? { published_at: new Date().toISOString() } : {}) }
    let error
    if (editingPost) { const res = await supabase.from('posts').update(postData).eq('id', editingPost.id); error = res.error }
    else { const res = await supabase.from('posts').insert([{ ...postData, created_at: new Date().toISOString() }]); error = res.error }
    setSaving(false)
    if (error) { setSaveMsg('Error: ' + error.message) }
    else { setSaveMsg(publishNow ? '✓ Published!' : '✓ Saved as draft'); setStatus(finalStatus); fetchPosts(); setTimeout(() => setSaveMsg(''), 3000) }
  }

  async function deletePost(id) { if (!confirm('Delete this post?')) return; await supabase.from('posts').delete().eq('id', id); fetchPosts() }

  async function saveNowPage() {
    setSaving(true)
    const { error } = await supabase.from('now_page').update({ ...nowPage, updated_at: new Date().toISOString() }).eq('id', nowPage.id)
    setSaving(false); setSaveMsg(error ? 'Error: ' + error.message : '✓ Now page updated!'); setTimeout(() => setSaveMsg(''), 3000)
  }

  async function addTickerItem() { if (!newTicker.trim()) return; const maxOrder = tickerItems.length > 0 ? Math.max(...tickerItems.map(t => t.sort_order)) : 0; await supabase.from('ticker_items').insert([{ message: newTicker, sort_order: maxOrder + 1 }]); setNewTicker(''); fetchTickerItems() }
  async function deleteTickerItem(id) { await supabase.from('ticker_items').delete().eq('id', id); fetchTickerItems() }
  async function toggleTickerItem(id, active) { await supabase.from('ticker_items').update({ active: !active }).eq('id', id); fetchTickerItems() }

  async function addManifestoItem() { if (!newManifesto.trim()) return; const maxOrder = manifestoItems.length > 0 ? Math.max(...manifestoItems.map(m => m.sort_order)) : 0; await supabase.from('manifesto_items').insert([{ content: newManifesto, sort_order: maxOrder + 1 }]); setNewManifesto(''); fetchManifestoItems() }
  async function deleteManifestoItem(id) { if (!confirm('Delete?')) return; await supabase.from('manifesto_items').delete().eq('id', id); fetchManifestoItems() }

  async function saveSiteSettings() { setSaving(true); await Promise.all(Object.entries(siteSettings).map(([key, value]) => supabase.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' }))); setSaving(false); setSaveMsg('✓ Settings saved!'); setTimeout(() => setSaveMsg(''), 3000) }

  async function saveVideo() {
    if (!videoTitle) return
    setSaving(true)
    let videoUrl = null
    const youtubeId = extractYoutubeId(videoYoutubeInput)
    const thumbnailUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : null
    if (videoFile) {
      setVideoUploading(true)
      const ext = videoFile.name.split('.').pop()
      const path = `${Date.now()}.${ext}`
      const { data, error } = await supabase.storage.from('videos').upload(path, videoFile)
      if (!error) { const { data: u } = supabase.storage.from('videos').getPublicUrl(path); videoUrl = u.publicUrl }
      setVideoUploading(false)
    }
    const maxOrder = videos.length > 0 ? Math.max(...videos.map(v => v.sort_order)) : 0
    const videoData = { title: videoTitle, description: videoDesc, youtube_id: youtubeId || null, video_url: videoUrl, thumbnail_url: thumbnailUrl, sort_order: editingVideo ? editingVideo.sort_order : maxOrder + 1 }
    let error
    if (editingVideo) { const res = await supabase.from('videos').update(videoData).eq('id', editingVideo.id); error = res.error }
    else { const res = await supabase.from('videos').insert([videoData]); error = res.error }
    setSaving(false)
    if (!error) { setSaveMsg('✓ Video saved!'); setVideoTitle(''); setVideoDesc(''); setVideoYoutubeInput(''); setVideoFile(null); setEditingVideo(null); if (videoFileRef.current) videoFileRef.current.value = ''; fetchVideos(); setTimeout(() => setSaveMsg(''), 3000) }
    else { setSaveMsg('Error: ' + error.message) }
  }

  function startEditVideo(video) { setEditingVideo(video); setVideoTitle(video.title); setVideoDesc(video.description || ''); setVideoYoutubeInput(video.youtube_id || '') }
  async function deleteVideo(id, storagePath) { if (!confirm('Delete this video?')) return; if (storagePath) await supabase.storage.from('videos').remove([storagePath]); await supabase.from('videos').delete().eq('id', id); fetchVideos() }
  async function toggleVideo(id, active) { await supabase.from('videos').update({ active: !active }).eq('id', id); fetchVideos() }

  async function uploadPhoto() {
    if (!photoFile && !photoUrl) return
    setPhotoUploading(true)
    let finalUrl = photoUrl
    let storagePath = null
    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('photos').upload(path, photoFile)
      if (!error) { const { data: u } = supabase.storage.from('photos').getPublicUrl(path); finalUrl = u.publicUrl; storagePath = path }
    }
    if (!finalUrl) { setPhotoUploading(false); return }
    const maxOrder = photos.length > 0 ? Math.max(...photos.map(p => p.sort_order)) : 0
    await supabase.from('photos').insert([{ url: finalUrl, storage_path: storagePath, caption: photoCaption || null, sort_order: maxOrder + 1 }])
    setPhotoUploading(false); setPhotoCaption(''); setPhotoFile(null); setPhotoUrl(''); if (photoFileRef.current) photoFileRef.current.value = ''; fetchPhotos(); setSaveMsg('✓ Photo added!'); setTimeout(() => setSaveMsg(''), 3000)
  }

  async function deletePhoto(id, storagePath) { if (!confirm('Delete this photo?')) return; if (storagePath) await supabase.storage.from('photos').remove([storagePath]); await supabase.from('photos').delete().eq('id', id); fetchPhotos() }
  async function togglePhoto(id, active) { await supabase.from('photos').update({ active: !active }).eq('id', id); fetchPhotos() }
  async function updatePhotoCaption(id, caption) { await supabase.from('photos').update({ caption }).eq('id', id); fetchPhotos() }

  async function deleteEntry(id) { if (!confirm('Delete this entry?')) return; await supabase.from('guestbook').delete().eq('id', id); fetchGuestbook() }
  async function saveEntryEdit(id) { await supabase.from('guestbook').update({ message: editMessage }).eq('id', id); setEditingEntry(null); setEditMessage(''); fetchGuestbook() }

  if (loading) return <div className="admin-loading"><div className="loading-text">// authenticating...</div></div>

  if (!session) return (
    <div className="admin-login">
      <div className="login-box">
        <div className="login-title">Tyson Reid</div>
        <div className="login-sub">// admin access only</div>
        <form onSubmit={signIn} className="login-form">
          <input type="email" placeholder="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="password" value={password} onChange={e => setPassword(e.target.value)} required />
          {authError && <div className="auth-error">{authError}</div>}
          <button type="submit">Sign In →</button>
        </form>
      </div>
    </div>
  )

  const tabs = [
    ['posts', 'Posts'], ['now', 'Now Page'], ['ticker', 'Ticker'],
    ['manifesto', 'Manifesto'], ['settings', 'Site Settings'],
    ['studio', 'Studio'], ['photos', 'Photos'],
    ['guestbook', `Guestbook (${guestbookEntries.length})`],
    ['subscribers', `Subscribers (${subscribers.length})`],
  ]

  return (
    <div className="admin-wrap">
      <div className="admin-header">
        <div className="admin-logo">TYSON REID <span>// ADMIN</span></div>
        <div className="admin-nav">
          {tabs.map(([key, label]) => (
            <button key={key} className={view === key ? 'active' : ''} onClick={() => { setView(key); setSaveMsg('') }}>{label}</button>
          ))}
          <button onClick={newPost} className="new-post-btn">+ New Post</button>
          <a href="/" target="_blank" className="view-site-btn">View Site ↗</a>
          <button onClick={signOut} className="signout-btn">Sign Out</button>
        </div>
      </div>

      {view === 'posts' && (
        <div className="admin-content">
          <div className="admin-section-header"><h2>All Posts</h2><button onClick={newPost} className="new-post-btn">+ New Post</button></div>
          {posts.length === 0 ? <div className="empty-state"><div className="empty-text">// no posts yet.</div></div> : (
            <div className="posts-table">
              <div className="posts-table-header"><span>Title</span><span>Category</span><span>Status</span><span>Date</span><span>Actions</span></div>
              {posts.map(post => (
                <div key={post.id} className="posts-table-row">
                  <span className="post-table-title">{post.title}</span>
                  <span className="post-table-cat">{post.category}</span>
                  <span className={`post-table-status ${post.status}`}>{post.status}</span>
                  <span className="post-table-date">{new Date(post.created_at).toLocaleDateString()}</span>
                  <span className="post-table-actions"><button onClick={() => editPost(post)}>Edit</button><button onClick={() => deletePost(post.id)} className="delete-btn">Delete</button></span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'editor' && (
        <div className="admin-content">
          <div className="editor-layout">
            <div className="editor-main">
              <input className="title-input" placeholder="Post title..." value={title} onChange={e => setTitle(e.target.value)} />
              <Toolbar editor={editor} />
              <div className="editor-body"><EditorContent editor={editor} /></div>
            </div>
            <div className="editor-sidebar">
              <div className="editor-panel">
                <div className="editor-panel-header">Publish</div>
                <div className="editor-panel-body">
                  <div className="field-group"><label>Status</label><select value={status} onChange={e => setStatus(e.target.value)}><option value="draft">Draft</option><option value="published">Published</option></select></div>
                  <div className="field-group"><label><input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} /> Featured post</label></div>
                  {saveMsg && <div className="save-msg">{saveMsg}</div>}
                  <button onClick={() => savePost(false)} disabled={saving} className="save-draft-btn">{saving ? 'Saving...' : 'Save Draft'}</button>
                  <button onClick={() => savePost(true)} disabled={saving} className="publish-btn">{saving ? 'Publishing...' : '✓ Publish Now'}</button>
                </div>
              </div>
              <div className="editor-panel">
                <div className="editor-panel-header">Details</div>
                <div className="editor-panel-body">
                  <div className="field-group"><label>Category</label><select value={category} onChange={e => setCategory(e.target.value)}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div className="field-group"><label>Slug</label><input type="text" value={slug} onChange={e => setSlug(e.target.value)} placeholder="post-url-slug" /></div>
                  <div className="field-group"><label>Excerpt</label><textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Brief description..." rows={3} /></div>
                </div>
              </div>
              <button onClick={() => setView('posts')} className="back-btn">← Back to Posts</button>
            </div>
          </div>
        </div>
      )}

      {view === 'now' && (
        <div className="admin-content">
          <div className="admin-section-header"><h2>Now Page</h2></div>
          <div className="settings-grid">
            {['reading', 'listening', 'watching', 'making', 'thinking'].map(field => (
              <div className="field-group" key={field}>
                <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <input type="text" value={nowPage[field] || ''} onChange={e => setNowPage({ ...nowPage, [field]: e.target.value })} placeholder={`Currently ${field}...`} />
              </div>
            ))}
            {saveMsg && <div className="save-msg">{saveMsg}</div>}
            <button onClick={saveNowPage} disabled={saving} className="publish-btn">{saving ? 'Saving...' : '✓ Save Now Page'}</button>
          </div>
        </div>
      )}

      {view === 'ticker' && (
        <div className="admin-content">
          <div className="admin-section-header"><h2>Ticker Bar</h2></div>
          <div className="settings-grid">
            <div className="field-group">
              <label>Add New Message</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" value={newTicker} onChange={e => setNewTicker(e.target.value)} placeholder="New ticker message..." onKeyDown={e => e.key === 'Enter' && addTickerItem()} style={{ flex: 1 }} />
                <button onClick={addTickerItem} className="publish-btn" style={{ width: 'auto', padding: '8px 16px' }}>Add</button>
              </div>
            </div>
            <div className="posts-table">
              {tickerItems.map(item => (
                <div key={item.id} className="posts-table-row" style={{ gridTemplateColumns: '1fr auto auto' }}>
                  <span style={{ color: item.active ? 'var(--dark-brown)' : 'var(--sage)', fontStyle: item.active ? 'normal' : 'italic' }}>{item.message}</span>
                  <button onClick={() => toggleTickerItem(item.id, item.active)} style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', padding: '4px 10px', background: 'transparent', border: '1px solid var(--border)', color: item.active ? 'var(--pixel-green)' : 'var(--sage)', cursor: 'pointer' }}>{item.active ? 'Active' : 'Hidden'}</button>
                  <button onClick={() => deleteTickerItem(item.id)} style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', padding: '4px 10px', background: 'transparent', border: '1px solid var(--rust)', color: 'var(--rust)', cursor: 'pointer' }}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === 'manifesto' && (
        <div className="admin-content">
          <div className="admin-section-header"><h2>The Manifesto</h2></div>
          <div className="settings-grid">
            <div className="field-group">
              <label>Add New Item</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" value={newManifesto} onChange={e => setNewManifesto(e.target.value)} placeholder="New manifesto item..." onKeyDown={e => e.key === 'Enter' && addManifestoItem()} style={{ flex: 1 }} />
                <button onClick={addManifestoItem} className="publish-btn" style={{ width: 'auto', padding: '8px 16px' }}>Add</button>
              </div>
            </div>
            <div className="posts-table">
              {manifestoItems.map((item, i) => (
                <div key={item.id} className="posts-table-row" style={{ gridTemplateColumns: 'auto 1fr auto' }}>
                  <span style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: 'var(--rust)', minWidth: '30px' }}>0{i + 1}</span>
                  <span style={{ color: 'var(--dark-brown)' }}>{item.content}</span>
                  <button onClick={() => deleteManifestoItem(item.id)} style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', padding: '4px 10px', background: 'transparent', border: '1px solid var(--rust)', color: 'var(--rust)', cursor: 'pointer' }}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === 'settings' && (
        <div className="admin-content">
          <div className="admin-section-header"><h2>Site Settings</h2></div>
          <div className="settings-grid">
            <div className="field-group"><label>Tagline</label><input type="text" value={siteSettings.tagline || ''} onChange={e => setSiteSettings({ ...siteSettings, tagline: e.target.value })} /></div>
            <div className="field-group"><label>Header Eyebrow</label><input type="text" value={siteSettings.eyebrow || ''} onChange={e => setSiteSettings({ ...siteSettings, eyebrow: e.target.value })} /></div>
            <div className="field-group"><label>About Bio</label><textarea value={siteSettings.bio || ''} onChange={e => setSiteSettings({ ...siteSettings, bio: e.target.value })} rows={5} /></div>
            <div className="field-group"><label>Footer About Text</label><textarea value={siteSettings.footer_about || ''} onChange={e => setSiteSettings({ ...siteSettings, footer_about: e.target.value })} rows={3} /></div>
            {saveMsg && <div className="save-msg">{saveMsg}</div>}
            <button onClick={saveSiteSettings} disabled={saving} className="publish-btn">{saving ? 'Saving...' : '✓ Save Settings'}</button>
          </div>
        </div>
      )}

      {view === 'studio' && (
        <div className="admin-content">
          <div className="admin-section-header"><h2>Studio — Videos</h2></div>
          <div className="media-layout">
            <div className="media-form">
              <div className="editor-panel">
                <div className="editor-panel-header">{editingVideo ? 'Edit Video' : 'Add Video'}</div>
                <div className="editor-panel-body">
                  <div className="field-group"><label>Title *</label><input type="text" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} placeholder="Video title..." /></div>
                  <div className="field-group"><label>Description</label><textarea value={videoDesc} onChange={e => setVideoDesc(e.target.value)} rows={3} placeholder="Brief description..." /></div>
                  <div className="field-group"><label>YouTube URL or ID</label><input type="text" value={videoYoutubeInput} onChange={e => setVideoYoutubeInput(e.target.value)} placeholder="https://youtube.com/watch?v=... or video ID" /></div>
                  <div className="field-group">
                    <label>— OR — Upload Video File</label>
                    <input type="file" accept="video/*" ref={videoFileRef} onChange={e => setVideoFile(e.target.files[0])} style={{ color: 'var(--brown)', fontFamily: 'Courier Prime, monospace', fontSize: '13px' }} />
                  </div>
                  {saveMsg && <div className="save-msg">{saveMsg}</div>}
                  <button onClick={saveVideo} disabled={saving || videoUploading} className="publish-btn">{videoUploading ? 'Uploading...' : saving ? 'Saving...' : editingVideo ? '✓ Update Video' : '✓ Add Video'}</button>
                  {editingVideo && <button onClick={() => { setEditingVideo(null); setVideoTitle(''); setVideoDesc(''); setVideoYoutubeInput('') }} className="back-btn">Cancel Edit</button>}
                </div>
              </div>
            </div>
            <div className="media-list">
              <div className="admin-section-header" style={{ marginBottom: '16px' }}><h2 style={{ fontSize: '18px' }}>All Videos ({videos.length})</h2></div>
              {videos.length === 0 ? <div className="empty-state"><div className="empty-text">// no videos yet.</div></div> : (
                <div className="media-grid">
                  {videos.map(video => (
                    <div key={video.id} className={`media-card ${!video.active ? 'media-hidden' : ''}`}>
                      <div className="media-thumb">
                        {video.youtube_id ? (
                          <img src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '32px', color: 'var(--border)' }}>▶</div>
                        )}
                      </div>
                      <div className="media-card-body">
                        <div className="media-card-title">{video.title}</div>
                        {video.youtube_id && <div className="media-card-meta">YouTube: {video.youtube_id}</div>}
                        {video.video_url && <div className="media-card-meta">Uploaded file</div>}
                        <div className="media-card-actions">
                          <button onClick={() => startEditVideo(video)}>Edit</button>
                          <button onClick={() => toggleVideo(video.id, video.active)}>{video.active ? 'Hide' : 'Show'}</button>
                          <button onClick={() => deleteVideo(video.id, video.storage_path)} className="delete-btn">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {view === 'photos' && (
        <div className="admin-content">
          <div className="admin-section-header"><h2>Photos</h2></div>
          <div className="media-layout">
            <div className="media-form">
              <div className="editor-panel">
                <div className="editor-panel-header">Add Photo</div>
                <div className="editor-panel-body">
                  <div className="field-group">
                    <label>Upload Photo File</label>
                    <input type="file" accept="image/*" ref={photoFileRef} onChange={e => setPhotoFile(e.target.files[0])} style={{ color: 'var(--brown)', fontFamily: 'Courier Prime, monospace', fontSize: '13px' }} />
                  </div>
                  <div className="field-group"><label>— OR — External URL</label><input type="text" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="https://..." /></div>
                  <div className="field-group"><label>Caption</label><input type="text" value={photoCaption} onChange={e => setPhotoCaption(e.target.value)} placeholder="Optional caption..." /></div>
                  {saveMsg && <div className="save-msg">{saveMsg}</div>}
                  <button onClick={uploadPhoto} disabled={photoUploading} className="publish-btn">{photoUploading ? 'Uploading...' : '✓ Add Photo'}</button>
                </div>
              </div>
            </div>
            <div className="media-list">
              <div className="admin-section-header" style={{ marginBottom: '16px' }}><h2 style={{ fontSize: '18px' }}>All Photos ({photos.length})</h2></div>
              {photos.length === 0 ? <div className="empty-state"><div className="empty-text">// no photos yet.</div></div> : (
                <div className="photo-admin-grid">
                  {photos.map(photo => (
                    <div key={photo.id} className={`photo-admin-card ${!photo.active ? 'media-hidden' : ''}`}>
                      <div className="photo-admin-thumb">
                        <img src={photo.url} alt={photo.caption || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div className="photo-admin-body">
                        <input type="text" defaultValue={photo.caption || ''} placeholder="Add caption..." onBlur={e => updatePhotoCaption(photo.id, e.target.value)} style={{ background: 'transparent', border: 'none', borderBottom: '1px dashed var(--border)', color: 'var(--brown)', fontFamily: 'Courier Prime, monospace', fontSize: '12px', width: '100%', outline: 'none', padding: '4px 0' }} />
                        <div className="media-card-actions">
                          <button onClick={() => togglePhoto(photo.id, photo.active)}>{photo.active ? 'Hide' : 'Show'}</button>
                          <button onClick={() => deletePhoto(photo.id, photo.storage_path)} className="delete-btn">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {view === 'guestbook' && (
        <div className="admin-content">
          <div className="admin-section-header"><h2>Guestbook ({guestbookEntries.length})</h2></div>
          {guestbookEntries.length === 0 ? <div className="empty-state"><div className="empty-text">// no entries yet.</div></div> : (
            <div className="posts-table">
              <div className="posts-table-header" style={{ gridTemplateColumns: '120px 1fr 2fr 120px' }}>
                <span>Date</span><span>Name / Location</span><span>Message</span><span>Actions</span>
              </div>
              {guestbookEntries.map(entry => (
                <div key={entry.id} className="posts-table-row" style={{ gridTemplateColumns: '120px 1fr 2fr 120px' }}>
                  <span className="post-table-date">{new Date(entry.created_at).toLocaleDateString()}</span>
                  <span style={{ color: 'var(--dark-brown)', fontWeight: 700 }}>
                    {entry.name}
                    {entry.location && <span style={{ color: 'var(--sage)', fontWeight: 400, display: 'block', fontSize: '12px' }}>{entry.location}</span>}
                  </span>
                  <span style={{ color: 'var(--brown)', fontSize: '13px', fontStyle: 'italic' }}>
                    {editingEntry === entry.id ? (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input type="text" value={editMessage} onChange={e => setEditMessage(e.target.value)} style={{ background: '#0f0d08', border: '1px solid var(--amber)', color: 'var(--cream)', fontFamily: 'Courier Prime, monospace', fontSize: '13px', padding: '4px 8px', flex: 1, outline: 'none' }} />
                        <button onClick={() => saveEntryEdit(entry.id)} style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', padding: '4px 8px', background: 'var(--amber)', border: 'none', color: 'var(--dark-brown)', cursor: 'pointer' }}>Save</button>
                      </div>
                    ) : `"${entry.message}"`}
                  </span>
                  <span className="post-table-actions">
                    <button onClick={() => { setEditingEntry(entry.id); setEditMessage(entry.message) }}>Edit</button>
                    <button onClick={() => deleteEntry(entry.id)} className="delete-btn">Delete</button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'subscribers' && (
        <div className="admin-content">
          <div className="admin-section-header"><h2>Subscribers ({subscribers.length})</h2></div>
          {subscribers.length === 0 ? <div className="empty-state"><div className="empty-text">// no subscribers yet.</div></div> : (
            <div className="posts-table">
              <div className="posts-table-header"><span>Email</span><span>Name</span><span>Status</span><span>Subscribed</span></div>
              {subscribers.map(sub => (
                <div key={sub.id} className="posts-table-row">
                  <span>{sub.email}</span><span>{sub.first_name || '—'}</span>
                  <span className={`post-table-status ${sub.status}`}>{sub.status}</span>
                  <span className="post-table-date">{new Date(sub.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
