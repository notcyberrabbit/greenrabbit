# 🐰 GreenRabbit - Solana Wallet Analyzer

A mystical AI-powered analyzer for Bags.fm token traders on Solana. Enter your wallet address and let the Rabbit reveal insights into your trading patterns.

## Features

✨ **Wallet Analysis**
- Fetch token transaction history from Bags.fm
- View buy/sell history, dates, and amounts in a clean table
- Real-time wallet tracking

🤖 **AI Insights**
- Claude AI analyzes your trading behavior
- Mystical yet genuine trading advice
- Pattern recognition and risk assessment
- Personalized recommendations

🎨 **Beautiful UI**
- Dark theme with green mystical aesthetics
- Smooth animations and transitions
- Responsive design (mobile-friendly)
- Minimal, clean interface

## Tech Stack

- **Framework**: Next.js 14+ (React 18+)
- **Styling**: CSS Modules + Custom CSS
- **API Integration**: Anthropic Claude API, Bags.fm API
- **Deployment**: Vercel (optimized for serverless)
- **Language**: TypeScript

## Prerequisites

- Node.js 18+ and npm/yarn
- Anthropic API key ([get one here](https://console.anthropic.com))
- Bags.fm API key (optional, mock data available)

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd greenrabbit
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:
```env
ANTHROPIC_API_KEY=your_anthropic_api_key
NEXT_PUBLIC_BAGS_API_KEY=your_bags_api_key
NEXT_PUBLIC_BAGS_API_URL=https://api.bags.fm
```

4. **Run development server**
```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## Usage

1. **Enter a Solana Wallet Address**
   - Paste any valid Solana wallet address (base58 format)
   - Must have Bags.fm token transaction history

2. **View Your Portfolio**
   - See all tokens you've bought/sold
   - Check transaction dates and amounts
   - View net position for each token

3. **Get AI Analysis**
   - Claude AI automatically analyzes your trading patterns
   - "The Rabbit Sees..." section reveals insights
   - Pattern analysis and trading advice

## API Endpoints

### POST `/api/wallet`
Fetches token transaction history from Bags.fm

**Request:**
```json
{
  "walletAddress": "YourSolanaWalletAddress"
}
```

**Response:**
```json
{
  "address": "YourSolanaWalletAddress",
  "tokens": [
    {
      "symbol": "BAGS",
      "address": "token_contract_address",
      "bought": 5000,
      "sold": 2000,
      "netAmount": 3000,
      "buyDate": "2024-01-15T10:30:00Z",
      "sellDate": "2024-02-20T15:45:00Z"
    }
  ]
}
```

### POST `/api/analyze`
Generates AI analysis of trading patterns

**Request:**
```json
{
  "walletAddress": "YourSolanaWalletAddress",
  "tokens": [/* token array from /api/wallet */]
}
```

**Response:**
```json
{
  "analysis": "The Rabbit senses a skilled trader..."
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude | Yes |
| `NEXT_PUBLIC_BAGS_API_KEY` | Bags.fm API key | No* |
| `NEXT_PUBLIC_BAGS_API_URL` | Bags.fm API endpoint | No (default: https://api.bags.fm) |

*App includes mock data generator if Bags API is unavailable

## Customization

### Change Colors
Edit CSS variables in `/app/globals.css`:
```css
:root {
  --green-primary: #00d084;
  --green-dark: #0a7d5c;
  --bg-primary: #0a0e27;
  /* ... more variables */
}
```

### Modify AI Prompt
Edit the analysis prompt in `/app/api/analyze/route.ts`:
```typescript
const prompt = `Your custom analysis prompt here...`
```

### Add More Tokens
Update the mock data generator in `/app/api/wallet/route.ts`:
```typescript
function generateMockTokenData(walletAddress: string) {
  // Add more token data here
}
```

## Deployment to Vercel

### Easy 1-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourname%2Fgreenrabbit)

### Manual Deployment

1. **Push to GitHub**
```bash
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables:
     - `ANTHROPIC_API_KEY`
     - `NEXT_PUBLIC_BAGS_API_KEY`
   - Click "Deploy"

3. **Access Your App**
   - Your app will be live at `https://greenrabbit-xyz.vercel.app`

### Environment Variables on Vercel

1. Go to Project Settings → Environment Variables
2. Add each variable:
   - Name: `ANTHROPIC_API_KEY`, Value: `your_key`
   - Name: `NEXT_PUBLIC_BAGS_API_KEY`, Value: `your_key`
3. Redeploy after adding variables

## Building for Production

```bash
npm run build
npm run start
```

## Troubleshooting

### "Invalid Solana wallet address"
- Make sure you're using a valid Solana base58 address (44-44 characters)
- Example: `YourWalletAddressHere123456789...`

### "Failed to fetch wallet data"
- Check your Bags.fm API key
- Verify the wallet has Bags.fm token transactions
- App uses mock data if API is unavailable

### Claude API errors
- Verify `ANTHROPIC_API_KEY` is set correctly
- Check rate limits: https://console.anthropic.com
- Review API usage at https://console.anthropic.com/account/usage

### Styles not loading
- Clear browser cache (Ctrl+F5 or Cmd+Shift+R)
- Delete `.next` folder and rebuild:
  ```bash
  rm -rf .next
  npm run dev
  ```

## API Rate Limits

- **Anthropic Claude API**: Check your plan at [console.anthropic.com](https://console.anthropic.com)
- **Bags.fm API**: Depends on your subscription
- **Vercel**: Free tier includes 1000 function invocations/month

## Performance Notes

- First analysis may take 5-10 seconds (Claude API latency)
- Wallet data fetches are cached by browser
- Animations use CSS for smooth 60fps performance
- Mobile optimized (tested on iPhone/Android)

## Security

⚠️ **Never commit `.env.local` to version control**
- API keys are server-side only
- Wallet addresses are public data (no secrets exposed)
- Add `.env.local` to `.gitignore` (already done)

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

- 📧 Email: support@example.com
- 🐦 Twitter: [@greenrabbitapp](https://twitter.com)
- 💬 Discord: [Join our community](https://discord.gg/greenrabbit)

## Roadmap

- [ ] Real-time wallet balance tracking
- [ ] Portfolio performance charts
- [ ] Trading win/loss analysis
- [ ] Multi-wallet comparison
- [ ] Export portfolio as PDF
- [ ] Mobile app (React Native)
- [ ] Community leaderboard
- [ ] Advanced analytics dashboard

## Credits

Built with ❤️ using:
- [Next.js](https://nextjs.org/)
- [Anthropic Claude](https://www.anthropic.com/)
- [Bags.fm](https://bags.fm/)
- [Lucide Icons](https://lucide.dev/)

---

**The Rabbit Sees Your Potential** 🐰✨

up1
up2

