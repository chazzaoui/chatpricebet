'use client';

import { useState, useEffect } from 'react';
import {
  useAccount,
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { parseEther, formatEther } from 'viem';
import {
  TrendingUp,
  TrendingDown,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { PriceBetABI } from '@/lib/contracts';
import { usePythPrice } from '@/hooks/usePythPrice';

const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  '0x0000000000000000000000000000000000000000') as `0x${string}`;

interface BettingPanelProps {
  initialPrediction?: boolean | null;
  onPredictionSet?: () => void;
}

export function BettingPanel({
  initialPrediction = null,
  onPredictionSet,
}: BettingPanelProps) {
  const { address, isConnected } = useAccount();
  const [betAmount, setBetAmount] = useState('0.001');
  const [prediction, setPrediction] = useState<boolean | null>(
    initialPrediction ?? null
  );
  const [selectedBetId, setSelectedBetId] = useState<bigint | null>(
    null
  );
  const [showSuccess, setShowSuccess] = useState(false);

  // Update prediction when initialPrediction changes
  useEffect(() => {
    if (
      initialPrediction !== undefined &&
      initialPrediction !== null
    ) {
      setPrediction(initialPrediction);
      if (onPredictionSet) {
        onPredictionSet();
      }
    }
  }, [initialPrediction, onPredictionSet]);

  const { currentPrice, isLoading: priceLoading } = usePythPrice();

  // Read contract functions
  const { data: userBets } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PriceBetABI,
    functionName: 'getUserBets',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Write contract functions
  const {
    writeContract,
    data: hash,
    isPending,
    error,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Show success message when transaction succeeds
  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const handlePlaceBet = async () => {
    if (!prediction || !betAmount || !isConnected) return;

    // Hide previous success message when placing new bet
    setShowSuccess(false);

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: PriceBetABI,
        functionName: 'placeBet',
        args: [prediction],
        value: parseEther(betAmount),
        // Set gas limit to avoid "transaction gas limit too high" error
        // The network cap is 16,777,216, so we set a reasonable limit well below that
        gas: BigInt(1000000), // 1M gas should be more than enough for this operation
      });
    } catch (err) {
      console.error('Error placing bet:', err);
    }
  };

  const handleResolveBet = async (betId: bigint) => {
    // In a real implementation, you'd fetch price update data from Pyth Hermes
    // For now, this is a placeholder
    alert(
      'Resolving bet requires Pyth price update data. Check the docs!'
    );
  };

  return (
    <div className="space-y-6">
      {/* Current Price Display */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">
          Current ETH Price
        </h2>
        {priceLoading ? (
          <div className="flex items-center gap-2 text-white">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading price...</span>
          </div>
        ) : (
          <div className="text-4xl font-bold text-white">
            $
            {currentPrice
              ? (Number(currentPrice) / 1e8).toFixed(2)
              : '0.00'}
          </div>
        )}
      </div>

      {/* Betting Interface */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">
          Place Your Bet
        </h2>

        {/* Prediction Selection */}
        <div className="mb-6">
          <label className="block text-white mb-3 font-semibold">
            Will the price go UP or DOWN in 5 minutes?
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setPrediction(true)}
              className={`p-6 rounded-xl border-2 transition-all ${
                prediction === true
                  ? 'bg-green-500 border-green-400 text-white'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
            >
              <TrendingUp className="w-8 h-8 mx-auto mb-2" />
              <div className="font-bold text-lg">UP</div>
            </button>
            <button
              onClick={() => setPrediction(false)}
              className={`p-6 rounded-xl border-2 transition-all ${
                prediction === false
                  ? 'bg-red-500 border-red-400 text-white'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
            >
              <TrendingDown className="w-8 h-8 mx-auto mb-2" />
              <div className="font-bold text-lg">DOWN</div>
            </button>
          </div>
        </div>

        {/* Bet Amount */}
        <div className="mb-6">
          <label className="block text-white mb-3 font-semibold">
            Bet Amount (ETH)
          </label>
          <input
            type="number"
            min="0.001"
            max="1"
            step="0.001"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            className="w-full bg-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="0.001"
          />
          <p className="text-white/60 text-sm mt-2">
            Min: 0.001 ETH | Max: 1 ETH
          </p>
        </div>

        {/* Place Bet Button */}
        <button
          onClick={handlePlaceBet}
          disabled={
            !prediction || !betAmount || isPending || isConfirming
          }
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
        >
          {isPending || isConfirming ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {isPending ? 'Confirming...' : 'Processing...'}
            </>
          ) : (
            'Place Bet'
          )}
        </button>

        {showSuccess && isSuccess && hash && (
          <div className="mt-4 bg-green-500/20 border border-green-500 rounded-lg p-4 flex flex-col gap-2 text-green-300">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">
                Bet placed successfully!
              </span>
            </div>
            <a
              href={`https://sepolia.etherscan.io/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300 text-sm underline"
            >
              View on Etherscan →
            </a>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-300">
            <div className="font-semibold mb-1">
              Error placing bet:
            </div>
            <div className="text-sm">{error.message}</div>
          </div>
        )}
      </div>

      {/* My Bets */}
      {userBets && Array.isArray(userBets) && userBets.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            My Bets
          </h2>
          <div className="space-y-3">
            {userBets.map((betId: bigint) => (
              <BetCard
                key={betId.toString()}
                isPending
                betId={betId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BetCard({
  betId,
  isPending,
}: {
  betId: bigint;
  isPending: boolean;
}) {
  const { data: bet } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PriceBetABI,
    functionName: 'getBet',
    args: [betId],
  });

  if (!bet) return null;

  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white font-semibold">
            Bet #{betId.toString()}
          </div>
          <div className="text-white/60 text-sm">
            {bet.prediction ? 'UP' : 'DOWN'} •{' '}
            {formatEther(bet.amount)} ETH
          </div>
          <div className="text-white/60 text-sm">
            {bet.resolved
              ? bet.won
                ? '✅ Won'
                : '❌ Lost'
              : '⏳ Pending'}
          </div>
        </div>
        {!bet.resolved && (
          <button
            onClick={() => {
              // In real implementation, fetch price update data first
              alert(
                'Resolve functionality requires Pyth price update data'
              );
            }}
            disabled={isPending}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
          >
            Resolve
          </button>
        )}
      </div>
    </div>
  );
}
