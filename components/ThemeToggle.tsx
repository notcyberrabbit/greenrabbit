'use client'
import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem('theme')
      if (saved === 'light') {
        setIsDark(false)
        document.documentElement.classList.add('light')
      }
    } catch (e) {}
  }, [])

  const toggle = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    if (newIsDark) {
      document.documentElement.classList.remove('light')
      try { localStorage.setItem('theme', 'dark') } catch (e) {}
    } else {
      document.documentElement.classList.add('light')
      try { localStorage.setItem('theme', 'light') } catch (e) {}
    }
  }

  if (!mounted) return null

  return (
    <button
      onClick={toggle}
      style={{
        background: 'transparent',
        border: '1px solid #00d084',
        color: '#00d084',
        padding: '0.4rem 0.8rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
      }}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}
