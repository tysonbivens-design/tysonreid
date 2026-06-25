'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export function GuestbookPrompt() {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    // Check if already signed or dismissed
    const status = localStorage.getItem('gb_prompt_status')
    if (status === 'signed' || status === 'dismissed') {
      setDismissed(true)
      return
    }
    setDismissed(false)

    const timer = setTimeout(() => {
      setVisible(true)
    }, 4000) // appears 4 seconds after load

    return () => clearTimeout(timer)
  }, [])

  function handleDismiss() {
    localStorage.setItem('gb_prompt_status', 'dismissed')
    setVisible(false)
  }

  function handleSignClick() {
    localStorage.setItem('gb_prompt_status', 'signed')
    setVisible(false)
  }

  if (dismissed || !visible) return null

  return (
    <div className="gb-prompt">
      <button className="gb-prompt-close" onClick={handleDismiss} aria-label="Dismiss">✕</button>
      <div className="gb-prompt-icon">✦</div>
      <div className="gb-prompt-text">
        <div className="gb-prompt-title">New here?</div>
        <div className="gb-prompt-sub">Leave a note in the guestbook — say hello.</div>
      </div>
      <Link href="/guestbook" className="gb-prompt-btn" onClick={handleSignClick}>
        Sign it →
      </Link>
    </div>
  )
}
