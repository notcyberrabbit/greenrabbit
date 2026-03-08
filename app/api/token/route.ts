import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

interface FeesResponse {
  success: boolean
  data: {
    lifetimeFeesCollected: number
    creatorFeePercentage: number
    totalFeePercentage: number
    feesCollectedNative: number
    currency: string
  }
}

interface CreatorsResponse {
  success: boolean
  data: {
    address: string
    name?: string
    isVerified: boolean
    createdAt: string
    description?: string
  }[]
}

interface TokenAnalytics {
  address: string
  symbol: string
  name: string
  fees: {
    lifetimeFeesCollected: number
    creatorFeePercentage: number
    totalFeePercentage: number
    feesCollectedNative: number
    currency: string
  }
  creators: {
    address: string
    name?: string
    isVerified: boolean
    createdAt: string
    description?: string
  }[]
}

/**
 * Validate Solana token address format (base58, 43-44 characters)
 */
function isValidTokenAddress(address: string): boolean {
  // Solana token addresses are base58 encoded, typically 43-44 characters
  const base58Regex = /^[1-9A-HJ-NP-Z]{43,44}$/
  return base58Regex.test(address)
}

/**
 * Fetch token lifetime fees from Bags API
 */
async function fetchTokenFees(tokenAddress: string): Promise<FeesResponse['data'] | null> {
  try {
    console.log(`[Bags API] Fetching fees for token: ${tokenAddress}`)

    const response = await axios.get(
      `https://public-api-v2.bags.fm/api/v1/tokens/${tokenAddress}/lifetime-fees`,
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'GreenRabbit/2.0',
        },
      }
    )

    console.log(`[Bags API] Fees response status: ${response.status}`)

    if (response.data.success && response.data.data) {
      console.log(`[Bags API] Fees data:`, {
        lifetimeFeesCollected: response.data.data.lifetimeFeesCollected,
        creatorFeePercentage: response.data.data.creatorFeePercentage,
        totalFeePercentage: response.data.data.totalFeePercentage,
      })
      return response.data.data
    }

    return null
  } catch (error: any) {
    console.error('[Bags API] Fees fetch error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    })
    return null
  }
}

/**
 * Fetch token creators from Bags API
 */
async function fetchTokenCreators(tokenAddress: string): Promise<CreatorsResponse['data'] | []> {
  try {
    console.log(`[Bags API] Fetching creators for token: ${tokenAddress}`)

    const response = await axios.get(
      `https://public-api-v2.bags.fm/api/v1/tokens/${tokenAddress}/creators`,
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'GreenRabbit/2.0',
        },
      }
    )

    console.log(`[Bags API] Creators response status: ${response.status}`)

    if (response.data.success && Array.isArray(response.data.data)) {
      console.log(`[Bags API] Found ${response.data.data.length} creators`)
      return response.data.data
    }

    return []
  } catch (error: any) {
    console.error('[Bags API] Creators fetch error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    })
    return []
  }
}

/**
 * Extract token symbol and name from creators or other sources
 */
function extractTokenInfo(address: string, creators: any[]): { symbol: string; name: string } {
  // Try to get token info from creators data if available
  if (creators.length > 0 && creators[0].name) {
    return {
      symbol: creators[0].name.toUpperCase().slice(0, 6),
      name: creators[0].name,
    }
  }

  // Fallback to shortened address as symbol
  return {
    symbol: address.slice(0, 6).toUpperCase(),
    name: `Token ${address.slice(0, 8)}...`,
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tokenAddress } = await request.json()

    // Validate input
    if (!tokenAddress || typeof tokenAddress !== 'string') {
      return NextResponse.json(
        { error: 'Invalid token address' },
        { status: 400 }
      )
    }

    // Validate token address format
    if (!isValidTokenAddress(tokenAddress.trim())) {
      return NextResponse.json(
        { error: 'Invalid Solana token address format. Must be 43-44 character base58 string.' },
        { status: 400 }
      )
    }

    const cleanAddress = tokenAddress.trim()

    console.log(`[Token Analytics] Starting analysis for: ${cleanAddress}`)

    // Fetch both fees and creators in parallel
    const [feesData, creatorsData] = await Promise.all([
      fetchTokenFees(cleanAddress),
      fetchTokenCreators(cleanAddress),
    ])

    // Check if we got any data
    if (!feesData && creatorsData.length === 0) {
      console.warn(`[Token Analytics] No data found for token: ${cleanAddress}`)
      return NextResponse.json(
        { error: 'Token not found. Please verify the address and try again.' },
        { status: 404 }
      )
    }

    // Extract token info
    const tokenInfo = extractTokenInfo(cleanAddress, creatorsData)

    // Build analytics response
    const tokenAnalytics: TokenAnalytics = {
      address: cleanAddress,
      symbol: tokenInfo.symbol,
      name: tokenInfo.name,
      fees: feesData || {
        lifetimeFeesCollected: 0,
        creatorFeePercentage: 0,
        totalFeePercentage: 0,
        feesCollectedNative: 0,
        currency: 'SOL',
      },
      creators: creatorsData,
    }

    console.log(`[Token Analytics] Analysis complete for: ${cleanAddress}`)

    return NextResponse.json({
      address: cleanAddress,
      tokenAnalytics,
    })
  } catch (error) {
    console.error('[Token API] Fatal error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch token analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
