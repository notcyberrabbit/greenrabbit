import { useState } from 'react'
import { Search } from 'lucide-react'
import styles from '@/app/page.module.css'

interface WalletFormProps {
  onSubmit: (address: string) => void
  loading: boolean
}

export default function WalletForm({ onSubmit, loading }: WalletFormProps) {
  const [address, setAddress] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (address.trim()) {
      onSubmit(address.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.formSection}>
      <div className={styles.formCard}>
        <div className={styles.formGroup}>
          <label htmlFor="wallet" className={styles.formLabel}>
            Solana Wallet Address
          </label>
          <input
            id="wallet"
            type="text"
            className={styles.formInput}
            placeholder="Enter your Solana wallet address (base58)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={loading || !address.trim()}
        >
          <Search size={18} />
          {loading ? 'Analyzing...' : 'Analyze Wallet'}
        </button>
      </div>
    </form>
  )
}
