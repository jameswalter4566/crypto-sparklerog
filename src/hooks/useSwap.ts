import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Transaction, VersionedTransaction, Connection } from '@solana/web3.js';
import { isValidSolanaAddress } from '@/utils/solana';
import { fetchPriceQuote, executeSwap } from '@/services/jupiter/swapService';

// Temporarily hardcoded Helius API key for testing
const connection = new Connection(
  'https://rpc.helius.xyz/?api-key=726140d8-6b0d-4719-8702-682d81e94a37'
);

export const useSwap = (defaultTokenAddress?: string) => {
  const [amount, setAmount] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [priceQuote, setPriceQuote] = useState<number | null>(null);

  useEffect(() => {
    if (defaultTokenAddress && isValidSolanaAddress(defaultTokenAddress)) {
      setTokenAddress(defaultTokenAddress);
      if (amount && validateAmount(amount)) {
        handleAmountChange(amount);
      }
    }
  }, [defaultTokenAddress]);

  const validateAmount = (value: string): boolean => {
    const numValue = Number(value);
    return !isNaN(numValue) && numValue > 0 && numValue <= 100000;
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
    if (!validateAmount(amount)) {
      toast.error('Please enter a valid amount between 0 and 100,000 SOL');
      return;
    }

    if (!isValidSolanaAddress(tokenAddress)) {
      toast.error('Please enter a valid Solana token address');
      return;
    }

    setIsLoading(true);
    try {
      if (!window.solana?.isPhantom) {
        throw new Error('Please install the Phantom wallet extension');
      }

      const response = await window.solana.connect();
      const userPublicKey = response.publicKey;

      const { swapTransaction } = await executeSwap(tokenAddress, amount, userPublicKey.toString());
      const transactionBuffer = Buffer.from(swapTransaction, 'base64');
      
      let transaction;
      try {
        transaction = VersionedTransaction.deserialize(transactionBuffer);
      } catch {
        transaction = Transaction.from(transactionBuffer);
      }

      const signedTransaction = await window.solana.signTransaction(transaction);
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

  return {
    amount,
    tokenAddress,
    isLoading,
    isQuoteLoading,
    priceQuote,
    handleAmountChange,
    handleTokenAddressChange,
    handleSwap,
  };
};