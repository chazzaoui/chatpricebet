'use client';

import { useState, useCallback, useRef } from 'react';
import { Client, type Signer } from '@xmtp/browser-sdk';
import { useAccount } from 'wagmi';

export function useXMTP() {
  const { address, connector } = useAccount();
  const [client, setClient] = useState<Client | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);
  const initAttemptedRef = useRef(false);

  const initClient = useCallback(async () => {
    // Prevent multiple simultaneous initialization attempts
    if (
      !address ||
      client ||
      isInitializing ||
      initAttemptedRef.current
    ) {
      return;
    }

    initAttemptedRef.current = true;
    setIsInitializing(true);
    setInitError(null);

    try {
      // Get provider from wagmi connector
      const provider = await connector?.getProvider();
      if (!provider) {
        throw new Error('No provider available');
      }

      // Create ethers provider and signer
      const { BrowserProvider } = await import('ethers');
      const ethersProvider = new BrowserProvider(provider);
      const ethersSigner = await ethersProvider.getSigner();

      // Create XMTP Signer following Browser SDK documentation
      // https://docs.xmtp.org/chat-apps/sdks/browser
      const signer: Signer = {
        type: 'EOA',
        getIdentifier: () => ({
          identifier: address,
          identifierKind: 'Ethereum',
        }),
        signMessage: async (message: string): Promise<Uint8Array> => {
          // Sign the message using ethers signer
          // ethers signMessage returns a hex string, but we need bytes
          const signature = await ethersSigner.signMessage(message);
          // Convert hex string to Uint8Array
          // Remove 0x prefix if present
          const hex = signature.startsWith('0x')
            ? signature.slice(2)
            : signature;
          const bytes = new Uint8Array(hex.length / 2);
          for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
          }
          return bytes;
        },
      };

      // Create XMTP client using Browser SDK
      // Note: dbEncryptionKey is not used for encryption in browser environments
      // Following Browser SDK documentation: https://docs.xmtp.org/chat-apps/sdks/browser
      const xmtpClient = await Client.create(signer, {
        // Options can be added here if needed
        // Environment is determined by the network the wallet is connected to
      });

      setClient(xmtpClient);
      initAttemptedRef.current = false;
    } catch (error) {
      console.error('Error initializing XMTP client:', error);
      setInitError(error as Error);
      initAttemptedRef.current = false;
      // Don't throw - let the component handle the error state
    } finally {
      setIsInitializing(false);
    }
  }, [address, connector, client, isInitializing]);

  return {
    client,
    initClient,
    isInitializing,
    initError,
  };
}
