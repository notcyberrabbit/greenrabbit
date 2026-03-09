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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [analysis, setAnalysis] = useState('')
  const [analyzingAI, setAnalyzingAI] = useState(false)
  const [billingError, setBillingError] = useState(false)

  const handleTokenSubmit = async (tokenAddress: string) => {
    setLoading(true)
    setError('')
    setTokenData(null)
    setAnalysis('')
    setBillingError(false)

    try {
      const response = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenAddress }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch token analytics')
      }

      const data = await response.json()
      setTokenData(data)
      analyzeToken(data, tokenAddress)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const analyzeToken = async (data: TokenData, tokenAddress: string) => {
    setAnalyzingAI(true)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenAddress,
          analytics: data.tokenAnalytics,
        }),
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
      setAnalysis('Unable to generate analysis at this time.')
    } finally {
      setAnalyzingAI(false)
    }
  }

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

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}

        {tokenData && (
          <>
            <section className={styles.section}>
              <div className={styles.tokenHeader}>
                <div>
                  <h2>{tokenData.tokenAnalytics.symbol || 'TOKEN'}</h2>
                  <p className={styles.tokenName}>
                    {tokenData.tokenAnalytics.name || 'Unknown Token'}
                  </p>
               <p className={styles.address}>
  Address: <span>{tokenData.address.slice(0, 12)}...{tokenData.address.slice(-12)}</span>
  {' '}
  <a 
    href={`https://bags.fm/${tokenData.address}`}
    target="_blank"
    rel="noopener noreferrer"
    style={{color: '#00d084', fontSize: '0.85rem'}}
  >
    → View on Bags.fm
  </a>
</p>
                </div>
                <TrendingUp size={48} className={styles.headerIcon} />
              </div>
            </section>

            <section className={styles.section}>
              <h2>Fee Analytics</h2>
              <TokenMetrics metrics={tokenData.tokenAnalytics.fees} />
            </section>

            {tokenData.tokenAnalytics.creators && tokenData.tokenAnalytics.creators.length > 0 && (
              <section className={styles.section}>
                <h2>Creator Information</h2>
                <CreatorInfo creators={tokenData.tokenAnalytics.creators} />
              </section>
            )}

            <section className={styles.section}>
              {billingError ? (
                <div className={styles.card} style={{textAlign: 'center', padding: '2rem'}}>
                  <p style={{fontSize: '2rem', marginBottom: '1rem'}}>🐇</p>
                  <h3 style={{color: '#00d084', marginBottom: '0.5rem'}}>The Rabbit is Resting...</h3>
                  <p style={{color: '#a8d5ba'}}>
                    AI analysis will be available soon. The data above reveals all the secrets for now.
                  </p>
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

        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>The Rabbit is gathering token intelligence...</p>
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <p>🐰 GreenRabbit — Token Analytics Powered by AI & Bags.fm</p>
      </footer>
    </main>
  )
}
