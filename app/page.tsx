'use client'

import { useState, useEffect, useRef } from 'react'
import { TrendingUp } from 'lucide-react'
import TokenForm from '@/components/TokenForm'
import TokenMetrics from '@/components/TokenMetrics'
import TokenProfile from '@/components/TokenProfile'
import CreatorInfo from '@/components/CreatorInfo'
import Analysis from '@/components/Analysis'
import ThemeToggle from '@/components/ThemeToggle'
import styles from './page.module.css'

interface TokenAnalytics {
  address: string
  symbol: string
  name: string
  icon?: string | null
  description?: string | null
  links?: { type?: string, label?: string, url: string }[]
  price?: { usd: string | null, change24h: number | null }
  volume24h?: number | null
  liquidity?: number | null
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
  }[]
}

interface TokenData {
  address: string
  tokenAnalytics: TokenAnalytics
}

interface CompareToken {
  address: string
  data: TokenData | null
  loading: boolean
  error: string
}

const MAX_TOKENS = 10

export default function Home() {
  const [activeTab, setActiveTab] = useState<'analyze' | 'compare'>('analyze')

  // Single analyze
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [analysis, setAnalysis] = useState('')
  const [analyzingAI, setAnalyzingAI] = useState(false)
  const [billingError, setBillingError] = useState(false)
  const [copied, setCopied] = useState(false)

  // Compare mode
  const [compareTokens, setCompareTokens] = useState<CompareToken[]>([])
  const [newTokenInput, setNewTokenInput] = useState('')

  useEffect(() => {
    const stored = sessionStorage.getItem('autoAnalyze')
    if (stored) {
      sessionStorage.removeItem('autoAnalyze')
      handleTokenSubmit(stored)
    }
  }, [])

  const fetchToken = async (tokenAddress: string): Promise<TokenData> => {
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
    setAnalysis('')
    setBillingError(false)
    try {
      const data = await fetchToken(tokenAddress)
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
        body: JSON.stringify({ tokenAddress, analytics: data.tokenAnalytics }),
      })
      const result = await response.json()
      if (result.billingError) {
        setBillingError(true)
      } else {
        setAnalysis(result.analysis || '')
      }
    } catch (err) {
      console.error('Analysis error:', err)
    } finally {
      setAnalyzingAI(false)
    }
  }

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Compare mode functions
  const addCompareToken = async (address?: string) => {
    const addr = (address || newTokenInput).trim()
    if (!addr) return
    if (compareTokens.length >= MAX_TOKENS) return
    if (compareTokens.some(t => t.address === addr)) return

    setNewTokenInput('')
    const newEntry: CompareToken = { address: addr, data: null, loading: true, error: '' }
    setCompareTokens(prev => [...prev, newEntry])

    try {
      const data = await fetchToken(addr)
      setCompareTokens(prev =>
        prev.map(t => t.address === addr ? { ...t, data, loading: false } : t)
      )
    } catch (err) {
      setCompareTokens(prev =>
        prev.map(t => t.address === addr
          ? { ...t, loading: false, error: err instanceof Error ? err.message : 'Error' }
          : t
        )
      )
    }
  }

  const removeCompareToken = (address: string) => {
    setCompareTokens(prev => prev.filter(t => t.address !== address))
  }

  const formatNum = (n: number | null | undefined) => {
    if (n == null) return '—'
    if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M'
    if (n >= 1e3) return '$' + (n / 1e3).toFixed(2) + 'K'
    return n.toFixed(4)
  }

  const renderCompareTable = () => {
    const loaded = compareTokens.filter(t => t.data)

    return (
      <div className={styles.compareSection}>
        <div className={styles.compareControls}>
          <span style={{color: 'var(--green-light)', fontWeight: 700, fontSize: '1.1rem'}}>
            ⚖️ Token Comparison
          </span>
          <span className={styles.tokenCount}>
            {compareTokens.length}/{MAX_TOKENS} tokens
          </span>
        </div>

        <div className={styles.compareTableWrapper}>
          <table className={styles.compareTable}>
            <thead>
              <tr>
                <th>Metric</th>
                {compareTokens.map(t => (
                  <th key={t.address}>
                    {t.loading ? (
                      <span className={styles.loadingCell}>Loading...</span>
                    ) : t.error ? (
                      <span style={{color: '#ff6b6b', fontSize: '0.75rem'}}>Error</span>
                    ) : t.data ? (
                      <div className={styles.tokenColHeader}>
                        {t.data.tokenAnalytics.icon && (
                          <img src={t.data.tokenAnalytics.icon} alt="" />
                        )}
                        <div>
                          <span className={styles.tokenColSymbol}>
                            {t.data.tokenAnalytics.symbol}
                          </span>
                          <span className={styles.tokenColName}>
                            {t.data.tokenAnalytics.name}
                          </span>
                        </div>
                        <button
                          className={styles.removeTokenBtn}
                          onClick={() => removeCompareToken(t.address)}
                          title="Remove"
                        >✕</button>
                      </div>
                    ) : null}
                  </th>
                ))}
                {compareTokens.length < MAX_TOKENS && (
                  <th>
                    <div className={styles.inlineTokenInput}>
                      <input
                        type="text"
                        value={newTokenInput}
                        onChange={e => setNewTokenInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addCompareToken()}
                        placeholder="Paste token address..."
                      />
                      <button
                        className={styles.inlineAddBtn}
                        onClick={() => addCompareToken()}
                        disabled={!newTokenInput.trim()}
                      >+ Add</button>
                    </div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Price (USD)', key: 'price' },
                { label: '24h Change', key: 'change' },
                { label: 'Volume 24h', key: 'volume' },
                { label: 'Liquidity', key: 'liquidity' },
                { label: 'Lifetime Fees', key: 'fees' },
                { label: 'Address', key: 'address' },
              ].map(row => (
                <tr key={row.key}>
                  <td>{row.label}</td>
                  {compareTokens.map(t => {
                    if (t.loading) return <td key={t.address} className={styles.loadingCell}>...</td>
                    if (!t.data) return <td key={t.address}>—</td>
                    const ta = t.data.tokenAnalytics
                    let val: any = '—'
                    if (row.key === 'price') val = ta.price?.usd ? `$${parseFloat(ta.price.usd).toFixed(6)}` : '—'
                    if (row.key === 'change') {
                      const c = ta.price?.change24h
                      if (c != null) {
                        val = <span className={c >= 0 ? styles.positiveChange : styles.negativeChange}>
                          {c >= 0 ? '+' : ''}{c}%
                        </span>
                      }
                    }
                    if (row.key === 'volume') val = ta.volume24h ? formatNum(ta.volume24h) : '—'
                    if (row.key === 'liquidity') val = ta.liquidity ? formatNum(ta.liquidity) : '—'
                    if (row.key === 'fees') val = `${ta.fees.lifetimeFeesCollected.toFixed(2)} SOL`
                    if (row.key === 'address') val = <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>
                      {t.address.slice(0, 8)}...{t.address.slice(-6)}
                    </span>
                    return <td key={t.address}>{val}</td>
                  })}
                  {compareTokens.length < MAX_TOKENS && <td />}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {compareTokens.length === 0 && (
          <div className={styles.welcome} style={{minHeight: '200px'}}>
            <div className={styles.welcomeContent}>
              <span style={{fontSize: '2rem'}}>⚖️</span>
              <p>Add tokens above to start comparing</p>
            </div>
          </div>
        )}
      </div>
    )
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
        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'analyze' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('analyze')}
          >🔍 Analyze Token</button>
          <button
            className={`${styles.tab} ${activeTab === 'compare' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('compare')}
          >⚖️ Compare ({compareTokens.length})</button>
        </div>

        {/* Analyze Tab */}
        {activeTab === 'analyze' && (
          <>
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
                <section className={styles.section}>
                  <div className={styles.tokenHeader}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                      {tokenData.tokenAnalytics.icon && (
                        <img
                          src={tokenData.tokenAnalytics.icon}
                          alt={tokenData.tokenAnalytics.symbol}
                          style={{width: '56px', height: '56px', borderRadius: '50%', border: '2px solid #00d084', objectFit: 'cover'}}
                        />
                      )}
                      <div>
                        <h2>{tokenData.tokenAnalytics.symbol}</h2>
                        <p className={styles.tokenName}>{tokenData.tokenAnalytics.name}</p>
                        <p className={styles.address}>
                          <span>{tokenData.address.slice(0, 10)}...{tokenData.address.slice(-10)}</span>
                          {' '}
                          <button
                            onClick={() => handleCopy(tokenData.address)}
                            style={{background: 'transparent', border: '1px solid #00d084', color: '#00d084', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', marginRight: '0.5rem'}}
                          >{copied ? '✅' : '📋'}</button>
                          <a href={`https://bags.fm/${tokenData.address}`} target="_blank" rel="noopener noreferrer" style={{color: '#00d084', fontSize: '0.8rem', marginRight: '0.5rem'}}>→ Bags.fm</a>
                          <a
                            href={`https://twitter.com/intent/tweet?text=🐇 Analyzing ${tokenData.tokenAnalytics.symbol} on Bags.fm - ${tokenData.tokenAnalytics.fees.lifetimeFeesCollected.toFixed(2)} SOL lifetime fees!&url=https://greenrabbit-app.vercel.app/${tokenData.address}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{color: '#1DA1F2', fontSize: '0.8rem'}}
                          >→ Share on X</a>
                        </p>
                      </div>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end'}}>
                      <TrendingUp size={32} className={styles.headerIcon} />
                      <button
                        onClick={() => {
                          setActiveTab('compare')
                          addCompareToken(tokenData.address)
                        }}
                        style={{background: 'transparent', border: '1px solid #00d084', color: '#00d084', padding: '0.3rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem'}}
                      >+ Add to Compare</button>
                    </div>
                  </div>
                </section>

                {(tokenData.tokenAnalytics.description || (tokenData.tokenAnalytics.links && tokenData.tokenAnalytics.links.length > 0)) && (
                  <section className={styles.section}>
                    <TokenProfile
                      description={tokenData.tokenAnalytics.description}
                      links={tokenData.tokenAnalytics.links}
                    />
                  </section>
                )}

                <section className={styles.section}>
                  <h2>Analytics</h2>
                  <TokenMetrics
                    metrics={tokenData.tokenAnalytics.fees}
                    price={tokenData.tokenAnalytics.price}
                    volume24h={tokenData.tokenAnalytics.volume24h}
                    liquidity={tokenData.tokenAnalytics.liquidity}
                  />
                </section>

                {tokenData.tokenAnalytics.creators?.length > 0 && (
                  <section className={styles.section}>
                    <h2>Creators</h2>
                    <CreatorInfo creators={tokenData.tokenAnalytics.creators} />
                  </section>
                )}

                <section className={styles.section}>
                  {billingError ? (
                    <div className={styles.card} style={{textAlign: 'center', padding: '2rem'}}>
                      <p style={{fontSize: '2rem', marginBottom: '1rem'}}>🐇</p>
                      <h3 style={{color: '#00d084', marginBottom: '0.5rem'}}>The Rabbit is Resting...</h3>
                      <p style={{color: '#a8d5ba'}}>AI analysis will be available soon.</p>
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
          </>
        )}

        {/* Compare Tab */}
        {activeTab === 'compare' && renderCompareTable()}
      </div>

      <footer className={styles.footer}>
        <p>🐰 GreenRabbit — Token Analytics Powered by AI & Bags.fm</p>
      </footer>
    </main>
  )
}
