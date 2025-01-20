import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Transaction, VersionedTransaction, Connection, PublicKey } from '@solana/web3.js';
import { isValidSolanaAddress } from '@/utils/solana';
import { fetchPriceQuote, executeSwap, executeSell } from '@/services/jupiter/swapService';

const connection = new Connection(
  'https://rpc.helius.xyz/?api-key=726140d8-6b0d-4719-8702-682d81e94a37'
);

export const useSwap = (defaultTokenAddress?: string) => {
  const [amount, setAmount] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [priceQuote, setPriceQuote] = useState<number | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);

  useEffect(() => {
    if (defaultTokenAddress && isValidSolanaAddress(defaultTokenAddress)) {
      setTokenAddress(defaultTokenAddress);
      fetchTokenBalance(defaultTokenAddress);
    }
  }, [defaultTokenAddress]);

  const fetchTokenBalance = async (address: string) => {
    try {
      // @ts-ignore
      const { solana } = window;
      if (!solana?.isPhantom) {
        console.error('Phantom wallet not found');
        return;
      }

      const response = await solana.connect();
      const userPublicKey = response.publicKey;
      
      // Fetch token balance logic here
      // This is a placeholder - implement actual token balance fetching
      setTokenBalance(100); // Example balance
    } catch (error) {
      console.error('Error fetching token balance:', error);
    }
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
        const quote = await fetchPriceQuote(tokenAddress, value);
        if (!quote) {
          console.error('No price quote received');
          toast.error('Failed to fetch price quote. Please try again.');
          return;
        }
        setPriceQuote(Number(quote) * Number(value));
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
        const quote = await fetchPriceQuote(value, amount);
        if (!quote) {
          console.error('No price quote received');
          toast.error('Failed to fetch price quote. Please try again.');
          return;
        }
        setPriceQuote(Number(quote) * Number(amount));
      } catch (error) {
        console.error('Price quote error:', error);
        toast.error('Failed to fetch price quote. Please try again.');
      } finally {
        setIsQuoteLoading(false);
      }
    }
  };

  const validateAmount = (value: string): boolean => {
    const numValue = Number(value);
    return !isNaN(numValue) && numValue > 0 && numValue <= 100000;
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
      // @ts-ignore
      if (!window.solana?.isPhantom) {
        throw new Error('Please install the Phantom wallet extension');
      }

      const response = await window.solana.connect();
      const userPublicKey = response.publicKey;

      const swapResult = await executeSwap(tokenAddress, amount, userPublicKey.toString());
      
      if (!swapResult || !swapResult.swapTransaction) {
        throw new Error('Failed to create swap transaction');
      }

      const { swapTransaction } = swapResult;
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

  const handleSell = async () => {
    if (!validateAmount(amount)) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!isValidSolanaAddress(tokenAddress)) {
      toast.error('Please enter a valid Solana token address');
      return;
    }

    setIsLoading(true);
    try {
      // @ts-ignore
      if (!window.solana?.isPhantom) {
        throw new Error('Please install the Phantom wallet extension');
      }

      const response = await window.solana.connect();
      const userPublicKey = response.publicKey;

      const sellResult = await executeSell(tokenAddress, amount, userPublicKey.toString());
      
      if (!sellResult || !sellResult.swapTransaction) {
        throw new Error('Failed to create sell transaction');
      }

      const { swapTransaction } = sellResult;
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
      
      toast.success("Sell successful!", {
        description: `Transaction ID: ${txid}`,
        action: {
          label: "View",
          onClick: () => window.open(`https://explorer.solana.com/tx/${txid}`, '_blank'),
        },
      });
    } catch (error) {
      console.error('Sell error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to sell tokens. Please try again.';
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
    tokenBalance,
    handleAmountChange,
    handleTokenAddressChange,
    handleSwap,
    handleSell,
  };
};