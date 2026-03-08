import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

interface Token {
  symbol: string
  address: string
  bought: number
  sold: number
  netAmount: number
  buyDate?: string
  sellDate?: string
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, tokens } = await request.json()

    if (!tokens || !Array.isArray(tokens)) {
      return NextResponse.json(
        { error: 'Invalid token data' },
        { status: 400 }
      )
    }

    // Create a detailed summary of the wallet for Claude to analyze
    const walletSummary = generateWalletSummary(walletAddress, tokens)

    const prompt = `You are a mystical Oracle analyzing Solana blockchain trading patterns. 
A trader has submitted their Bags.fm token portfolio for analysis. 

WALLET DATA:
${walletSummary}

Provide a mystical yet insightful analysis in 2-3 paragraphs. Focus on:
1. Trading patterns and behavior (aggressive vs conservative, frequency, diversification)
2. Risk indicators and potential warning signs
3. Notable strengths or weaknesses in their portfolio strategy

Use mystical language ("The Rabbit senses...", "The blockchain whispers...") but provide genuine trading insights.
Keep it under 300 words. Be honest but diplomatic - this trader wants real feedback wrapped in mystical wisdom.`

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-1-20250805',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // Extract text from the response
    const analysisText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => (block.type === 'text' ? block.text : ''))
      .join('\n')

    return NextResponse.json({
      analysis: analysisText || 'The Rabbit senses great potential in your journey...',
    })
  } catch (error) {
    console.error('Analysis API error:', error)

    // Provide a fallback analysis if API fails
    const fallbackAnalysis = `The Rabbit senses a complex dance of digital tokens in your wallet. Your portfolio reflects both boldness and caution—a trader who understands the volatile nature of emerging tokens. The patterns suggest an explorer of opportunity, sometimes quick to act, always learning from the blockchain's eternal lessons.

Remember: the Rabbit knows that every transaction is a story, and every loss a teacher. Your journey in the Bags.fm ecosystem shows promise. Continue with wisdom, for the blockchain rewards those who learn from their mistakes.`

    return NextResponse.json({
      analysis: fallbackAnalysis,
    })
  }
}

function generateWalletSummary(walletAddress: string, tokens: Token[]): string {
  const totalTokens = tokens.length
  const activeTokens = tokens.filter((t) => t.netAmount !== 0).length
  const profitableTokens = tokens.filter((t) => t.netAmount > 0).length
  const lossTokens = tokens.filter((t) => t.netAmount < 0).length

  let summary = `Wallet: ${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}

PORTFOLIO OVERVIEW:
- Total unique tokens traded: ${totalTokens}
- Currently held: ${activeTokens}
- Profitable positions: ${profitableTokens}
- Loss positions: ${lossTokens}

TOKEN DETAILS:\n`

  tokens.slice(0, 10).forEach((token) => {
    const status = token.netAmount > 0 ? '✓ LONG' : '✗ SHORT'
    const absoluteAmount = Math.abs(token.netAmount)

    summary += `\n${token.symbol} (${status}):
  - Bought: ${formatNumber(token.bought)} | Sold: ${formatNumber(token.sold)}
  - Net Position: ${formatNumber(absoluteAmount)} (${token.netAmount > 0 ? '+' : '-'})
  - Buy Date: ${token.buyDate ? new Date(token.buyDate).toLocaleDateString() : 'Unknown'}
  - Sell Date: ${token.sellDate ? new Date(token.sellDate).toLocaleDateString() : 'Still Holding'}`
  })

  if (tokens.length > 10) {
    summary += `\n... and ${tokens.length - 10} more tokens`
  }

  // Add trading pattern analysis
  const avgHoldTime = calculateAverageHoldTime(tokens)
  const diversification = (activeTokens / totalTokens * 100).toFixed(1)

  summary += `\n\nTRADING PATTERNS:
- Portfolio diversification: ${diversification}%
- Average hold time: ${avgHoldTime}
- Trading style: ${tokens.some((t) => t.sellDate) ? 'Active trader' : 'Collector/Holder'}`

  return summary
}

function formatNumber(num: number): string {
  if (num === 0) return '0'
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
  return num.toFixed(2)
}

function calculateAverageHoldTime(tokens: Token[]): string {
  const holdTimes: number[] = []

  tokens.forEach((token) => {
    if (token.buyDate) {
      const buyDate = new Date(token.buyDate)
      const sellDate = token.sellDate ? new Date(token.sellDate) : new Date()
      const holdMs = sellDate.getTime() - buyDate.getTime()
      const holdDays = Math.floor(holdMs / (1000 * 60 * 60 * 24))
      if (holdDays > 0) holdTimes.push(holdDays)
    }
  })

  if (holdTimes.length === 0) return 'New trader'
  const avgDays = Math.round(holdTimes.reduce((a, b) => a + b) / holdTimes.length)

  if (avgDays < 7) return `${avgDays} days (Very Active)`
  if (avgDays < 30) return `${avgDays} days (Active)`
  if (avgDays < 90) return `${avgDays} days (Medium term)`
  return `${avgDays} days (Long term)`
}
