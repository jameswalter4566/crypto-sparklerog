import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { TokenInputs } from './swap/TokenInputs';
import { isValidSolanaAddress } from '@/utils/solana';
import { fetchPriceQuote, executeSwap } from '@/services/jupiter/swapService';
import { Transaction, VersionedTransaction, Connection } from '@solana/web3.js';
import { Loader2 } from 'lucide-react';

// Temporarily hardcoded Helius API key for testing
const connection = new Connection(
  'https://rpc.helius.xyz/?api-key=726140d8-6b0d-4719-8702-682d81e94a37'
);

export const SwapInterface = () => {
  const [amount, setAmount] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [priceQuote, setPriceQuote] = useState<number | null>(null);

  const validateAmount = (value: string): boolean => {
    const numValue = Number(value);
    return !isNaN(numValue) && numValue > 0 && numValue <= 100000; // Add reasonable upper limit
  };

  const handleAmountChange = async (value: string) => {
    setAmount(value);
    if (!validateAmount(value)) {
      setPriceQuote(null);
      return;
    }

    if (value && tokenAddress && isValidSolanaAddress(tokenAddress)) {
      setIsQuoteLoading(true);
      try {
        const price = await fetchPriceQuote(tokenAddress, value);
        if (price) {
          setPriceQuote(Number(price) * Number(value));
        }
      } catch (error) {
        console.error('Price quote error:', error);
        toast.error('Failed to fetch price quote. Please try again.');
      } finally {
        setIsQuoteLoading(false);
      }
    }
  };

  const handleTokenAddressChange = async (value: string) => {
    setTokenAddress(value);
    if (amount && validateAmount(amount) && value && isValidSolanaAddress(value)) {
      setIsQuoteLoading(true);
      try {
        const price = await fetchPriceQuote(value, amount);
        if (price) {
          setPriceQuote(Number(price) * Number(amount));
        }
      } catch (error) {
        console.error('Price quote error:', error);
        toast.error('Failed to fetch price quote. Please try again.');
      } finally {
        setIsQuoteLoading(false);
      }
    }
  };

  const handleSwap = async () => {
    // Validate amount
    if (!validateAmount(amount)) {
      toast.error('Please enter a valid amount between 0 and 100,000 SOL');
      return;
    }

    // Validate token address
    if (!isValidSolanaAddress(tokenAddress)) {
      toast.error('Please enter a valid Solana token address');
      return;
    }

    setIsLoading(true);
    try {
      // Check for Phantom wallet
      if (!window.solana?.isPhantom) {
        throw new Error('Please install the Phantom wallet extension');
      }

      // Connect to wallet
      const response = await window.solana.connect();
      const userPublicKey = response.publicKey;

      // Get swap transaction
      const { swapTransaction } = await executeSwap(tokenAddress, amount, userPublicKey.toString());
      
      // Convert the base64 transaction to a Buffer
      const transactionBuffer = Buffer.from(swapTransaction, 'base64');
      
      // Try to deserialize as a VersionedTransaction first
      let transaction;
      try {
        transaction = VersionedTransaction.deserialize(transactionBuffer);
      } catch {
        // If that fails, try as a legacy Transaction
        transaction = Transaction.from(transactionBuffer);
      }

      // Sign the transaction
      const signedTransaction = await window.solana.signTransaction(transaction);
      
      // Serialize and send the transaction
      const serializedTransaction = signedTransaction instanceof VersionedTransaction 
        ? signedTransaction.serialize()
        : signedTransaction.serialize();
        
      const txid = await connection.sendRawTransaction(
        serializedTransaction,
        { skipPreflight: false, maxRetries: 3 }
      );
      
      toast.success("Swap successful!", {
        description: `Transaction ID: ${txid}`,
        action: {
          label: "View",
          onClick: () => window.open(`https://explorer.solana.com/tx/${txid}`, '_blank'),
        },
      });
    } catch (error) {
      console.error('Swap error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to swap tokens. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-8 max-w-xl w-full mx-auto bg-black/50 backdrop-blur-sm border-gray-800">
      <h2 className="text-2xl font-bold mb-6">Buy</h2>
      
      <TokenInputs
        amount={amount}
        tokenAddress={tokenAddress}
        onAmountChange={handleAmountChange}
        onTokenAddressChange={handleTokenAddressChange}
        priceQuote={priceQuote}
        isLoading={isQuoteLoading}
        disabled={isLoading}
      />

      <Button 
        onClick={handleSwap} 
        disabled={isLoading || !amount || !tokenAddress || isQuoteLoading}
        className="w-full mt-6"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Buy Now'
        )}
      </Button>
    </Card>
  );
};