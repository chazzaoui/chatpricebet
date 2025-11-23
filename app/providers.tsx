'use client';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import {
  RainbowKitProvider,
  getDefaultWallets,
} from '@rainbow-me/rainbowkit';
import { sepolia } from 'viem/chains';
import '@rainbow-me/rainbowkit/styles.css';
import { XMTPProvider } from '@xmtp/react-sdk';
import { useState } from 'react';

const { connectors } = getDefaultWallets({
  appName: 'Chat Price Bet',
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo',
  chains: [sepolia],
});

const config = createConfig({
  chains: [sepolia],
  connectors,
  transports: {
    [sepolia.id]: http(),
  },
  ssr: true,
});

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <XMTPProvider>{children}</XMTPProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
