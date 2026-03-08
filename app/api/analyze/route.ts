import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { tokenAddress, analytics } = await request.json()

    if (!analytics || typeof analytics !== 'object') {
      return NextResponse.json({ error: 'Invalid token analytics data' }, { status: 400 })
    }

    const { fees, creators, symbol } = analytics

    const prompt = `You are a mystical Oracle analyzing Solana token economics on Bags.fm.

TOKEN: ${symbol} (${tokenAddress})
Lifetime Fees: ${fees.lifetimeFeesCollected} SOL
Creator Fee: ${fees.creatorFeePercentage}%
Total Fee: ${fees.totalFeePercentage}%
Creators: ${creators.length > 0 ? creators.map((c: any) => c.name || c.address?.slice(0, 8)).join(', ') : 'Unknown'}

Provide a mystical yet insightful analysis in 2-3 paragraphs using language like "The Rabbit senses...", "The blockchain whispers...". Focus on fee structure, creator profile, and opportunities. Keep it under 300 words.`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    })

    const analysisText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => (block.type === 'text' ? block.text : ''))
      .join('\n')

    return NextResponse.json({ analysis: analysisText })

  } catch (error: any) {
    console.error('[Analysis API] Error:', error)

    // Check if it's a credit/billing error
    const isBillingError = error?.status === 400 &&
      error?.error?.error?.message?.includes('credit balance')

    if (isBillingError) {
      return NextResponse.json({
        analysis: null,
        billingError: true,
      })
    }

    // Other errors - return fallback
    return NextResponse.json({
      analysis: `The Rabbit observes this token with quiet curiosity. The fee structure and creator profile reveal the foundations of its journey through the Solana ecosystem. Ancient patterns suggest both promise and caution — as with all things on the blockchain, wisdom lies in patient observation.`,
      billingError: false,
    })
  }
}
