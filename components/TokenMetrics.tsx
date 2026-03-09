import styles from '@/app/page.module.css'

interface Fees {
  lifetimeFeesCollected: number
  creatorFeePercentage: number
  totalFeePercentage: number
  feesCollectedNative: number
  currency: string
}

interface TokenMetricsProps {
  metrics: Fees
  price?: { usd: string | null, change24h: number | null }
  volume24h?: number | null
  liquidity?: number | null
}

export default function TokenMetrics({ metrics, price, volume24h, liquidity }: TokenMetricsProps) {
  const formatNumber = (num: number) => {
    if (num === 0) return '0'
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
    return num.toFixed(4)
  }

  const traderFee = metrics.totalFeePercentage - metrics.creatorFeePercentage
  const change = price?.change24h
  const changeColor = change === null || change === undefined ? '#a8d5ba' : change >= 0 ? '#00d084' : '#ff6b6b'
  const changePrefix = change && change > 0 ? '+' : ''

  return (
    <div className={styles.metricsGrid}>

      {/* Price */}
      {price?.usd && (
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Price</div>
          <div className={styles.metricValue}>${parseFloat(price.usd).toFixed(6)}</div>
          {change !== null && change !== undefined && (
            <div className={styles.metricSubtext} style={{color: changeColor}}>
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
        <div className={styles.metricValue}>{formatNumber(metrics.lifetimeFeesCollected)}</div>
        <div className={styles.metricSubtext}>{metrics.currency}</div>
      </div>

      {/* Creator Fee */}
      <div className={styles.metricCard}>
        <div className={styles.metricLabel}>Creator Fee %</div>
        <div className={styles.metricValue}>{metrics.creatorFeePercentage.toFixed(2)}%</div>
        <div className={styles.metricSubtext}>Of total fees</div>
      </div>

      {/* Total Fee */}
      <div className={styles.metricCard}>
        <div className={styles.metricLabel}>Total Fee %</div>
        <div className={styles.metricValue}>{metrics.totalFeePercentage.toFixed(2)}%</div>
        <div className={styles.metricSubtext}>Per transaction</div>
      </div>
{/* Trader Fee */}
<div className={styles.metricCard}>
  <div className={styles.metricLabel}>Trader Fee %</div>
  <div className={styles.metricValue}>{traderFee.toFixed(2)}%</div>
  <div className={styles.metricSubtext}>Of total fees</div>
</div>

{/* Fee Split */}
<div className={styles.metricCard}>
  <div className={styles.metricLabel}>Fee Split Ratio</div>
  <div className={styles.feeVisualization}>
    <div className={styles.creatorBar} style={{ width: `${metrics.creatorFeePercentage}%` }} />
    <div className={styles.traderBar} style={{ width: `${traderFee}%` }} />
  </div>
  <div className={styles.feeLegend}>
    <span className={styles.creatorLegend}>Creator</span>
    <span className={styles.traderLegend}>Trader</span>
  </div>
</div>
    </div>
  )
}
