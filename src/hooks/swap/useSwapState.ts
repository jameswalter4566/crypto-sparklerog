import { useState } from 'react';

export const useSwapState = (defaultTokenAddress?: string) => {
  const [amount, setAmount] = useState('');
  const [tokenAddress, setTokenAddress] = useState(defaultTokenAddress || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [priceQuote, setPriceQuote] = useState<number | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);

  return {
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
  };
};