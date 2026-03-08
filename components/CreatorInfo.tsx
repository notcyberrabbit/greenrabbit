import styles from '@/app/page.module.css'

interface Creator {
  address: string
  name?: string
  isVerified: boolean
  createdAt: string
  description?: string
}

interface CreatorInfoProps {
  creators: Creator[]
}

export default function CreatorInfo({ creators }: CreatorInfoProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  if (!creators || creators.length === 0) {
    return (
      <div className={styles.card}>
        <p className={styles.noData}>No creator information available</p>
      </div>
    )
  }

  return (
    <div className={styles.creatorsGrid}>
      {creators.map((creator, index) => (
        <div key={creator.address} className={styles.creatorCard}>
          <div className={styles.creatorHeader}>
            <div>
              <h3 className={styles.creatorName}>
                {creator.name ? creator.name : `Creator ${index + 1}`}
              </h3>
              <p className={styles.creatorAddress}>
                {creator.address.slice(0, 8)}...{creator.address.slice(-8)}
              </p>
            </div>
            {creator.isVerified && (
              <span className={styles.verifiedBadge}>✓ Verified</span>
            )}
            {!creator.isVerified && (
              <span className={styles.unverifiedBadge}>⊘ Unverified</span>
            )}
          </div>

          <div className={styles.creatorDetails}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Created</span>
              <span className={styles.detailValue}>{formatDate(creator.createdAt)}</span>
            </div>

            {creator.description && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Description</span>
                <span className={styles.detailValue}>{creator.description}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
