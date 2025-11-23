require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

/** @type {import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    sepolia: {
      url:
        process.env.SEPOLIA_RPC ||
        'https://ethereum-sepolia-rpc.publicnode.com',
      accounts: process.env.PRIVATE_KEY
        ? [process.env.PRIVATE_KEY]
        : [],
    },
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC || 'https://sepolia.base.org',
      accounts: process.env.PRIVATE_KEY
        ? [process.env.PRIVATE_KEY]
        : [],
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
};
