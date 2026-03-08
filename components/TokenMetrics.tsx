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
}

export default function TokenMetrics({ metrics }: TokenMetricsProps) {
  const formatNumber = (num: number) => {
    if (num === 0) return '0'
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
    return num.toFixed(4)
  }

  const traderFee = metrics.totalFeePercentage - metrics.creatorFeePercentage

  return (
    <div className={styles.metricsGrid}>
      {/* Lifetime Fees */}
      <div className={styles.metricCard}>
        <div className={styles.metricLabel}>Lifetime Fees Collected</div>
        <div className={styles.metricValue}>{formatNumber(metrics.lifetimeFeesCollected)}</div>
        <div className={styles.metricSubtext}>{metrics.currency}</div>
      </div>

      {/* Native Fees */}
      <div className={styles.metricCard}>
        <div className={styles.metricLabel}>Fees (Native)</div>
        <div className={styles.metricValue}>{formatNumber(metrics.feesCollectedNative)}</div>
        <div className={styles.metricSubtext}>{metrics.currency}</div>
      </div>

      {/* Creator Fee */}
      <div className={styles.metricCard}>
        <div className={styles.metricLabel}>Creator Fee %</div>
        <div className={styles.metricValue}>{metrics.creatorFeePercentage.toFixed(2)}%</div>
        <div className={styles.metricSubtext}>Of total fees</div>
      </div>

      {/* Trader Fee */}
      <div className={styles.metricCard}>
        <div className={styles.metricLabel}>Trader Fee %</div>
        <div className={styles.metricValue}>{traderFee.toFixed(2)}%</div>
        <div className={styles.metricSubtext}>Of total fees</div>
      </div>

      {/* Total Fee */}
      <div className={styles.metricCard}>
        <div className={styles.metricLabel}>Total Fee %</div>
        <div className={styles.metricValue}>{metrics.totalFeePercentage.toFixed(2)}%</div>
        <div className={styles.metricSubtext}>Per transaction</div>
      </div>

      {/* Fee Split Visualization */}
      <div className={styles.metricCard}>
        <div className={styles.metricLabel}>Fee Split Ratio</div>
        <div className={styles.feeVisualization}>
          <div
            className={styles.creatorBar}
            style={{ width: `${metrics.creatorFeePercentage}%` }}
            title={`Creator: ${metrics.creatorFeePercentage}%`}
          />
          <div
            className={styles.traderBar}
            style={{ width: `${traderFee}%` }}
            title={`Trader: ${traderFee}%`}
          />
        </div>
        <div className={styles.feeLegend}>
          <span className={styles.creatorLegend}>Creator</span>
          <span className={styles.traderLegend}>Trader</span>
        </div>
      </div>
    </div>
  )
}
