import styles from '@/app/page.module.css'

interface Link {
  type?: string
  label?: string
  url: string
}

interface TokenProfileProps {
  icon?: string | null
  description?: string | null
  links?: Link[]
}

export default function TokenProfile({ icon, description, links }: TokenProfileProps) {
  if (!icon && !description && (!links || links.length === 0)) return null

  const getLinkLabel = (link: Link) => {
    if (link.type === 'twitter') return '🐦 Twitter/X'
    if (link.type === 'telegram') return '✈️ Telegram'
    if (link.type === 'discord') return '💬 Discord'
    if (link.label) return `🔗 ${link.label}`
    return '🌐 Website'
  }

  return (
    <div className={styles.card}>
      <div style={{display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap'}}>
        
        {/* Icon */}
        {icon && (
          <img
            src={icon}
            alt="Token icon"
            style={{width: '80px', height: '80px', borderRadius: '50%', border: '2px solid #00d084', objectFit: 'cover'}}
          />
        )}

        <div style={{flex: 1}}>
          {/* Description */}
          {description && (
            <p style={{color: '#a8d5ba', marginBottom: '1rem', lineHeight: '1.6'}}>
              {description}
            </p>
          )}

          {/* Social Links */}
          {links && links.length > 0 && (
            <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
              {links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#00d084',
                    border: '1px solid #00d084',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                  }}
                >
                  {getLinkLabel(link)}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
