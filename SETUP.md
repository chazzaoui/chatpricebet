# Setup Guide for Chat Price Bet

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Get WalletConnect Project ID

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Create a new project
3. Copy your Project ID

### 3. Get Pyth Contract Addresses

For Base Sepolia testnet:
- Pyth Contract: `0x8250f4aF4B972684F7b336503E2D6dFeB78EA228`
- ETH/USD Price Feed ID: `0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace`

### 4. Configure Environment Variables

Create a `.env` file:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_PYTH_CONTRACT_ADDRESS=0x8250f4aF4B972684F7b336503E2D6dFeB78EA228
NEXT_PUBLIC_PYTH_PRICE_FEED_ID=0xff61491a931112ddf1bd8147cd1b641375f5825126d665480874634fd0ace
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
PRIVATE_KEY=your_private_key_for_deployment
BASE_SEPOLIA_RPC=https://sepolia.base.org
```

### 5. Deploy Smart Contract

```bash
# Make sure you have Base Sepolia ETH in your wallet
npm run compile
npm run deploy
```

Copy the deployed contract address to your `.env` file.

### 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Testing the App

1. **Connect Wallet**: Click "Connect Wallet" and approve the connection
2. **Initialize XMTP**: The app will automatically initialize XMTP when you connect
3. **Start Chatting**: Create or join a conversation
4. **Place a Bet**: 
   - Go to "Place Bet" tab
   - Choose UP or DOWN
   - Set amount (0.001 - 1 ETH)
   - Click "Place Bet"
5. **Resolve Bet**: After 5 minutes, click "Resolve" on your bet

## Troubleshooting

### XMTP Not Initializing
- Make sure your wallet is connected
- Check browser console for errors
- Try refreshing the page

### Contract Not Found
- Verify contract address in `.env`
- Make sure contract is deployed to Base Sepolia
- Check network in your wallet

### Price Not Loading
- Verify Pyth contract address
- Check network connection
- Price updates require fetching from Pyth Hermes API first

## Next Steps for Hackathon

1. Record a 5-minute demo video
2. Create GitHub repository
3. Submit to ETHGlobal
4. Fill out Pyth feedback form (for $750 bonus!)

