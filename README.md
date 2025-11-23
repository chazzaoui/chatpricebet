# Chat Price Bet 🎲💬

A Web3 hackathon project for **ETHGlobal Buenos Aires 2025** that combines group chat betting with real-time crypto price predictions.

## 🎯 Concept

**Chat Price Bet** is a social betting platform where friends can bet on crypto prices in real-time through XMTP group chats. Users place bets on whether ETH price will go UP or DOWN within 5 minutes, powered by Pyth Network's real-time price feeds.

## 🏆 Hackathon Tracks

This project qualifies for multiple prize tracks:

- **XMTP - Best Miniapp in a Group Chat** ($2,500) - Group chat betting experience
- **Pyth Network - Most Innovative use of Pyth Pull Price Feeds** ($10,000) - Real-time price feeds for betting
- **Pyth Network - Pyth Entropy Pool Prize** ($5,000) - Random number generation for fair betting

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Web3**: Wagmi, RainbowKit, ethers.js
- **Messaging**: XMTP React SDK
- **Oracle**: Pyth Network (Price Feeds & Entropy)
- **Blockchain**: Base Sepolia (for testing)
- **Smart Contracts**: Solidity, Hardhat

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- A Web3 wallet (MetaMask recommended)
- Base Sepolia testnet ETH (get from [Base Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))

### Installation

1. **Clone and install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

```bash
cp .env.example .env
```

Edit `.env` and add:
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - Get from [WalletConnect Cloud](https://cloud.walletconnect.com)
- `NEXT_PUBLIC_PYTH_CONTRACT_ADDRESS` - Pyth contract on Base Sepolia
- `NEXT_PUBLIC_PYTH_PRICE_FEED_ID` - ETH/USD price feed ID
- `NEXT_PUBLIC_CONTRACT_ADDRESS` - Your deployed contract address

3. **Compile and deploy smart contracts:**

```bash
# Compile contracts
npm run compile

# Deploy to Base Sepolia (make sure you have PRIVATE_KEY in .env)
npm run deploy
```

4. **Run the development server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 How It Works

1. **Connect Wallet**: Connect your Web3 wallet using RainbowKit
2. **Initialize XMTP**: Start chatting with friends in group conversations
3. **Place Bets**: 
   - Choose UP or DOWN prediction
   - Set bet amount (0.001 - 1 ETH)
   - Wait 5 minutes for price movement
4. **Resolve Bets**: After 5 minutes, resolve your bet using Pyth price feeds
5. **Win or Lose**: Get 2x payout if your prediction is correct!

## 🏗️ Project Structure

```
chat-price-bet/
├── app/                 # Next.js app directory
│   ├── layout.tsx      # Root layout with providers
│   ├── page.tsx        # Main page
│   └── providers.tsx   # Web3 & XMTP providers
├── components/          # React components
│   ├── ChatInterface.tsx  # XMTP chat UI
│   └── BettingPanel.tsx  # Betting interface
├── contracts/          # Solidity smart contracts
│   └── PriceBet.sol    # Main betting contract
├── hooks/              # Custom React hooks
│   ├── useXMTP.ts      # XMTP client hook
│   └── usePythPrice.ts # Pyth price fetching
├── lib/                # Utilities
│   └── contracts.ts    # Contract ABIs
└── scripts/            # Deployment scripts
    └── deploy.js        # Contract deployment
```

## 🔧 Smart Contract Details

The `PriceBet` contract:
- Uses Pyth Network for real-time price feeds
- Allows users to bet on price direction (UP/DOWN)
- 5-minute betting window
- Automatic payout calculation (2x for winners)
- Tracks all user bets and history

## 📚 Integration Guides

### XMTP Integration

- Uses `@xmtp/react-sdk` for chat functionality
- Supports group conversations
- Real-time messaging between users

### Pyth Network Integration

- **Price Feeds**: Pull method integration
  1. Fetch price update data from Pyth Hermes
  2. Call `updatePriceFeeds` on-chain
  3. Read price using `getPriceNoOlderThan`

- **Entropy** (for future randomness features):
  - Generate verifiable random numbers
  - Use for fair bet resolution

## 🎨 Features

- ✅ Wallet connection with RainbowKit
- ✅ XMTP group chat integration
- ✅ Real-time price display (Pyth Network)
- ✅ Place bets on price direction
- ✅ View betting history
- ✅ Resolve bets after time window
- ✅ Modern, responsive UI

## 🚧 Future Enhancements

- [ ] Pyth Entropy integration for randomness
- [ ] Multi-asset betting (BTC, SOL, etc.)
- [ ] Leaderboards and social features
- [ ] Bet sharing in chat
- [ ] Automated bet resolution
- [ ] Mobile app support

## 📝 Hackathon Submission Checklist

- [x] GitHub repository with source code
- [x] Working demo with XMTP integration
- [x] Pyth Network price feeds integration
- [x] Smart contract deployment
- [ ] Demo video (5 minutes max)
- [ ] README with setup instructions
- [ ] Feedback form submission (for Pyth)

## 🤝 Team

Built for ETHGlobal Buenos Aires 2025

## 📄 License

MIT

## 🙏 Acknowledgments

- **XMTP** for decentralized messaging
- **Pyth Network** for real-time price feeds
- **Base** for the blockchain infrastructure
- **ETHGlobal** for organizing the hackathon

---

**Note**: This is a hackathon project. For production use, additional security audits and optimizations are recommended.

