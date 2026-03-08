import { Sparkles } from 'lucide-react'
import styles from '@/app/page.module.css'

interface AnalysisProps {
analysis: string | null
  loading: boolean
}

export default function Analysis({ analysis, loading }: AnalysisProps) {
  return (
    <div className={styles.analysisSection}>
      <h2 className={styles.analysisTitle}>
        <Sparkles size={28} className={styles.analysisIcon} />
        The Rabbit Sees...
      </h2>

      {loading ? (
        <div className={styles.analysisLoading}>
          <div className={styles.spinner}></div>
          <p>Channeling the ancient wisdom of the blockchain...</p>
        </div>
      ) : (
        <div className={styles.analysisContent}>
 {analysis || ''}
        </div>
      )}
    </div>
  )
}
