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

    const prompt = `You are a professional token analytics assistant for Bags.fm on Solana.
TOKEN: ${symbol} (${tokenAddress})
Lifetime Fees: ${fees.lifetimeFeesCollected} SOL
Creator Fee: ${fees.creatorFeePercentage}%
Total Fee: ${fees.totalFeePercentage}%
Creators: ${creators.length > 0 ? creators.map((c: any) => c.name || c.address?.slice(0, 8)).join(', ') : 'Unknown'}

Provide a data-driven analysis in 2-3 paragraphs. Use subtle mystical undertones sparingly. Focus on data-driven insights with occasional poetic phrases. Be concise and professional. Keep it under 250 words.

Always end your response with this exact disclaimer on a new line:
"---
For informational purposes only, reflecting AI-generated insights. Not to be considered official financial, legal, or regulatory advice. Consult a professional before making investment decisions and carefully consider market risks. Content generated with artificial intelligence (AI) with human involvement and editing."`

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
    console.error('[Analysis API] Error status:', error?.status)
    console.error('[Analysis API] Error message:', error?.message)
    console.error('[Analysis API] Error body:', JSON.stringify(error?.error))

    // Billing/credit errors
    const errorMessage = error?.message || error?.error?.error?.message || ''
    const isBillingError =
      error?.status === 400 && (
        errorMessage.includes('credit') ||
        errorMessage.includes('billing') ||
        errorMessage.includes('balance') ||
        error?.error?.error?.message?.includes('credit')
      )

    if (isBillingError) {
      return NextResponse.json({ analysis: null, billingError: true })
    }

    // API key missing
    if (error?.status === 401) {
      return NextResponse.json({ analysis: null, billingError: true })
    }

    // Return fallback for other errors
    return NextResponse.json({
      analysis: `The Rabbit observes this token with quiet curiosity. The fee structure and creator profile reveal the foundations of its journey through the Solana ecosystem. Ancient patterns suggest both promise and caution — as with all things on the blockchain, wisdom lies in patient observation.`,
      billingError: false,
    })
  }
}
