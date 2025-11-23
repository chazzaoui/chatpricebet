const hre = require('hardhat');

async function main() {
  // Pyth contract addresses
  // For Sepolia: Use Pyth contract on Sepolia (check Pyth docs)
  // For Base Sepolia: 0x8250f4aF4B972684F7b336503E2D6dFeB78EA228
  // Note: Pyth might not be on Sepolia, you may need to use a mock or different oracle
  const PYTH_CONTRACT_RAW =
    process.env.NEXT_PUBLIC_PYTH_CONTRACT_ADDRESS ||
    '0x8250f4aF4B972684F7b336503E2D6dFeB78EA228'; // Using Base Sepolia address as fallback
  // Get checksummed address
  const PYTH_CONTRACT = hre.ethers.getAddress(
    PYTH_CONTRACT_RAW.toLowerCase()
  );
  // ETH/USD price feed ID (same across networks)
  const PRICE_FEED_ID =
    process.env.NEXT_PUBLIC_PYTH_PRICE_FEED_ID ||
    '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace';

  console.log('Deploying PriceBet contract...');
  console.log('Pyth Contract:', PYTH_CONTRACT);
  console.log('Price Feed ID:', PRICE_FEED_ID);

  const PriceBet = await hre.ethers.getContractFactory('PriceBet');
  const priceBet = await PriceBet.deploy(
    PYTH_CONTRACT,
    PRICE_FEED_ID
  );

  await priceBet.waitForDeployment();

  const address = await priceBet.getAddress();
  console.log('PriceBet deployed to:', address);
  console.log('\nAdd this to your .env file:');
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
