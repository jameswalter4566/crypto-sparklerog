import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowDownUp } from 'lucide-react';
import { JupiterService } from '@/services/jupiter/jupiterService';
import { toast } from 'sonner';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export const SwapInterface = () => {
  const [amount, setAmount] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSwap = async () => {
    if (!amount || !tokenAddress) {
      toast.error("Please enter amount and token address");
      return;
    }

    setIsLoading(true);
    try {
      // @ts-ignore - we'll properly type this later
      const { solana } = window;
      if (!solana?.isPhantom) {
        throw new Error("Please install Phantom wallet");
      }

      const response = await solana.connect();
      await JupiterService.initialize(response.publicKey);
      
      const result = await JupiterService.swapTokens(
        "So11111111111111111111111111111111111111112", // SOL
        tokenAddress,
        Number(amount) * LAMPORTS_PER_SOL
      );

      toast.success("Swap successful!", {
        description: `Transaction ID: ${result.txid}`,
        action: {
          label: "View",
          onClick: () => window.open(`https://explorer.solana.com/tx/${result.txid}`, '_blank'),
        },
      });
    } catch (error) {
      console.error('Swap error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to swap tokens");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto bg-black/50 backdrop-blur-sm border-gray-800">
      <h2 className="text-xl font-bold mb-4">Swap Tokens</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Amount (SOL)</label>
          <Input
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-black/30"
          />
        </div>

        <div className="flex justify-center">
          <ArrowDownUp className="text-gray-400" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Token Address</label>
          <Input
            type="text"
            placeholder="Enter token address"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            className="w-full bg-black/30"
          />
        </div>

        <Button 
          onClick={handleSwap} 
          disabled={isLoading || !amount || !tokenAddress}
          className="w-full"
        >
          {isLoading ? "Swapping..." : "Swap"}
        </Button>
      </div>
    </Card>
  );
};