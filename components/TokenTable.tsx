import styles from '@/app/page.module.css'

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

interface TokenTableProps {
  tokens: Token[]
}

export default function TokenTable({ tokens }: TokenTableProps) {
  const formatNumber = (num: number) => {
    if (num === 0) return '0'
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
    return num.toFixed(2)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
    } catch {
      return dateString
    }
  }

  return (
    <div className={styles.tableWrapper}>
      <table>
        <thead>
          <tr>
            <th>Token</th>
            <th>Bought</th>
            <th>Sold</th>
            <th>Net Amount</th>
            <th>Buy Date</th>
            <th>Sell Date</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
            <tr key={token.address}>
              <td className={styles.tokenSymbol}>{token.symbol}</td>
              <td className={styles.buyAmount}>
                {token.bought > 0 ? formatNumber(token.bought) : '—'}
              </td>
              <td className={styles.sellAmount}>
                {token.sold > 0 ? formatNumber(token.sold) : '—'}
              </td>
              <td>
                <span className={token.netAmount > 0 ? styles.buyAmount : styles.sellAmount}>
                  {formatNumber(Math.abs(token.netAmount))}
                </span>
              </td>
              <td>{formatDate(token.buyDate)}</td>
              <td>{formatDate(token.sellDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
