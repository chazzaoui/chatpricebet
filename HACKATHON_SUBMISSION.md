# ETHGlobal Buenos Aires 2025 - Submission

## Project: Chat Price Bet 💬🎲

### Track Qualifications

#### ✅ XMTP - Best Miniapp in a Group Chat ($2,500)
- **Integration**: Full XMTP React SDK integration
- **Feature**: Group chat betting experience where users can bet on crypto prices
- **Implementation**: 
  - Real-time messaging using `@xmtp/react-sdk`
  - Group conversations for betting coordination
  - Chat interface with message history
  - Seamless wallet integration

#### ✅ Pyth Network - Most Innovative use of Pyth Pull Price Feeds ($10,000)
- **Integration**: Pyth Pull oracle method
- **Feature**: Real-time ETH/USD price feeds for betting resolution
- **Implementation**:
  - Pull price data from Pyth Hermes API
  - Update on-chain using `updatePriceFeeds`
  - Read prices using `getPriceNoOlderThan`
  - 5-minute betting windows based on price movements

#### ✅ Pyth Network - Pyth Entropy Pool Prize ($5,000)
- **Integration**: Pyth Entropy for randomness
- **Feature**: Fair bet resolution using verifiable random numbers
- **Implementation**:
  - Random number generation for bet outcomes
  - Ensures fairness in betting system
  - On-chain verifiable randomness

### Demo Video
[Link to 5-minute demo video - to be added]

### GitHub Repository
[Link to GitHub repo - to be added]

### Key Features

1. **Group Chat Betting**: Bet with friends in real-time through XMTP
2. **Price Prediction**: Bet on ETH price going UP or DOWN in 5 minutes
3. **Real-time Prices**: Powered by Pyth Network price feeds
4. **Fair Resolution**: Uses Pyth Entropy for randomness
5. **Simple UI**: Clean, modern interface built with Next.js

### Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Web3**: Wagmi, RainbowKit, ethers.js
- **Messaging**: XMTP React SDK
- **Oracle**: Pyth Network (Price Feeds & Entropy)
- **Blockchain**: Base Sepolia
- **Smart Contracts**: Solidity, Hardhat

### How to Run

1. `npm install`
2. Configure `.env` file (see SETUP.md)
3. `npm run compile && npm run deploy`
4. `npm run dev`

### Feedback for Pyth Network

**What we loved:**
- Easy integration with Pull method
- Comprehensive documentation
- Fast price updates

**Suggestions:**
- More examples for Entropy integration
- Better error handling guides
- Testnet faucet for update fees

### Team

[Your team name and members]

---

Built with ❤️ for ETHGlobal Buenos Aires 2025

