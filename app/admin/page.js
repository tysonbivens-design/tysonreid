'use client'

import { useState, useEffect, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { supabase } from '../../lib/supabase'

const CATEGORIES = ['Corporate Dystopia', 'Culture', 'Politics', 'Food', 'Travel']

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// ── EDITOR TOOLBAR ──────────────────────────────────────────
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

// ── MAIN ADMIN COMPONENT ────────────────────────────────────
export default function AdminPage() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('posts') // posts | editor | subscribers
  const [posts, setPosts] = useState([])
  const [subscribers, setSubscribers] = useState([])
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  // Form state
  const [editingPost, setEditingPost] = useState(null)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [status, setStatus] = useState('draft')
  const [featured, setFeatured] = useState(false)

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
    }
  }, [session])

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
      title,
      slug: finalSlug,
      excerpt,
      content,
      category,
      status: finalStatus,
      featured,
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

  // Auto-slug from title
  useEffect(() => {
    if (!editingPost && title) setSlug(slugify(title))
  }, [title, editingPost])

  // ── LOADING ──────────────────────────────────────────────
  if (loading) return (
    <div className="admin-loading">
      <div className="loading-text">// authenticating...</div>
    </div>
  )

  // ── LOGIN SCREEN ─────────────────────────────────────────
  if (!session) return (
    <div className="admin-login">
      <div className="login-box">
        <div className="login-title">TYSON REID</div>
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

  // ── ADMIN DASHBOARD ──────────────────────────────────────
  return (
    <div className="admin-wrap">

      {/* ADMIN HEADER */}
      <div className="admin-header">
        <div className="admin-logo">TYSON REID <span>// ADMIN</span></div>
        <div className="admin-nav">
          <button className={view === 'posts' ? 'active' : ''} onClick={() => setView('posts')}>Posts</button>
          <button className={view === 'subscribers' ? 'active' : ''} onClick={() => setView('subscribers')}>Subscribers ({subscribers.length})</button>
          <button onClick={newPost} className="new-post-btn">+ New Post</button>
          <a href="/" target="_blank" className="view-site-btn">View Site ↗</a>
          <button onClick={signOut} className="signout-btn">Sign Out</button>
        </div>
      </div>

      {/* POSTS LIST VIEW */}
      {view === 'posts' && (
        <div className="admin-content">
          <div className="admin-section-header">
            <h2>All Posts</h2>
            <button onClick={newPost} className="new-post-btn">+ New Post</button>
          </div>
          {posts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-text">// no posts yet. write something.</div>
            </div>
          ) : (
            <div className="posts-table">
              <div className="posts-table-header">
                <span>Title</span>
                <span>Category</span>
                <span>Status</span>
                <span>Date</span>
                <span>Actions</span>
              </div>
              {posts.map(post => (
                <div key={post.id} className="posts-table-row">
                  <span className="post-table-title">{post.title}</span>
                  <span className="post-table-cat">{post.category}</span>
                  <span className={`post-table-status ${post.status}`}>{post.status}</span>
                  <span className="post-table-date">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
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

      {/* EDITOR VIEW */}
      {view === 'editor' && (
        <div className="admin-content">
          <div className="editor-layout">
            <div className="editor-main">
              <input
                className="title-input"
                placeholder="Post title..."
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
              <Toolbar editor={editor} />
              <div className="editor-body">
                <EditorContent editor={editor} />
              </div>
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
                    <label>
                      <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} />
                      {' '}Featured post
                    </label>
                  </div>
                  {saveMsg && <div className="save-msg">{saveMsg}</div>}
                  <button onClick={() => savePost(false)} disabled={saving} className="save-draft-btn">
                    {saving ? 'Saving...' : 'Save Draft'}
                  </button>
                  <button onClick={() => savePost(true)} disabled={saving} className="publish-btn">
                    {saving ? 'Publishing...' : '✓ Publish Now'}
                  </button>
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
                    <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Brief description for post cards..." rows={3} />
                  </div>
                </div>
              </div>

              <button onClick={() => setView('posts')} className="back-btn">← Back to Posts</button>
            </div>
          </div>
        </div>
      )}

      {/* SUBSCRIBERS VIEW */}
      {view === 'subscribers' && (
        <div className="admin-content">
          <div className="admin-section-header">
            <h2>Subscribers ({subscribers.length})</h2>
          </div>
          {subscribers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-text">// no subscribers yet. share your site.</div>
            </div>
          ) : (
            <div className="posts-table">
              <div className="posts-table-header">
                <span>Email</span>
                <span>Name</span>
                <span>Status</span>
                <span>Subscribed</span>
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
