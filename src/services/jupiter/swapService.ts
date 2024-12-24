import { LAMPORTS_PER_SOL } from '@solana/web3.js';

const JUPITER_API_BASE = 'https://quote-api.jup.ag/v6';

export const fetchPriceQuote = async (tokenAddress: string, inputAmount: string) => {
  console.log('Fetching price quote for token:', tokenAddress, 'amount:', inputAmount);
  const response = await fetch(`https://api.jup.ag/price/v2?ids=${tokenAddress}&vsToken=So11111111111111111111111111111111111111112`);
  if (!response.ok) throw new Error('Failed to fetch price quote');
  const data = await response.json();
  return data.data[tokenAddress]?.price;
};

export const executeSwap = async (tokenAddress: string, amount: string, userPublicKey: string) => {
  console.log('Executing swap for token:', tokenAddress, 'amount:', amount);
  // Get quote from Jupiter
  const quoteUrl = `${JUPITER_API_BASE}/quote`;
  const quoteParams = new URLSearchParams({
    inputMint: 'So11111111111111111111111111111111111111112',
    outputMint: tokenAddress,
    amount: (Number(amount) * LAMPORTS_PER_SOL).toString(),
    slippageBps: '50'
  });

  const quoteResponse = await fetch(`${quoteUrl}?${quoteParams}`);
  
  if (!quoteResponse.ok) {
    const errorData = await quoteResponse.json();
    throw new Error(errorData.message || 'Failed to get quote');
  }
  
  const quoteData = await quoteResponse.json();

  // Get swap transaction
  const swapRequestBody = {
    quoteResponse: quoteData,
    userPublicKey: userPublicKey,
    wrapUnwrapSOL: true,
  };

  const swapResponse = await fetch(`${JUPITER_API_BASE}/swap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(swapRequestBody),
  });

  if (!swapResponse.ok) {
    const errorData = await swapResponse.json();
    throw new Error(errorData.message || 'Failed to get swap transaction');
  }
  
  return await swapResponse.json();
};

export const executeSell = async (tokenAddress: string, amount: string, userPublicKey: string) => {
  console.log('Executing sell for token:', tokenAddress, 'amount:', amount);
  // Get quote from Jupiter for selling tokens back to SOL
  const quoteUrl = `${JUPITER_API_BASE}/quote`;
  const quoteParams = new URLSearchParams({
    inputMint: tokenAddress,
    outputMint: 'So11111111111111111111111111111111111111112',
    amount: (Number(amount) * LAMPORTS_PER_SOL).toString(),
    slippageBps: '50'
  });

  const quoteResponse = await fetch(`${quoteUrl}?${quoteParams}`);
  
  if (!quoteResponse.ok) {
    const errorData = await quoteResponse.json();
    throw new Error(errorData.message || 'Failed to get quote');
  }
  
  const quoteData = await quoteResponse.json();

  // Get swap transaction
  const swapRequestBody = {
    quoteResponse: quoteData,
    userPublicKey: userPublicKey,
    wrapUnwrapSOL: true,
  };

  const swapResponse = await fetch(`${JUPITER_API_BASE}/swap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(swapRequestBody),
  });

  if (!swapResponse.ok) {
    const errorData = await swapResponse.json();
    throw new Error(errorData.message || 'Failed to get swap transaction');
  }
  
  return await swapResponse.json();
};