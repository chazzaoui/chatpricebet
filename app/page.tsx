'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState, useEffect } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { BettingPanel } from '@/components/BettingPanel';
import { useXMTP } from '@/hooks/useXMTP';
import { TrendingUp, MessageSquare, Coins } from 'lucide-react';

export default function Home() {
  const { isConnected } = useAccount();
  const { client, initClient } = useXMTP();
  const [activeTab, setActiveTab] = useState<'chat' | 'bet'>('chat');
  const [initialPrediction, setInitialPrediction] = useState<
    boolean | null
  >(null);

  // Handle hash navigation and custom events for betting from chat
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#bet') {
        setActiveTab('bet');
        window.location.hash = '';
      }
    };

    const handleSwitchToBet = (event: Event) => {
      const customEvent = event as CustomEvent;
      setActiveTab('bet');
      if (customEvent.detail?.prediction !== undefined) {
        setInitialPrediction(customEvent.detail.prediction);
      }
    };

    // Check hash on mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    // Listen for custom event
    window.addEventListener('switchToBet', handleSwitchToBet);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('switchToBet', handleSwitchToBet);
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Coins className="w-12 h-12" />
            Chat Price Bet
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Bet on crypto prices with your friends in real-time group
            chat
          </p>
          <div className="flex justify-center mb-6">
            <ConnectButton />
          </div>
        </div>

        {!isConnected ? (
          <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
            <p className="text-white text-lg">
              Connect your wallet to start betting and chatting!
            </p>
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="max-w-4xl mx-auto mb-6">
              <div className="flex gap-4 bg-white/10 backdrop-blur-lg rounded-xl p-2">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all ${
                    activeTab === 'chat'
                      ? 'bg-white text-purple-900'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  Group Chat
                </button>
                <button
                  onClick={() => setActiveTab('bet')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all ${
                    activeTab === 'bet'
                      ? 'bg-white text-purple-900'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  <TrendingUp className="w-5 h-5" />
                  Place Bet
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto">
              {activeTab === 'chat' ? (
                <ChatInterface
                  client={client}
                  initClient={initClient}
                />
              ) : (
                <BettingPanel
                  initialPrediction={initialPrediction}
                  onPredictionSet={() => setInitialPrediction(null)}
                />
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>Built for ETHGlobal Buenos Aires 2025</p>
          <p className="mt-2">
            Powered by XMTP • Pyth Network • Base
          </p>
        </div>
      </div>
    </main>
  );
}
