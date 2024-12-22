import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { TokenInputs } from './swap/TokenInputs';
import { isValidSolanaAddress } from '@/utils/solana';
import { fetchPriceQuote, executeSwap } from '@/services/jupiter/swapService';
import { Transaction, VersionedTransaction, Connection } from '@solana/web3.js';
import bs58 from 'bs58';
import { Loader2 } from 'lucide-react';

// Use environment variable for RPC endpoint
const connection = new Connection(
  import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
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
      const { solana } = window;
      if (!solana?.isPhantom) {
        throw new Error('Please install the Phantom wallet extension');
      }

      // Connect to wallet
      const response = await solana.connect();
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
      const signedTransaction = await solana.signTransaction(transaction);
      
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
    <Card className="p-6 max-w-md mx-auto bg-black/50 backdrop-blur-sm border-gray-800">
      <h2 className="text-xl font-bold mb-4">Swap Tokens</h2>
      
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
        className="w-full mt-4"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Swapping...
          </>
        ) : (
          'Swap'
        )}
      </Button>
    </Card>
  );
};