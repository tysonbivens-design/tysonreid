'use client'

import { useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { supabase } from '../../lib/supabase'

const CATEGORIES = ['Corporate Dystopia', 'Culture', 'Politics', 'Food', 'Travel']

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
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
      <button onClick={() => {
        const url = window.prompt('URL:')
        if (url) editor.chain().focus().setLink({ href: url }).run()
      }} className={editor.isActive('link') ? 'active' : ''}>🔗 Link</button>
      <button onClick={() => editor.chain().focus().unsetLink().run()}>Unlink</button>
    </div>
  )
}

export default function AdminPage() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('posts')
  const [posts, setPosts] = useState([])
  const [subscribers, setSubscribers] = useState([])
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  // Post form
  const [editingPost, setEditingPost] = useState(null)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [status, setStatus] = useState('draft')
  const [featured, setFeatured] = useState(false)

  // Now page
  const [nowPage, setNowPage] = useState({ reading: '', listening: '', watching: '', making: '', thinking: '' })

  // Ticker
  const [tickerItems, setTickerItems] = useState([])
  const [newTicker, setNewTicker] = useState('')

  // Manifesto
  const [manifestoItems, setManifestoItems] = useState([])
  const [newManifesto, setNewManifesto] = useState('')

  // Site settings
  const [siteSettings, setSiteSettings] = useState({ bio: '', tagline: '', eyebrow: '', footer_about: '' })

  // Auth
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Start writing...' }),
    ],
    content: '',
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) {
      fetchPosts()
      fetchSubscribers()
      fetchNowPage()
      fetchTickerItems()
      fetchManifestoItems()
      fetchSiteSettings()
    }
  }, [session])

  useEffect(() => {
    if (!editingPost && title) setSlug(slugify(title))
  }, [title, editingPost])

  async function signIn(e) {
    e.preventDefault()
    setAuthError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setAuthError(error.message)
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function fetchPosts() {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
    setPosts(data || [])
  }

  async function fetchSubscribers() {
    const { data } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false })
    setSubscribers(data || [])
  }

  async function fetchNowPage() {
    const { data } = await supabase.from('now_page').select('*').single()
    if (data) setNowPage(data)
  }

  async function fetchTickerItems() {
    const { data } = await supabase.from('ticker_items').select('*').order('sort_order')
    if (data) setTickerItems(data)
  }

  async function fetchManifestoItems() {
    const { data } = await supabase.from('manifesto_items').select('*').order('sort_order')
    if (data) setManifestoItems(data)
  }

  async function fetchSiteSettings() {
    const { data } = await supabase.from('site_settings').select('*')
    if (data) {
      const s = {}
      data.forEach(row => { s[row.key] = row.value })
      setSiteSettings(s)
    }
  }

  function newPost() {
    setEditingPost(null)
    setTitle('')
    setSlug('')
    setExcerpt('')
    setCategory(CATEGORIES[0])
    setStatus('draft')
    setFeatured(false)
    editor?.commands.setContent('')
    setView('editor')
  }

  function editPost(post) {
    setEditingPost(post)
    setTitle(post.title)
    setSlug(post.slug)
    setExcerpt(post.excerpt || '')
    setCategory(post.category || CATEGORIES[0])
    setStatus(post.status)
    setFeatured(post.featured || false)
    editor?.commands.setContent(post.content || '')
    setView('editor')
  }

  async function savePost(publishNow = false) {
    setSaving(true)
    setSaveMsg('')
    const content = editor?.getHTML() || ''
    const finalStatus = publishNow ? 'published' : status
    const finalSlug = slug || slugify(title)
    const postData = {
      title, slug: finalSlug, excerpt, content, category,
      status: finalStatus, featured,
      updated_at: new Date().toISOString(),
      ...(publishNow && !editingPost?.published_at ? { published_at: new Date().toISOString() } : {}),
    }
    let error
    if (editingPost) {
      const res = await supabase.from('posts').update(postData).eq('id', editingPost.id)
      error = res.error
    } else {
      const res = await supabase.from('posts').insert([{ ...postData, created_at: new Date().toISOString() }])
      error = res.error
    }
    setSaving(false)
    if (error) {
      setSaveMsg('Error: ' + error.message)
    } else {
      setSaveMsg(publishNow ? '✓ Published!' : '✓ Saved as draft')
      setStatus(finalStatus)
      fetchPosts()
      setTimeout(() => setSaveMsg(''), 3000)
    }
  }

  async function deletePost(id) {
    if (!confirm('Delete this post?')) return
    await supabase.from('posts').delete().eq('id', id)
    fetchPosts()
  }

  async function saveNowPage() {
    setSaving(true)
    const { error } = await supabase.from('now_page').update({
      reading: nowPage.reading,
      listening: nowPage.listening,
      watching: nowPage.watching,
      making: nowPage.making,
      thinking: nowPage.thinking,
      updated_at: new Date().toISOString()
    }).eq('id', nowPage.id)
    setSaving(false)
    setSaveMsg(error ? 'Error: ' + error.message : '✓ Now page updated!')
    setTimeout(() => setSaveMsg(''), 3000)
  }

  async function addTickerItem() {
    if (!newTicker.trim()) return
    const maxOrder = tickerItems.length > 0 ? Math.max(...tickerItems.map(t => t.sort_order)) : 0
    await supabase.from('ticker_items').insert([{ message: newTicker, sort_order: maxOrder + 1 }])
    setNewTicker('')
    fetchTickerItems()
  }

  async function deleteTickerItem(id) {
    await supabase.from('ticker_items').delete().eq('id', id)
    fetchTickerItems()
  }

  async function toggleTickerItem(id, active) {
    await supabase.from('ticker_items').update({ active: !active }).eq('id', id)
    fetchTickerItems()
  }

  async function addManifestoItem() {
    if (!newManifesto.trim()) return
    const maxOrder = manifestoItems.length > 0 ? Math.max(...manifestoItems.map(m => m.sort_order)) : 0
    await supabase.from('manifesto_items').insert([{ content: newManifesto, sort_order: maxOrder + 1 }])
    setNewManifesto('')
    fetchManifestoItems()
  }

  async function deleteManifestoItem(id) {
    if (!confirm('Delete this item?')) return
    await supabase.from('manifesto_items').delete().eq('id', id)
    fetchManifestoItems()
  }

  async function saveSiteSettings() {
    setSaving(true)
    const updates = Object.entries(siteSettings).map(([key, value]) =>
      supabase.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    )
    await Promise.all(updates)
    setSaving(false)
    setSaveMsg('✓ Settings saved!')
    setTimeout(() => setSaveMsg(''), 3000)
  }

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

  return (
    <div className="admin-wrap">
      <div className="admin-header">
        <div className="admin-logo">TYSON REID <span>// ADMIN</span></div>
        <div className="admin-nav">
          <button className={view === 'posts' ? 'active' : ''} onClick={() => { setView('posts'); setSaveMsg('') }}>Posts</button>
          <button className={view === 'now' ? 'active' : ''} onClick={() => { setView('now'); setSaveMsg('') }}>Now Page</button>
          <button className={view === 'ticker' ? 'active' : ''} onClick={() => { setView('ticker'); setSaveMsg('') }}>Ticker</button>
          <button className={view === 'manifesto' ? 'active' : ''} onClick={() => { setView('manifesto'); setSaveMsg('') }}>Manifesto</button>
          <button className={view === 'settings' ? 'active' : ''} onClick={() => { setView('settings'); setSaveMsg('') }}>Site Settings</button>
          <button className={view === 'subscribers' ? 'active' : ''} onClick={() => { setView('subscribers'); setSaveMsg('') }}>Subscribers ({subscribers.length})</button>
          <button onClick={newPost} className="new-post-btn">+ New Post</button>
          <a href="/" target="_blank" className="view-site-btn">View Site ↗</a>
          <button onClick={signOut} className="signout-btn">Sign Out</button>
        </div>
      </div>

      {/* POSTS LIST */}
      {view === 'posts' && (
        <div className="admin-content">
          <div className="admin-section-header">
            <h2>All Posts</h2>
            <button onClick={newPost} className="new-post-btn">+ New Post</button>
          </div>
          {posts.length === 0 ? (
            <div className="empty-state"><div className="empty-text">// no posts yet. write something.</div></div>
          ) : (
            <div className="posts-table">
              <div className="posts-table-header">
                <span>Title</span><span>Category</span><span>Status</span><span>Date</span><span>Actions</span>
              </div>
              {posts.map(post => (
                <div key={post.id} className="posts-table-row">
                  <span className="post-table-title">{post.title}</span>
                  <span className="post-table-cat">{post.category}</span>
                  <span className={`post-table-status ${post.status}`}>{post.status}</span>
                  <span className="post-table-date">{new Date(post.created_at).toLocaleDateString()}</span>
                  <span className="post-table-actions">
                    <button onClick={() => editPost(post)}>Edit</button>
                    <button onClick={() => deletePost(post.id)} className="delete-btn">Delete</button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EDITOR */}
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
                  <div className="field-group">
                    <label>Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value)}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  <div className="field-group">
                    <label><input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} /> Featured post</label>
                  </div>
                  {saveMsg && <div className="save-msg">{saveMsg}</div>}
                  <button onClick={() => savePost(false)} disabled={saving} className="save-draft-btn">{saving ? 'Saving...' : 'Save Draft'}</button>
                  <button onClick={() => savePost(true)} disabled={saving} className="publish-btn">{saving ? 'Publishing...' : '✓ Publish Now'}</button>
                </div>
              </div>
              <div className="editor-panel">
                <div className="editor-panel-header">Details</div>
                <div className="editor-panel-body">
                  <div className="field-group">
                    <label>Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="field-group">
                    <label>Slug</label>
                    <input type="text" value={slug} onChange={e => setSlug(e.target.value)} placeholder="post-url-slug" />
                  </div>
                  <div className="field-group">
                    <label>Excerpt</label>
                    <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Brief description..." rows={3} />
                  </div>
                </div>
              </div>
              <button onClick={() => setView('posts')} className="back-btn">← Back to Posts</button>
            </div>
          </div>
        </div>
      )}

      {/* NOW PAGE */}
      {view === 'now' && (
        <div className="admin-content">
          <div className="admin-section-header"><h2>Now Page</h2></div>
          <div className="settings-grid">
            {['reading', 'listening', 'watching', 'making', 'thinking'].map(field => (
              <div className="field-group" key={field}>
                <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <input
                  type="text"
                  value={nowPage[field] || ''}
                  onChange={e => setNowPage({ ...nowPage, [field]: e.target.value })}
                  placeholder={`Currently ${field}...`}
                />
              </div>
            ))}
            {saveMsg && <div className="save-msg">{saveMsg}</div>}
            <button onClick={saveNowPage} disabled={saving} className="publish-btn">
              {saving ? 'Saving...' : '✓ Save Now Page'}
            </button>
          </div>
        </div>
      )}

      {/* TICKER */}
      {view === 'ticker' && (
        <div className="admin-content">
          <div className="admin-section-header"><h2>Ticker Bar</h2></div>
          <div className="settings-grid">
            <div className="field-group">
              <label>Add New Message</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={newTicker}
                  onChange={e => setNewTicker(e.target.value)}
                  placeholder="New ticker message..."
                  onKeyDown={e => e.key === 'Enter' && addTickerItem()}
                  style={{ flex: 1 }}
                />
                <button onClick={addTickerItem} className="publish-btn" style={{ width: 'auto', padding: '8px 16px' }}>Add</button>
              </div>
            </div>
            <div className="posts-table" style={{ marginTop: '16px' }}>
              {tickerItems.map(item => (
                <div key={item.id} className="posts-table-row" style={{ gridTemplateColumns: '1fr auto auto' }}>
                  <span style={{ color: item.active ? 'var(--dark-brown)' : 'var(--sage)', fontStyle: item.active ? 'normal' : 'italic' }}>
                    {item.message}
                  </span>
                  <button onClick={() => toggleTickerItem(item.id, item.active)} style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', padding: '4px 10px', background: 'transparent', border: '1px solid var(--border)', color: item.active ? 'var(--pixel-green)' : 'var(--sage)', cursor: 'pointer' }}>
                    {item.active ? 'Active' : 'Hidden'}
                  </button>
                  <button onClick={() => deleteTickerItem(item.id)} className="delete-btn" style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', padding: '4px 10px', background: 'transparent', border: '1px solid var(--rust)', color: 'var(--rust)', cursor: 'pointer' }}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MANIFESTO */}
      {view === 'manifesto' && (
        <div className="admin-content">
          <div className="admin-section-header"><h2>The Manifesto</h2></div>
          <div className="settings-grid">
            <div className="field-group">
              <label>Add New Item</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={newManifesto}
                  onChange={e => setNewManifesto(e.target.value)}
                  placeholder="New manifesto item..."
                  onKeyDown={e => e.key === 'Enter' && addManifestoItem()}
                  style={{ flex: 1 }}
                />
                <button onClick={addManifestoItem} className="publish-btn" style={{ width: 'auto', padding: '8px 16px' }}>Add</button>
              </div>
            </div>
            <div className="posts-table" style={{ marginTop: '16px' }}>
              {manifestoItems.map((item, i) => (
                <div key={item.id} className="posts-table-row" style={{ gridTemplateColumns: 'auto 1fr auto' }}>
                  <span style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: 'var(--rust)', minWidth: '30px' }}>0{i + 1}</span>
                  <span style={{ color: 'var(--dark-brown)' }}>{item.content}</span>
                  <button onClick={() => deleteManifestoItem(item.id)} className="delete-btn" style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', padding: '4px 10px', background: 'transparent', border: '1px solid var(--rust)', color: 'var(--rust)', cursor: 'pointer' }}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SITE SETTINGS */}
      {view === 'settings' && (
        <div className="admin-content">
          <div className="admin-section-header"><h2>Site Settings</h2></div>
          <div className="settings-grid">
            <div className="field-group">
              <label>Tagline</label>
              <input type="text" value={siteSettings.tagline || ''} onChange={e => setSiteSettings({ ...siteSettings, tagline: e.target.value })} placeholder="Presence is resistance. Curation is revolutionary." />
            </div>
            <div className="field-group">
              <label>Header Eyebrow</label>
              <input type="text" value={siteSettings.eyebrow || ''} onChange={e => setSiteSettings({ ...siteSettings, eyebrow: e.target.value })} placeholder="Welcome to" />
            </div>
            <div className="field-group">
              <label>About Bio</label>
              <textarea value={siteSettings.bio || ''} onChange={e => setSiteSettings({ ...siteSettings, bio: e.target.value })} rows={5} placeholder="Your bio..." />
            </div>
            <div className="field-group">
              <label>Footer About Text</label>
              <textarea value={siteSettings.footer_about || ''} onChange={e => setSiteSettings({ ...siteSettings, footer_about: e.target.value })} rows={3} placeholder="Footer description..." />
            </div>
            {saveMsg && <div className="save-msg">{saveMsg}</div>}
            <button onClick={saveSiteSettings} disabled={saving} className="publish-btn">
              {saving ? 'Saving...' : '✓ Save Settings'}
            </button>
          </div>
        </div>
      )}

      {/* SUBSCRIBERS */}
      {view === 'subscribers' && (
        <div className="admin-content">
          <div className="admin-section-header"><h2>Subscribers ({subscribers.length})</h2></div>
          {subscribers.length === 0 ? (
            <div className="empty-state"><div className="empty-text">// no subscribers yet.</div></div>
          ) : (
            <div className="posts-table">
              <div className="posts-table-header">
                <span>Email</span><span>Name</span><span>Status</span><span>Subscribed</span>
              </div>
              {subscribers.map(sub => (
                <div key={sub.id} className="posts-table-row">
                  <span>{sub.email}</span>
                  <span>{sub.first_name || '—'}</span>
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
