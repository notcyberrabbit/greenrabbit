import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

interface TokenFees {
  lifetimeFeesCollected: number
  creatorFeePercentage: number
  totalFeePercentage: number
  feesCollectedNative: number
  currency: string
}

interface Creator {
  address: string
  name?: string
  isVerified: boolean
  createdAt: string
  description?: string
}

interface TokenAnalytics {
  address: string
  symbol: string
  name: string
  fees: TokenFees
  creators: Creator[]
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { tokenAddress, analytics } = await request.json()

    if (!analytics || typeof analytics !== 'object') {
      return NextResponse.json(
        { error: 'Invalid token analytics data' },
        { status: 400 }
      )
    }

    // Create a detailed summary of the token for Claude to analyze
    const tokenSummary = generateTokenSummary(tokenAddress, analytics)

    const prompt = `You are a mystical Oracle analyzing Solana token economics and creator profiles on Bags.fm.
A token has been submitted for deep analysis.

TOKEN DATA:
${tokenSummary}

Provide a mystical yet insightful analysis in 2-3 paragraphs. Focus on:
1. Fee Structure Analysis - What do the lifetime fees and percentages reveal about this token's economic model?
2. Creator Profile - What can we infer about the project from creator information?
3. Risk and Opportunity Assessment - What are the key indicators you see?

Use mystical language ("The Rabbit senses...", "The blockchain whispers...", "Ancient patterns show...") but provide genuine insights about the token economics.
Keep it under 350 words. Be honest but diplomatic - token creators want real feedback wrapped in mystical wisdom.`

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-1-20250805',
      max_tokens: 600,
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
      analysis: analysisText || 'The Rabbit senses great potential in this token\'s journey...',
    })
  } catch (error) {
    console.error('[Analysis API] Error:', error)

    // Provide a fallback analysis if API fails
    const fallbackAnalysis = `The Rabbit senses a token with interesting economic properties. The fee structure and creator profile reveal much about the project's design philosophy. 

The lifetime fees collected suggest active trading volume and community engagement. The fee percentages indicate how value is distributed between creators and traders - a careful balance that shapes the token's ecosystem.

The creator information tells a story of dedication and verification status. Together, these elements paint a picture of a token navigating the complex waters of Solana's bustling marketplace. The Rabbit sees promise, if the fundamentals align with community values.`

    return NextResponse.json({
      analysis: fallbackAnalysis,
    })
  }
}

/**
 * Generate a formatted summary of token analytics for Claude
 */
function generateTokenSummary(tokenAddress: string, analytics: TokenAnalytics): string {
  const { fees, creators, symbol, name } = analytics

  let summary = `Token: ${symbol} (${name})
Address: ${tokenAddress}

FEE ANALYTICS:
──────────────────────────────────────────────
Lifetime Fees Collected: ${formatNumber(fees.lifetimeFeesCollected)} ${fees.currency}
Creator Fee Percentage: ${fees.creatorFeePercentage}%
Total Fee Percentage: ${fees.totalFeePercentage}%
Fees (Native): ${formatNumber(fees.feesCollectedNative)} ${fees.currency}

CREATOR INFORMATION:
──────────────────────────────────────────────`

  if (creators && creators.length > 0) {
    creators.forEach((creator, index) => {
      summary += `\n\nCreator ${index + 1}:`
      summary += `\n  Address: ${creator.address.slice(0, 8)}...${creator.address.slice(-8)}`
      if (creator.name) summary += `\n  Name: ${creator.name}`
      summary += `\n  Verified: ${creator.isVerified ? '✓ Yes' : '✗ No'}`
      summary += `\n  Created: ${new Date(creator.createdAt).toLocaleDateString()}`
      if (creator.description) summary += `\n  Description: ${creator.description}`
    })
  } else {
    summary += '\n  No creator information available'
  }

  // Add economic interpretation
  summary += `\n\nECONOMIC INTERPRETATION:
──────────────────────────────────────────────`

  const lifetimeFees = fees.lifetimeFeesCollected
  if (lifetimeFees === 0) {
    summary += `\nNo fees have been collected yet, indicating either a new token or minimal trading activity.`
  } else if (lifetimeFees < 100) {
    summary += `\nLow fee collection suggests early stage or limited trading volume on Bags.fm.`
  } else if (lifetimeFees < 1000) {
    summary += `\nModerate fee collection indicates active community trading and engagement.`
  } else {
    summary += `\nSignificant fee collection reflects substantial trading volume and mature market presence.`
  }

  summary += `\nCreator fee: ${fees.creatorFeePercentage}% | Total fee: ${fees.totalFeePercentage}%`
  summary += `\n\nThis fee structure ${interpreteFeeStructure(fees.creatorFeePercentage, fees.totalFeePercentage)}.`

  return summary
}

/**
 * Format large numbers for display
 */
function formatNumber(num: number): string {
  if (num === 0) return '0'
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
  return num.toFixed(2)
}

/**
 * Interpret fee structure
 */
function interpreteFeeStructure(creatorFee: number, totalFee: number): string {
  const traderFee = totalFee - creatorFee

  if (creatorFee === 0) {
    return 'is unusually creator-free, benefiting traders entirely'
  } else if (creatorFee > traderFee * 2) {
    return 'heavily benefits creators over traders'
  } else if (traderFee > creatorFee * 2) {
    return 'prioritizes trader incentives and adoption'
  } else {
    return 'balances creator and trader incentives'
  }
}
