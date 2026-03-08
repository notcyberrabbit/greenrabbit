# 🐰 GreenRabbit - Token Analytics Dashboard

A mystical AI-powered analyzer for Solana tokens on Bags.fm. Enter a token address and let the Rabbit reveal insights into fees, creators, and economic dynamics.

## Features

✨ **Token Fee Analytics**
- Fetch lifetime fees collected from Bags.fm
- View creator vs trader fee distribution
- Analyze fee percentages
- Real-time data integration

👥 **Creator Information**
- View creator addresses and verification status
- See creation dates and descriptions
- Analyze creator profiles

🤖 **AI Insights**
- Claude AI analyzes token economics
- "The Rabbit Sees..." insights section
- Economic model assessment
- Risk and opportunity evaluation

🎨 **Beautiful UI**
- Dark theme with green mystical aesthetics
- Smooth animations and transitions
- Responsive design (mobile-friendly)
- Minimal, clean interface

## Quick Start

### Installation

```bash
# Clone and install
git clone <repository-url>
cd greenrabbit
npm install

# Set up environment
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local

# Run
npm run dev
```

### Usage

1. Enter a token address (43-44 character base58)
2. Click "Analyze Token"
3. See fee analytics and creator info
4. Read AI analysis in "The Rabbit Sees..." section

## Tech Stack

- Next.js 14, React 18, TypeScript
- Anthropic Claude API for analysis
- Bags.fm API v2 for token data
- Vercel for deployment

## API Endpoints

### POST `/api/token`
Fetches token analytics from Bags.fm

**Request:**
```json
{ "tokenAddress": "EPjFWdd5Au17h82cKycW7YEC680ZfsL1wKKUJmUSkde" }
```

**Response:**
```json
{
  "address": "EPjFWdd5Au17h82cKycW7YEC680ZfsL1wKKUJmUSkde",
  "tokenAnalytics": {
    "symbol": "USDC",
    "name": "USD Coin",
    "fees": {
      "lifetimeFeesCollected": 1000000,
      "creatorFeePercentage": 5,
      "totalFeePercentage": 10,
      "feesCollectedNative": 500,
      "currency": "SOL"
    },
    "creators": [...]
  }
}
```

## Bags.fm API Integration

- **Lifetime Fees**: `https://public-api-v2.bags.fm/api/v1/tokens/{address}/lifetime-fees`
- **Creators**: `https://public-api-v2.bags.fm/api/v1/tokens/{address}/creators`

## Deployment

### Deploy to Vercel (Recommended)

```bash
git push origin main
# Then connect to Vercel in dashboard
```

Add environment variable:
- `ANTHROPIC_API_KEY`: Your Anthropic API key

## License

MIT - Use freely for any purpose

---

**The Rabbit Sees Your Potential** 🐰✨
