import { useState } from 'react'
import { Search } from 'lucide-react'
import styles from '@/app/page.module.css'

interface TokenFormProps {
  onSubmit: (address: string) => void
  loading: boolean
}

export default function TokenForm({ onSubmit, loading }: TokenFormProps) {
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
          <label htmlFor="token" className={styles.formLabel}>
            Token Address (Solana)
          </label>
          <input
            id="token"
            type="text"
            className={styles.formInput}
            placeholder="Enter token address (43-44 characters, base58)"
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
          {loading ? 'Analyzing...' : 'Analyze Token'}
        </button>
      </div>
    </form>
  )
}
