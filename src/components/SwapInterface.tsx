import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowDownUp } from 'lucide-react';
import { toast } from 'sonner';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

export const SwapInterface = () => {
  const [amount, setAmount] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [priceQuote, setPriceQuote] = useState<number | null>(null);

  const isValidSolanaAddress = (address: string) => {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  };

  const fetchPriceQuote = async (inputAmount: string) => {
    if (!isValidSolanaAddress(tokenAddress)) {
      toast.error('Please enter a valid Solana token address');
      return;
    }

    try {
      const response = await fetch(`https://api.jup.ag/price/v2?ids=${tokenAddress}&vsToken=So11111111111111111111111111111111111111112`);
      if (!response.ok) throw new Error('Failed to fetch price quote');
      const data = await response.json();
      const price = data.data[tokenAddress]?.price;
      if (price) {
        setPriceQuote(Number(price) * Number(inputAmount));
      }
    } catch (error) {
      console.error('Price quote error:', error);
      toast.error('Failed to fetch price quote');
    }
  };

  const handleSwap = async () => {
    if (!amount || !tokenAddress) {
      toast.error("Please enter amount and token address");
      return;
    }

    if (!isValidSolanaAddress(tokenAddress)) {
      toast.error('Please enter a valid Solana token address');
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
      const userPublicKey = response.publicKey;

      // Get quote from Jupiter
      const quoteResponse = await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${tokenAddress}&amount=${Number(amount) * LAMPORTS_PER_SOL}&slippageBps=50`);
      
      if (!quoteResponse.ok) {
        const errorData = await quoteResponse.json();
        throw new Error(errorData.message || 'Failed to get quote');
      }
      
      const quoteData = await quoteResponse.json();

      // Get swap transaction
      const swapRequestBody = {
        quoteResponse: quoteData,
        userPublicKey: userPublicKey.toString(),
        wrapUnwrapSOL: true,
      };

      const swapResponse = await fetch('https://quote-api.jup.ag/v6/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(swapRequestBody),
      });

      if (!swapResponse.ok) {
        const errorData = await swapResponse.json();
        throw new Error(errorData.message || 'Failed to get swap transaction');
      }
      
      const { swapTransaction } = await swapResponse.json();

      // Deserialize and sign the transaction
      const transaction = Buffer.from(swapTransaction, 'base64');
      const signedTransaction = await solana.signTransaction(transaction);
      
      // Send the transaction
      const connection = solana.connection;
      const txid = await connection.sendRawTransaction(signedTransaction.serialize());
      
      toast.success("Swap successful!", {
        description: `Transaction ID: ${txid}`,
        action: {
          label: "View",
          onClick: () => window.open(`https://explorer.solana.com/tx/${txid}`, '_blank'),
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
            onChange={(e) => {
              setAmount(e.target.value);
              if (e.target.value && tokenAddress) {
                fetchPriceQuote(e.target.value);
              }
            }}
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
            onChange={(e) => {
              setTokenAddress(e.target.value);
              if (amount && e.target.value) {
                fetchPriceQuote(amount);
              }
            }}
            className="w-full bg-black/30"
          />
        </div>

        {priceQuote && (
          <div className="text-sm text-gray-400">
            Estimated output: {priceQuote.toFixed(6)} tokens
          </div>
        )}

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