'use client';

import { useState, useCallback } from 'react';
import { Client } from '@xmtp/xmtp-js';
import { useAccount } from 'wagmi';
import { Wallet } from 'ethers';

export function useXMTP() {
  const { address, connector } = useAccount();
  const [client, setClient] = useState<Client | null>(null);

  const initClient = useCallback(async () => {
    if (!address || client) return;

    try {
      // Get signer from wagmi connector
      const provider = await connector?.getProvider();
      if (!provider) {
        throw new Error('No provider available');
      }

      // Create ethers provider and signer
      const { BrowserProvider } = await import('ethers');
      const ethersProvider = new BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();

      // Check if XMTP is enabled for this address
      const canMessage = await Client.canMessage(address);
      if (!canMessage) {
        throw new Error('XMTP is not enabled for this address');
      }

      // Initialize XMTP client
      const xmtpClient = await Client.create(signer, {
        env: 'production', // Use "dev" for development
      });

      setClient(xmtpClient);
    } catch (error) {
      console.error('Error initializing XMTP client:', error);
      throw error;
    }
  }, [address, connector, client]);

  return {
    client,
    initClient,
  };
}
