import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

interface TokenTransaction {
  symbol: string
  address: string
  amount: number
  direction: 'buy' | 'sell'
  timestamp: string
  price?: number
}

interface ProcessedToken {
  symbol: string
  address: string
  bought: number
  sold: number
  netAmount: number
  buyDate?: string
  sellDate?: string
  totalSpent?: number
  totalEarned?: number
}

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json()

    // Validate wallet address (basic Solana address check)
    if (!walletAddress || typeof walletAddress !== 'string' || walletAddress.length < 32) {
      return NextResponse.json(
        { error: 'Invalid Solana wallet address' },
        { status: 400 }
      )
    }

    // Fetch from Bags API
    // Note: You may need to adjust the endpoint based on Bags.fm API documentation
    const bagsApiUrl = process.env.NEXT_PUBLIC_BAGS_API_URL || 'https://api.bags.fm'
    const apiKey = process.env.NEXT_PUBLIC_BAGS_API_KEY

    let tokenTransactions: TokenTransaction[] = []

    try {
      // Example endpoint - adjust based on actual Bags API
      const response = await axios.get(
        `${bagsApiUrl}/wallet/${walletAddress}/tokens`,
        {
          headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
          timeout: 10000,
        }
      )

      tokenTransactions = response.data.tokens || []
    } catch (apiError) {
      console.error('Bags API error:', apiError)

      // Return mock data for demonstration
      // Remove this in production when API is fully integrated
      tokenTransactions = generateMockTokenData(walletAddress)
    }

    // Process transactions to create a summary per token
    const tokenMap = new Map<string, ProcessedToken>()

    tokenTransactions.forEach((tx) => {
      if (!tokenMap.has(tx.address)) {
        tokenMap.set(tx.address, {
          symbol: tx.symbol,
          address: tx.address,
          bought: 0,
          sold: 0,
          netAmount: 0,
        })
      }

      const token = tokenMap.get(tx.address)!

      if (tx.direction === 'buy') {
        token.bought += tx.amount
        token.netAmount += tx.amount
        if (!token.buyDate || new Date(tx.timestamp) < new Date(token.buyDate)) {
          token.buyDate = tx.timestamp
        }
      } else if (tx.direction === 'sell') {
        token.sold += tx.amount
        token.netAmount -= tx.amount
        if (!token.sellDate || new Date(tx.timestamp) > new Date(token.sellDate)) {
          token.sellDate = tx.timestamp
        }
      }
    })

    const tokens = Array.from(tokenMap.values()).sort(
      (a, b) => Math.abs(b.netAmount) - Math.abs(a.netAmount)
    )

    return NextResponse.json({
      address: walletAddress,
      tokens,
    })
  } catch (error) {
    console.error('Wallet API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wallet data' },
      { status: 500 }
    )
  }
}

// Mock data generator for demonstration
function generateMockTokenData(walletAddress: string): TokenTransaction[] {
  const tokens = [
    { symbol: 'BAGS', address: 'BagsxQLZ6qJqz2PN1N6JxVMVkUHYkxjYx1234567890' },
    { symbol: 'LUNA', address: 'LunaEKLWMSLr3qH4kYQvH5YkxjYx1234567890' },
    { symbol: 'MINT', address: 'MintEKLWMSLr3qH4kYQvH5YkxjYx1234567890' },
    { symbol: 'COPE', address: 'CopeEKLWMSLr3qH4kYQvH5YkxjYx1234567890' },
  ]

  const transactions: TokenTransaction[] = []
  const now = new Date()

  tokens.forEach((token) => {
    const buyDate = new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000)
    transactions.push({
      ...token,
      amount: Math.floor(Math.random() * 10000) + 1000,
      direction: 'buy',
      timestamp: buyDate.toISOString(),
    })

    if (Math.random() > 0.5) {
      const sellDate = new Date(buyDate.getTime() + Math.random() * 60 * 24 * 60 * 60 * 1000)
      transactions.push({
        ...token,
        amount: Math.floor(Math.random() * 8000) + 500,
        direction: 'sell',
        timestamp: sellDate.toISOString(),
      })
    }
  })

  return transactions
}
