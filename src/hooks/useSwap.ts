import { useEffect } from 'react';
import { toast } from 'sonner';
import { Transaction, VersionedTransaction, Connection } from '@solana/web3.js';
import { isValidSolanaAddress } from '@/utils/solana';
import { fetchPriceQuote, executeSwap, executeSell } from '@/services/jupiter/swapService';
import { useSwapState } from './swap/useSwapState';
import { useTokenBalance } from './swap/useTokenBalance';

const connection = new Connection(
  'https://rpc.helius.xyz/?api-key=726140d8-6b0d-4719-8702-682d81e94a37'
);

export const useSwap = (defaultTokenAddress?: string) => {
  const {
    amount,
    setAmount,
    tokenAddress,
    setTokenAddress,
    isLoading,
    setIsLoading,
    isQuoteLoading,
    setIsQuoteLoading,
    priceQuote,
    setPriceQuote,
    tokenBalance,
    setTokenBalance,
  } = useSwapState(defaultTokenAddress);

  useTokenBalance(tokenAddress, setTokenBalance);

  useEffect(() => {
    if (defaultTokenAddress && isValidSolanaAddress(defaultTokenAddress)) {
      setTokenAddress(defaultTokenAddress);
    }
  }, [defaultTokenAddress]);

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
          setPriceQuote(Number(price));
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
          setPriceQuote(Number(price));
        }
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
    return !isNaN(numValue) && numValue > 0;
  };

  const handleTransaction = async (
    transactionBuffer: Buffer,
    successMessage: string
  ) => {
    let transaction;
    try {
      transaction = VersionedTransaction.deserialize(transactionBuffer);
    } catch {
      transaction = Transaction.from(transactionBuffer);
    }

    // @ts-ignore
    const signedTransaction = await window.solana.signTransaction(transaction);
    const serializedTransaction = signedTransaction instanceof VersionedTransaction 
      ? signedTransaction.serialize()
      : signedTransaction.serialize();
      
    const txid = await connection.sendRawTransaction(
      serializedTransaction,
      { skipPreflight: false, maxRetries: 3 }
    );
    
    toast.success(successMessage, {
      description: `Transaction ID: ${txid}`,
      action: {
        label: "View",
        onClick: () => window.open(`https://explorer.solana.com/tx/${txid}`, '_blank'),
      },
    });
  };

  const handleSwap = async () => {
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
      if (!window.solana?.isPhantom) {
        throw new Error('Please install the Phantom wallet extension');
      }

      const response = await window.solana.connect();
      const userPublicKey = response.publicKey;

      const { swapTransaction } = await executeSwap(tokenAddress, amount, userPublicKey.toString());
      const transactionBuffer = Buffer.from(swapTransaction, 'base64');
      
      await handleTransaction(transactionBuffer, "Swap successful!");
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
      if (!window.solana?.isPhantom) {
        throw new Error('Please install the Phantom wallet extension');
      }

      const response = await window.solana.connect();
      const userPublicKey = response.publicKey;

      const { swapTransaction } = await executeSell(tokenAddress, amount, userPublicKey.toString());
      const transactionBuffer = Buffer.from(swapTransaction, 'base64');
      
      await handleTransaction(transactionBuffer, "Sell successful!");
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