'use client'

import { useState } from 'react'
import { TrendingUp } from 'lucide-react'
import TokenForm from '@/components/TokenForm'
import TokenMetrics from '@/components/TokenMetrics'
import CreatorInfo from '@/components/CreatorInfo'
import Analysis from '@/components/Analysis'
import styles from './page.module.css'
import ThemeToggle from '@/components/ThemeToggle'

interface TokenAnalytics {
  address: string
  symbol: string
  name: string
  fees: {
    lifetimeFeesCollected: number
    creatorFeePercentage: number
    totalFeePercentage: number
    feesCollectedNative: number
    currency: string
  }
  creators: {
    address: string
    name?: string
    isVerified: boolean
    createdAt: string
    description?: string
  }[]
}

interface TokenData {
  address: string
  tokenAnalytics: TokenAnalytics
}

export default function Home() {
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [tokenData2, setTokenData2] = useState<TokenData | null>(null)
  const [loading, setLoading] = useState(false)
  const [loading2, setLoading2] = useState(false)
  const [error, setError] = useState('')
  const [error2, setError2] = useState('')
  const [analysis, setAnalysis] = useState('')
  const [analyzingAI, setAnalyzingAI] = useState(false)
  const [billingError, setBillingError] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copied2, setCopied2] = useState(false)
  const [showCompare, setShowCompare] = useState(false)

  const fetchToken = async (tokenAddress: string): Promise<TokenData | null> => {
    const response = await fetch('/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokenAddress }),
    })
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to fetch token analytics')
    }
    return response.json()
  }

  const handleTokenSubmit = async (tokenAddress: string) => {
    setLoading(true)
    setError('')
    setTokenData(null)
    setTokenData2(null)
    setAnalysis('')
    setBillingError(false)
    setShowCompare(false)

    try {
      const data = await fetchToken(tokenAddress)
      setTokenData(data)
      analyzeToken(data!, tokenAddress)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleToken2Submit = async (tokenAddress: string) => {
    setLoading2(true)
    setError2('')
    setTokenData2(null)

    try {
      const data = await fetchToken(tokenAddress)
      setTokenData2(data)
    } catch (err) {
      setError2(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading2(false)
    }
  }

  const analyzeToken = async (data: TokenData, tokenAddress: string) => {
    setAnalyzingAI(true)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenAddress, analytics: data.tokenAnalytics }),
      })
      const result = await response.json()
      if (result.billingError) {
        setBillingError(true)
        setAnalysis('')
      } else {
        setAnalysis(result.analysis || 'Unable to generate analysis at this time.')
      }
    } catch (err) {
      console.error('Analysis error:', err)
    } finally {
      setAnalyzingAI(false)
    }
  }

  const handleCopy = (address: string, which: number) => {
    navigator.clipboard.writeText(address)
    if (which === 1) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } else {
      setCopied2(true)
      setTimeout(() => setCopied2(false), 2000)
    }
  }

  const renderTokenCard = (data: TokenData, which: number) => (
    <div style={{flex: 1, minWidth: 0}}>
      <section className={styles.section}>
        <div className={styles.tokenHeader}>
          <div>
            <h2>{data.tokenAnalytics.symbol || 'TOKEN'}</h2>
            <p className={styles.tokenName}>{data.tokenAnalytics.name || 'Unknown Token'}</p>
            <p className={styles.address}>
              <span>{data.address.slice(0, 10)}...{data.address.slice(-10)}</span>
              {' '}
              <button
                onClick={() => handleCopy(data.address, which)}
                style={{background: 'transparent', border: '1px solid #00d084', color: '#00d084', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', marginRight: '0.5rem'}}
              >
                {which === 1 ? (copied ? '✅' : '📋') : (copied2 ? '✅' : '📋')}
              </button>
              <a
                href={`https://bags.fm/${data.address}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{color: '#00d084', fontSize: '0.8rem'}}
              >
                → Bags.fm
              </a>
            </p>
          </div>
          <TrendingUp size={32} className={styles.headerIcon} />
        </div>
      </section>

      <section className={styles.section}>
        <h2>Fee Analytics</h2>
        <TokenMetrics metrics={data.tokenAnalytics.fees} />
      </section>

      {data.tokenAnalytics.creators && data.tokenAnalytics.creators.length > 0 && (
        <section className={styles.section}>
          <h2>Creators</h2>
          <CreatorInfo creators={data.tokenAnalytics.creators} />
        </section>
      )}
    </div>
  )

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <ThemeToggle />
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <span style={{fontSize: '2rem'}}>🐇</span>
            <h1>GreenRabbit</h1>
          </div>
          <p className={styles.tagline}>Token Analytics Dashboard for Bags.fm</p>
        </div>
        <div className={styles.headerGlow}></div>
      </header>

      <div className="container">
        <TokenForm onSubmit={handleTokenSubmit} loading={loading} />

        {error && <div className={styles.error}><p>{error}</p></div>}

        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>The Rabbit is gathering token intelligence...</p>
          </div>
        )}

        {tokenData && !loading && (
          <>
            {/* Compare button */}
            {!showCompare && (
              <div style={{textAlign: 'center', margin: '1rem 0'}}>
                <button
                  onClick={() => setShowCompare(true)}
                  style={{background: 'transparent', border: '2px solid #00d084', color: '#00d084', padding: '0.6rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem'}}
                >
                  ⚖️ Compare with another token
                </button>
              </div>
            )}

            {/* Second token input */}
            {showCompare && (
              <div style={{margin: '1rem 0'}}>
                <TokenForm onSubmit={handleToken2Submit} loading={loading2} placeholder="Enter second token address..." />
                {error2 && <div className={styles.error}><p>{error2}</p></div>}
              </div>
            )}

            {/* Side by side or single */}
            <div style={{display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap'}}>
              {renderTokenCard(tokenData, 1)}
              {tokenData2 && renderTokenCard(tokenData2, 2)}
            </div>

            {/* AI Analysis */}
            <section className={styles.section}>
              {billingError ? (
                <div className={styles.card} style={{textAlign: 'center', padding: '2rem'}}>
                  <p style={{fontSize: '2rem', marginBottom: '1rem'}}>🐇</p>
                  <h3 style={{color: '#00d084', marginBottom: '0.5rem'}}>The Rabbit is Resting...</h3>
                  <p style={{color: '#a8d5ba'}}>AI analysis will be available soon. The data above reveals all the secrets for now.</p>
                </div>
              ) : (
                <Analysis analysis={analysis} loading={analyzingAI} />
              )}
            </section>
          </>
        )}

        {!tokenData && !loading && !error && (
          <div className={styles.welcome}>
            <div className={styles.welcomeContent}>
              <span style={{fontSize: '4rem'}}>🐇</span>
              <h2>Enter a Token Address</h2>
              <p>The Rabbit will analyze fees, creators, and reveal insights from Bags.fm token data</p>
            </div>
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <p>🐰 GreenRabbit — Token Analytics Powered by AI & Bags.fm</p>
      </footer>
    </main>
  )
}
