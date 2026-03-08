import { NextRequest, NextResponse } from 'next/server'
import { BagsSDK } from '@bagsfm/bags-sdk'
import { PublicKey, Connection } from '@solana/web3.js'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

function isValidTokenAddress(address: string): boolean {
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
  return base58Regex.test(address)
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

    try {
      const feesLamports = await sdk.state.getTokenLifetimeFees(tokenMint)
      feesInSol = Number(feesLamports) / LAMPORTS_PER_SOL
    } catch (e) {
      console.error('[Bags SDK] Fees error:', e)
    }

    try {
      const creatorsRaw = await sdk.state.getTokenCreators(tokenMint)
      creators = creatorsRaw.map((c: any) => ({
        address: c.wallet,
        name: c.providerUsername ?? c.username ?? null,
        provider: c.provider ?? null,
        pfp: c.pfp ?? null,
        royaltyPercent: c.royaltyBps / 100,
        isCreator: c.isCreator,
        isVerified: !!c.providerUsername,
        createdAt: new Date().toISOString(),
      }))
    } catch (e) {
      console.error('[Bags SDK] Creators error:', e)
    }

    if (feesInSol === 0 && creators.length === 0) {
      return NextResponse.json(
        { error: 'Token not found on Bags.fm. Please verify the address.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      address: cleanAddress,
      tokenAnalytics: {
        address: cleanAddress,
        symbol: cleanAddress.slice(0, 6).toUpperCase(),
        name: `Token ${cleanAddress.slice(0, 8)}...`,
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
