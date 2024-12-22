import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { TokenInputs } from './swap/TokenInputs';
import { isValidSolanaAddress } from '@/utils/solana';
import { fetchPriceQuote, executeSwap } from '@/services/jupiter/swapService';

export const SwapInterface = () => {
  const [amount, setAmount] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [priceQuote, setPriceQuote] = useState<number | null>(null);

  const handleAmountChange = async (value: string) => {
    setAmount(value);
    if (value && tokenAddress && isValidSolanaAddress(tokenAddress)) {
      try {
        const price = await fetchPriceQuote(tokenAddress, value);
        if (price) {
          setPriceQuote(Number(price) * Number(value));
        }
      } catch (error) {
        console.error('Price quote error:', error);
        toast.error('Failed to fetch price quote');
      }
    }
  };

  const handleTokenAddressChange = async (value: string) => {
    setTokenAddress(value);
    if (amount && value && isValidSolanaAddress(value)) {
      try {
        const price = await fetchPriceQuote(value, amount);
        if (price) {
          setPriceQuote(Number(price) * Number(amount));
        }
      } catch (error) {
        console.error('Price quote error:', error);
        toast.error('Failed to fetch price quote');
      }
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

      const { swapTransaction } = await executeSwap(tokenAddress, amount, userPublicKey.toString());
      
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
      
      <TokenInputs
        amount={amount}
        tokenAddress={tokenAddress}
        onAmountChange={handleAmountChange}
        onTokenAddressChange={handleTokenAddressChange}
        priceQuote={priceQuote}
      />

      <Button 
        onClick={handleSwap} 
        disabled={isLoading || !amount || !tokenAddress}
        className="w-full mt-4"
      >
        {isLoading ? "Swapping..." : "Swap"}
      </Button>
    </Card>
  );
};