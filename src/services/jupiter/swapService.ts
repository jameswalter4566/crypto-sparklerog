import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { toast } from 'sonner';

export const fetchPriceQuote = async (tokenAddress: string, inputAmount: string) => {
  const response = await fetch(`https://api.jup.ag/price/v2?ids=${tokenAddress}&vsToken=So11111111111111111111111111111111111111112`);
  if (!response.ok) throw new Error('Failed to fetch price quote');
  const data = await response.json();
  return data.data[tokenAddress]?.price;
};

export const executeSwap = async (tokenAddress: string, amount: string, userPublicKey: string) => {
  // Get quote from Jupiter
  const quoteResponse = await fetch(
    `https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${tokenAddress}&amount=${Number(amount) * LAMPORTS_PER_SOL}&slippageBps=50`
  );
  
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

  const swapResponse = await fetch('https://quote-api.jup.ag/v6/swap', {
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