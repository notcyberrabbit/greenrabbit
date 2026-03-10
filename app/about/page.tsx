import type { Metadata } from 'next'
import styles from './about.module.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About — GreenRabbitApp',
  description: 'Learn about GreenRabbitApp — the AI-powered token analytics dashboard for Bags.fm on Solana.',
}

export default function AboutPage() {
  return (
    <main style={{ minHeight: '100vh', paddingBottom: '4rem' }}>

      {/* Header */}
      <header style={{ position: 'relative', padding: '4rem 2rem 3rem', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '500px', height: '300px', background: 'radial-gradient(ellipse at center, rgba(0, 208, 132, 0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🐇</div>
          <h1 style={{ fontSize: '3rem', fontFamily: 'Orbitron, monospace', color: '#1aff99', textShadow: '0 0 20px rgba(0,208,132,0.3)', marginBottom: '1rem' }}>
            GreenRabbitApp
          </h1>
          <p style={{ color: '#a8d5ba', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Token Analytics Dashboard for Bags.fm — powered by AI & Solana
          </p>
        </div>
      </header>

      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem' }}>

        {/* What is it */}
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '2rem', borderLeft: '3px solid #00d084' }}>
            <h2 style={{ fontFamily: 'Orbitron, monospace', color: '#1aff99', fontSize: '1.3rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              What is GreenRabbit?
            </h2>
            <p style={{ color: '#a8d5ba', lineHeight: '1.8', marginBottom: '1rem' }}>
              GreenRabbit is an open analytics dashboard built on top of the <strong style={{ color: '#00d084' }}>Bags.fm API</strong>. It lets anyone analyze any Solana token launched on Bags.fm — no wallet required.
            </p>
            <p style={{ color: '#a8d5ba', lineHeight: '1.8' }}>
              The green rabbit appears where others see noise. It does not predict. It observes.
            </p>
          </div>
        </section>

        {/* Features */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'Orbitron, monospace', color: '#1aff99', fontSize: '1.3rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Features
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {[
              { icon: '📊', title: 'Fee Analytics', desc: 'Lifetime fees, claimed vs unclaimed, per-claimer breakdown' },
              { icon: '🤖', title: 'AI Analysis', desc: 'Claude-powered insights on every token' },
              { icon: '⚖️', title: 'Token Compare', desc: 'Compare up to 10 tokens side by side' },
              { icon: '👤', title: 'Creator Info', desc: 'Verified creator profiles and royalty data' },
              { icon: '💰', title: 'Market Data', desc: 'Live price, volume, and liquidity from Dexscreener' },
              { icon: '🔗', title: 'Shareable Links', desc: 'Share any token analysis with a direct URL' },
            ].map(f => (
              <div key={f.title} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '1.25rem', transition: 'all 0.2s ease' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{f.icon}</div>
                <div style={{ color: '#00d084', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase' }}>{f.title}</div>
                <div style={{ color: '#a8d5ba', fontSize: '0.82rem', lineHeight: '1.5' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Tech stack */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'Orbitron, monospace', color: '#1aff99', fontSize: '1.3rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Built With
          </h2>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.5rem' }}>
            {[
              { name: 'Bags.fm API', desc: 'Fee data, creator analytics, claim stats' },
              { name: 'Anthropic Claude', desc: 'AI-powered token analysis' },
              { name: 'Dexscreener API', desc: 'Live price, volume, liquidity data' },
              { name: 'Next.js 14', desc: 'React framework with App Router' },
              { name: 'Solana Web3.js', desc: 'Blockchain interaction layer' },
              { name: 'Vercel', desc: 'Deployment and hosting' },
            ].map((t, i, arr) => (
              <div key={t.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                <span style={{ color: '#00d084', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'Space Mono, monospace' }}>{t.name}</span>
                <span style={{ color: '#a8d5ba', fontSize: '0.82rem' }}>{t.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Hackathon */}
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ background: 'rgba(0, 208, 132, 0.05)', border: '2px solid #00d084', borderRadius: '8px', padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🏆</div>
            <h2 style={{ fontFamily: 'Orbitron, monospace', color: '#1aff99', fontSize: '1.2rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Bags.fm Hackathon Q1 2026
            </h2>
            <p style={{ color: '#a8d5ba', lineHeight: '1.7', maxWidth: '500px', margin: '0 auto' }}>
              GreenRabbitApp was built for the Bags.fm Q1 2026 hackathon. It integrates the Bags.fm API and Claude AI to create a unique token analytics experience on Solana.
            </p>
          </div>
        </section>

        {/* Back button */}
        <div style={{ textAlign: 'center' }}>
          <Link href="/" style={{ display: 'inline-block', background: '#00d084', color: '#0a0e27', padding: '0.85rem 2rem', borderRadius: '4px', fontFamily: 'Space Mono, monospace', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none', fontSize: '0.9rem' }}>
            🐇 Open App
          </Link>
        </div>
          <p>*-*
          </p>
         {/* Creator button */}
        <div style={{ textAlign: 'center' }}>
          <Link href="https://x.com/NotCyberRabbit" style={{ display: 'inline-block', background: '#00d084', color: '#0a0e27', padding: '0.85rem 2rem', borderRadius: '4px', fontFamily: 'Space Mono, monospace', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none', fontSize: '0.9rem' }}>
            💎 NotCyberRabbit on X
          </Link>
        </div>
      </div>

      <footer style={{ marginTop: '4rem', padding: '2rem', textAlign: 'center', color: '#5a6f68', borderTop: '1px solid var(--border-color)', fontSize: '0.9rem', fontFamily: 'Space Mono, monospace' }}>
        🐰 GreenRabbitApp — Token Analytics Powered by AI & Bags.fm
      </footer>
    </main>
  )
}
