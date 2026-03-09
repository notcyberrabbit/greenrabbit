import { NextRequest, NextResponse } from 'next/server'
import { BagsSDK } from '@bagsfm/bags-sdk'
import { PublicKey, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js'

function isValidTokenAddress(address: string): boolean {
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
  return base58Regex.test(address)
}

async function fetchTokenMetadata(tokenAddress: string) {
  try {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`,
      { next: { revalidate: 60 } }
    )
    const data = await response.json()
    const pair = data.pairs?.[0]
    if (pair) {
      return {
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol,
      }
    }
    return null
  } catch (e) {
    console.error('[Dexscreener] Error:', e)
    return null
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
    const BAGS_API_KEY = process.env.BAGS_API_KEY
    const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL

    if (!BAGS_API_KEY || !SOLANA_RPC_URL) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const connection = new Connection(SOLANA_RPC_URL, 'processed')
    const sdk = new BagsSDK(BAGS_API_KEY, connection, 'processed')
    const tokenMint = new PublicKey(cleanAddress)

    let feesInSol = 0
    let creators: any[] = []

    // Fetch all data in parallel
    const [feesResult, creatorsResult, metadata] = await Promise.allSettled([
      sdk.state.getTokenLifetimeFees(tokenMint),
      sdk.state.getTokenCreators(tokenMint),
      fetchTokenMetadata(cleanAddress),
    ])

    if (feesResult.status === 'fulfilled') {
      feesInSol = Number(feesResult.value) / LAMPORTS_PER_SOL
    } else {
      console.error('[Bags SDK] Fees error:', feesResult.reason)
    }

    if (creatorsResult.status === 'fulfilled') {
      creators = creatorsResult.value.map((c: any) => ({
        address: c.wallet,
        name: c.providerUsername ?? c.username ?? null,
        provider: c.provider ?? null,
        pfp: c.pfp ?? null,
        royaltyPercent: c.royaltyBps / 100,
        isCreator: c.isCreator,
        isVerified: !!c.providerUsername,
        createdAt: new Date().toISOString(),
      }))
    } else {
      console.error('[Bags SDK] Creators error:', creatorsResult.reason)
    }

    if (feesInSol === 0 && creators.length === 0) {
      return NextResponse.json(
        { error: 'Token not found on Bags.fm. Please verify the address.' },
        { status: 404 }
      )
    }

    const tokenMeta = metadata.status === 'fulfilled' ? metadata.value : null

    return NextResponse.json({
      address: cleanAddress,
      tokenAnalytics: {
        address: cleanAddress,
        symbol: tokenMeta?.symbol || cleanAddress.slice(0, 6).toUpperCase(),
        name: tokenMeta?.name || `Token ${cleanAddress.slice(0, 8)}...`,
        fees: {
          lifetimeFeesCollected: feesInSol,
          feesCollectedNative: feesInSol,
          creatorFeePercentage: 0,
          totalFeePercentage: 0,
          currency: 'SOL',
        },
        creators,
      },
    })
  } catch (error) {
    console.error('[Token API] Fatal error:', error)
    return NextResponse.json({ error: 'Failed to fetch token analytics' }, { status: 500 })
  }
}
