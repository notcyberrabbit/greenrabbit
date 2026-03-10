'use client'
import { useState } from 'react'
import { Search } from 'lucide-react'
import styles from '@/app/page.module.css'

interface TokenFormProps {
  onSubmit: (address: string) => void
  loading: boolean
  placeholder?: string
}

export default function TokenForm({ onSubmit, loading, placeholder }: TokenFormProps) {
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
        <label className={styles.formLabel}>
          Token Address (Solana)
        </label>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            className={styles.formInput}
            placeholder={placeholder || 'Enter token address (base58)'}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={loading}
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading || !address.trim()}
          >
            <Search size={16} />
            {loading ? 'Analyzing...' : 'Analyze Token'}
          </button>
        </div>
      </div>
    </form>
  )
}
