import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GreenRabbitApp',
  description: 'Token Analytics Dashboard for Bags.fm — AI-powered insights, fee tracking, and creator analytics on Solana.',
  openGraph: {
    title: 'GreenRabbitApp',
    description: 'Token Analytics Dashboard for Bags.fm',
    url: 'https://greenrabbit-app.vercel.app',
    siteName: 'GreenRabbitApp',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Orbitron:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
