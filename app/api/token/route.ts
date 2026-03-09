import { NextRequest, NextResponse } from 'next/server'
import { BagsSDK } from '@bagsfm/bags-sdk'
import { PublicKey, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js'

function isValidTokenAddress(address: string): boolean {
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
  return base58Regex.test(address)
}

async function fetchTokenMetadata(tokenAddress: string) {
  try {
    // Get price, volume, liquidity
    const pairsRes = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`
    )
    const pairsData = await pairsRes.json()
    const pair = pairsData.pairs?.[0]

    // Get icon, description, social links
    const profileRes = await fetch(
      `https://api.dexscreener.com/token-profiles/latest/v1?token=${tokenAddress}`
    )
    const profileData = await profileRes.json()
    const profile = Array.isArray(profileData)
      ? profileData.find((p: any) => p.tokenAddress === tokenAddress)
      : null

    return {
      name: pair?.baseToken?.name || null,
      symbol: pair?.baseToken?.symbol || null,
      priceUsd: pair?.priceUsd || null,
      priceChange24h: pair?.priceChange?.h24 || null,
      volume24h: pair?.volume?.h24 || null,
      liquidity: pair?.liquidity?.usd || null,
      icon: profile?.icon || null,
      description: profile?.description || null,
      links: profile?.links || [],
    }
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

    const [feesResult, creatorsResult, metadata] = await Promise.allSettled([
      sdk.state.getTokenLifetimeFees(tokenMint),
      sdk.state.getTokenCreators(tokenMint),
      fetchTokenMetadata(cleanAddress),
    ])

    if (feesResult.status === 'fulfilled') {
      feesInSol = Number(feesResult.value) / LAMPORTS_PER_SOL
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
    }

    if (feesInSol === 0 && creators.length === 0) {
      return NextResponse.json(
        { error: 'Token not found on Bags.fm. Please verify the address.' },
        { status: 404 }
      )
    }

    const meta = metadata.status === 'fulfilled' ? metadata.value : null

    return NextResponse.json({
      address: cleanAddress,
      tokenAnalytics: {
        address: cleanAddress,
        symbol: meta?.symbol || cleanAddress.slice(0, 6).toUpperCase(),
        name: meta?.name || `Token ${cleanAddress.slice(0, 8)}...`,
        icon: meta?.icon || null,
        description: meta?.description || null,
        links: meta?.links || [],
        price: {
          usd: meta?.priceUsd || null,
          change24h: meta?.priceChange24h || null,
        },
        volume24h: meta?.volume24h || null,
        liquidity: meta?.liquidity || null,
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
