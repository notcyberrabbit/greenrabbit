import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

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

function isValidTokenAddress(address: string): boolean {
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
  return base58Regex.test(address)
}

async function fetchTokenFees(tokenAddress: string) {
  try {
    const response = await axios.get(
      `https://public-api-v2.bags.fm/api/v1/tokens/${tokenAddress}/lifetime-fees`,
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.BAGS_API_KEY || '',
        },
      }
    )
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    return null
  } catch (error: any) {
    console.error('[Bags API] Fees error:', error.message)
    return null
  }
}

async function fetchTokenCreators(tokenAddress: string) {
  try {
    const response = await axios.get(
      `https://public-api-v2.bags.fm/api/v1/tokens/${tokenAddress}/creators`,
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.BAGS_API_KEY || '',
        },
      }
    )
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data
    }
    return []
  } catch (error: any) {
    console.error('[Bags API] Creators error:', error.message)
    return []
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tokenAddress } = await request.json()

    if (!tokenAddress || typeof tokenAddress !== 'string') {
      return NextResponse.json({ error: 'Invalid token address' }, { status: 400 })
    }

    if (!isValidTokenAddress(tokenAddress.trim())) {
      return NextResponse.json({ error: 'Invalid Solana token address format.' }, { status: 400 })
    }

    const cleanAddress = tokenAddress.trim()

    const [feesData, creatorsData] = await Promise.all([
      fetchTokenFees(cleanAddress),
      fetchTokenCreators(cleanAddress),
    ])

    if (!feesData && creatorsData.length === 0) {
      return NextResponse.json(
        { error: 'Token not found on Bags.fm. Please verify the address.' },
        { status: 404 }
      )
    }

    const tokenAnalytics: TokenAnalytics = {
      address: cleanAddress,
      symbol: cleanAddress.slice(0, 6).toUpperCase(),
      name: `Token ${cleanAddress.slice(0, 8)}...`,
      fees: feesData || {
        lifetimeFeesCollected: 0,
        creatorFeePercentage: 0,
        totalFeePercentage: 0,
        feesCollectedNative: 0,
        currency: 'SOL',
      },
      creators: creatorsData,
    }

    return NextResponse.json({ address: cleanAddress, tokenAnalytics })
  } catch (error) {
    console.error('[Token API] Fatal error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch token analytics' },
      { status: 500 }
    )
  }
}
