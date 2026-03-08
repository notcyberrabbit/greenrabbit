'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import WalletForm from '@/components/WalletForm'
import TokenTable from '@/components/TokenTable'
import Analysis from '@/components/Analysis'
import styles from './page.module.css'

interface Token {
  symbol: string
  address: string
  bought: number
  sold: number
  netAmount: number
  buyDate?: string
  sellDate?: string
  totalSpent?: number
  totalEarned?: number
}

interface WalletData {
  address: string
  tokens: Token[]
}

export default function Home() {
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [analysis, setAnalysis] = useState('')
  const [analyzingAI, setAnalyzingAI] = useState(false)

  const handleWalletSubmit = async (walletAddress: string) => {
    setLoading(true)
    setError('')
    setWalletData(null)
    setAnalysis('')

    try {
      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch wallet data')
      }

      const data = await response.json()
      setWalletData(data)

      // Trigger AI analysis
      analyzeWallet(data, walletAddress)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const analyzeWallet = async (data: WalletData, walletAddress: string) => {
    setAnalyzingAI(true)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          tokens: data.tokens,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze wallet')
      }

      const result = await response.json()
      setAnalysis(result.analysis)
    } catch (err) {
      console.error('Analysis error:', err)
      // Don't fail the whole app if analysis fails
      setAnalysis('Unable to generate analysis at this time.')
    } finally {
      setAnalyzingAI(false)
    }
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
       <span style={{color: '#00d084', fontSize: '2rem'}}>🐇</span>
            <h1>GreenRabbit</h1>
          </div>
          <p className={styles.tagline}>Solana Wallet Analyzer for Bags.fm Tokens</p>
        </div>
        <div className={styles.headerGlow}></div>
      </header>

      <div className="container">
        <WalletForm onSubmit={handleWalletSubmit} loading={loading} />

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}

        {walletData && (
          <>
            <section className={styles.section}>
              <div className={styles.walletInfo}>
                <h2>Portfolio Overview</h2>
                <p className={styles.address}>
                  Wallet: <span>{walletData.address.slice(0, 8)}...{walletData.address.slice(-8)}</span>
                </p>
                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <div className={styles.statLabel}>Total Tokens</div>
                    <div className={styles.statValue}>{walletData.tokens.length}</div>
                  </div>
                  <div className={styles.stat}>
                    <div className={styles.statLabel}>Transactions</div>
                    <div className={styles.statValue}>
                      {walletData.tokens.reduce((acc, token) => {
                        let count = 0
                        if (token.bought > 0) count++
                        if (token.sold > 0) count++
                        return acc + count
                      }, 0)}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {walletData.tokens.length > 0 ? (
              <>
                <section className={styles.section}>
                  <h2>Transaction History</h2>
                  <TokenTable tokens={walletData.tokens} />
                </section>

                <section className={styles.section}>
                  <Analysis
                    analysis={analysis}
                    loading={analyzingAI}
                  />
                </section>
              </>
            ) : (
              <div className={styles.noTokens}>
                <Search size={48} className={styles.noTokensIcon} />
                <h3>No tokens found</h3>
                <p>This wallet doesn't have any Bags.fm token transactions</p>
              </div>
            )}
          </>
        )}

        {!walletData && !loading && !error && (
          <div className={styles.welcome}>
            <div className={styles.welcomeContent}>
          <span style={{color: '#00d084', fontSize: '2rem'}}>🐇</span>
              <h2>Enter a Solana Wallet Address</h2>
              <p>The Rabbit will analyze your trading patterns and reveal insights into your Bags.fm portfolio</p>
            </div>
          </div>
        )}

        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>The Rabbit is sniffing out your tokens...</p>
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <p>🐰 GreenRabbit — Powered by AI & Blockchain</p>
      </footer>
    </main>
  )
}
