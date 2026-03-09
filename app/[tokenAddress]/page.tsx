'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'

interface Props {
  onLoad: (address: string) => void
}

export default function TokenRedirectPage() {
  const params = useParams()
  const tokenAddress = params.tokenAddress as string

  useEffect(() => {
    if (tokenAddress && typeof window !== 'undefined') {
      // Store token in sessionStorage and redirect to home
      sessionStorage.setItem('autoAnalyze', tokenAddress)
      window.location.href = '/'
    }
  }, [tokenAddress])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#0a0e27',
      color: '#00d084',
      fontFamily: 'monospace'
    }}>
      <p style={{fontSize: '3rem'}}>🐇</p>
      <p>Loading token analysis...</p>
    </div>
  )
}
