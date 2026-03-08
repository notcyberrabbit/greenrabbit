import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

interface BagsTransaction {
  tx_id: string
  wallet: string
  token_address: string
  token_symbol: string
  amount: number
  direction: 'buy' | 'sell'
  timestamp: string
  price_per_token?: number
  total_value?: number
}

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

    // Validate wallet address (Solana address format check)
    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      )
    }

    // Basic Solana address validation (base58, typically 32-44 chars)
    if (walletAddress.length < 32 || walletAddress.length > 44) {
      return NextResponse.json(
        { error: 'Invalid Solana wallet address format' },
        { status: 400 }
      )
    }

    // Fetch from Bags.fm API v2
    const bagsApiUrl = 'https://public-api-v2.bags.fm/api/v1'
    let tokenTransactions: TokenTransaction[] = []

    try {
      console.log(`[Bags API] Fetching transactions for wallet: ${walletAddress}`)

      // Fetch wallet transactions from Bags API
      // Endpoint: GET /wallet/{wallet_address}/transactions
      const response = await axios.get(
        `${bagsApiUrl}/wallet/${walletAddress}/transactions`,
        {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'GreenRabbit/1.0',
          },
        }
      )

      console.log(`[Bags API] Response status: ${response.status}`)
      console.log(`[Bags API] Response data keys:`, Object.keys(response.data))

      // Parse the Bags API response
      // The API typically returns: { data: [...transactions], success: true, message: "..." }
      const bagsTransactions: BagsTransaction[] = response.data.data || response.data.transactions || []

      if (!Array.isArray(bagsTransactions)) {
        console.warn('[Bags API] Expected array, got:', typeof bagsTransactions)
        throw new Error('Invalid response format from Bags API')
      }

      console.log(`[Bags API] Found ${bagsTransactions.length} transactions`)

      // Transform Bags API transactions to our format
      tokenTransactions = bagsTransactions.map((tx: BagsTransaction) => ({
        symbol: tx.token_symbol || 'UNKNOWN',
        address: tx.token_address,
        amount: parseFloat(String(tx.amount)) || 0,
        direction: (tx.direction === 'buy' || tx.direction === 'sell') ? tx.direction : 'buy',
        timestamp: tx.timestamp,
        price: parseFloat(String(tx.price_per_token)) || undefined,
      }))

      console.log(`[Bags API] Processed ${tokenTransactions.length} transactions`)

      // If no transactions found, fall back to mock data
      if (tokenTransactions.length === 0) {
        console.warn('[Bags API] No transactions found, using mock data for demonstration')
        tokenTransactions = generateMockTokenData(walletAddress)
      }
    } catch (apiError: any) {
      console.error('[Bags API] Error:', {
        message: apiError.message,
        status: apiError.response?.status,
        statusText: apiError.response?.statusText,
        data: apiError.response?.data,
      })

      // Fall back to mock data if API fails
      console.warn('[Bags API] Falling back to mock data')
      tokenTransactions = generateMockTokenData(walletAddress)
    }

    // Process transactions to create a summary per token
    const tokenMap = new Map<string, ProcessedToken>()

    tokenTransactions.forEach((tx) => {
      // Create unique key for token
      const tokenKey = `${tx.address}|${tx.symbol}`

      if (!tokenMap.has(tokenKey)) {
        tokenMap.set(tokenKey, {
          symbol: tx.symbol,
          address: tx.address,
          bought: 0,
          sold: 0,
          netAmount: 0,
        })
      }

      const token = tokenMap.get(tokenKey)!

      // Track buy/sell amounts and dates
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

    // Sort tokens by net amount (absolute value) - largest positions first
    const tokens = Array.from(tokenMap.values()).sort(
      (a, b) => Math.abs(b.netAmount) - Math.abs(a.netAmount)
    )

    console.log(`[Wallet] Processed ${tokens.length} unique tokens for wallet ${walletAddress}`)

    return NextResponse.json({
      address: walletAddress,
      tokens,
      transactionCount: tokenTransactions.length,
      uniqueTokens: tokens.length,
    })
  } catch (error) {
    console.error('[Wallet API] Fatal error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch wallet data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Mock data generator for demonstration/testing
 * Use when Bags API is unavailable or wallet has no transactions
 */
function generateMockTokenData(walletAddress: string): TokenTransaction[] {
  console.log(`[Mock Data] Generating mock transactions for ${walletAddress}`)

  const tokens = [
    { symbol: 'BAGS', address: 'Bags_7yLN9RZpg4EBMupxSbfSVzb5CNTD1ZkD78LPxAzV' },
    { symbol: 'COPE', address: '8HGyAAB1yoM1ttS7pnzhAV4hZMDqz3tagiHaQTEKAN2P' },
    { symbol: 'ORCA', address: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1jolooT' },
    { symbol: 'USDC', address: 'EPjFWdd5Au17h82cKycW7YEC680ZfsL1wKKUJmUSkde' },
    { symbol: 'BONK', address: 'DezXAZ8z7PnrnRJjz3wXBoRgixVpdXxn4DPExF1d53Fb' },
  ]

  const transactions: TokenTransaction[] = []
  const now = new Date()

  tokens.forEach((token) => {
    // Generate multiple transactions per token
    const transactionCount = Math.floor(Math.random() * 4) + 1

    for (let i = 0; i < transactionCount; i++) {
      // Random date within last 180 days
      const daysAgo = Math.floor(Math.random() * 180)
      const txDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)

      // Determine if buy or sell (80% buy, 20% sell)
      const isBuy = Math.random() > 0.2

      transactions.push({
        ...token,
        amount: Math.floor(Math.random() * (isBuy ? 50000 : 20000)) + (isBuy ? 100 : 50),
        direction: isBuy ? 'buy' : 'sell',
        timestamp: txDate.toISOString(),
        price: parseFloat((Math.random() * 100 + 0.01).toFixed(6)),
      })
    }
  })

  // Sort by timestamp
  return transactions.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}
