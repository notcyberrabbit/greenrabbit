import styles from '@/app/page.module.css'

interface Fees {
  lifetimeFeesCollected: number
  creatorFeePercentage: number
  totalFeePercentage: number
  feesCollectedNative: number
  totalClaimedSol?: number
  unclaimedSol?: number
  currency: string
}

interface TokenMetricsProps {
  metrics: Fees
  price?: { usd: string | null, change24h: number | null }
  volume24h?: number | null
  liquidity?: number | null
  claimStats?: {
    wallet: string
    username: string | null
    pfp: string | null
    twitterUsername: string | null
    royaltyBps: number
    isCreator: boolean
    totalClaimed: number
  }[]
}

export default function TokenMetrics({ metrics, price, volume24h, liquidity, claimStats }: TokenMetricsProps) {
  const formatNumber = (num: number) => {
    if (num === 0) return '0'
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
    return num.toFixed(4)
  }

  const change = price?.change24h
  const changeColor = change == null ? '#a8d5ba' : change >= 0 ? '#00d084' : '#ff6b6b'
  const changePrefix = change && change > 0 ? '+' : ''

  const totalClaimed = metrics.totalClaimedSol ?? 0
  const unclaimed = metrics.unclaimedSol ?? 0
  const lifetime = metrics.lifetimeFeesCollected
  const claimedPct = lifetime > 0 ? (totalClaimed / lifetime) * 100 : 0

  return (
    <div>
      <div className={styles.metricsGrid}>

        {/* Price */}
        {price?.usd && (
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>Price</div>
            <div className={styles.metricValue}>${parseFloat(price.usd).toFixed(6)}</div>
            {change != null && (
              <div style={{ fontSize: '0.8rem', color: changeColor, marginTop: '0.3rem' }}>
                {changePrefix}{change}% (24h)
              </div>
            )}
          </div>
        )}

        {/* Volume 24h */}
        {volume24h != null && (
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>Volume 24h</div>
            <div className={styles.metricValue}>${formatNumber(volume24h)}</div>
            <div className={styles.metricSubtext}>USD</div>
          </div>
        )}

        {/* Liquidity */}
        {liquidity != null && (
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>Liquidity</div>
            <div className={styles.metricValue}>${formatNumber(liquidity)}</div>
            <div className={styles.metricSubtext}>USD</div>
          </div>
        )}

        {/* Lifetime Fees */}
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Lifetime Fees</div>
          <div className={styles.metricValue}>{formatNumber(lifetime)}</div>
          <div className={styles.metricSubtext}>SOL total</div>
        </div>

        {/* Claimed */}
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Fees Claimed</div>
          <div className={styles.metricValue} style={{ color: '#1aff99' }}>{formatNumber(totalClaimed)}</div>
          <div className={styles.metricSubtext}>SOL ({claimedPct.toFixed(0)}%)</div>
        </div>

        {/* Unclaimed */}
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Unclaimed Fees</div>
          <div className={styles.metricValue} style={{ color: unclaimed > 0 ? '#ff9f43' : '#a8d5ba' }}>
            {formatNumber(unclaimed)}
          </div>
          <div className={styles.metricSubtext}>SOL pending</div>
        </div>

      </div>

      {/* Claimed progress bar */}
      {lifetime > 0 && (
        <div style={{ margin: '1.5rem 0', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Fee Claim Progress</span>
            <span style={{ color: '#1aff99', fontSize: '0.8rem' }}>{claimedPct.toFixed(1)}% claimed</span>
          </div>
          <div style={{ height: '10px', background: 'var(--bg-tertiary)', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${claimedPct}%`, background: 'linear-gradient(90deg, #00d084, #1aff99)', borderRadius: '5px', transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
            <span style={{ color: '#1aff99', fontSize: '0.75rem' }}>✅ {formatNumber(totalClaimed)} SOL claimed</span>
            <span style={{ color: '#ff9f43', fontSize: '0.75rem' }}>⏳ {formatNumber(unclaimed)} SOL pending</span>
          </div>
        </div>
      )}

      {/* Per-claimer breakdown */}
      {claimStats && claimStats.length > 0 && (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--green-light)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
              Claimer Breakdown
            </span>
          </div>
          {claimStats.map((c, i) => (
            <div key={c.wallet} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.25rem', borderBottom: i < claimStats.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
              {c.pfp && (
                <img src={c.pfp} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--green-primary)', objectFit: 'cover' }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'var(--green-light)', fontSize: '0.85rem', fontWeight: 700 }}>
                  {c.username || `${c.wallet.slice(0, 6)}...${c.wallet.slice(-4)}`}
                  {c.isCreator && <span style={{ marginLeft: '0.5rem', background: 'rgba(0,208,132,0.15)', border: '1px solid #00d084', color: '#00d084', padding: '0.1rem 0.4rem', borderRadius: '3px', fontSize: '0.65rem' }}>CREATOR</span>}
                </div>
                {c.twitterUsername && (
                  <div style={{ color: '#1DA1F2', fontSize: '0.75rem' }}>@{c.twitterUsername}</div>
                )}
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{(c.royaltyBps / 100).toFixed(1)}% royalty</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#1aff99', fontSize: '0.9rem', fontWeight: 700 }}>{c.totalClaimed.toFixed(4)} SOL</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>claimed</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
