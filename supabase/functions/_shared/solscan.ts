import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Connection, PublicKey } from "https://esm.sh/@solana/web3.js@1.95.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchDexScreener(address: string) {
  try {
    console.log('Fetching DexScreener data for:', address);
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${address}`,
      {
        headers: {
          'accept': 'application/json',
          'user-agent': 'Mozilla/5.0'
        }
      }
    );

    if (!response.ok) {
      console.warn('DexScreener fetch failed:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (!data.pairs || data.pairs.length === 0) {
      console.warn('No pairs found in DexScreener response');
      return null;
    }

    // Only get the first pair to reduce data
    const pair = data.pairs[0];
    const baseToken = pair.baseToken;

    // Get logo URL from Jupiter API
    let logoUrl = null;
    try {
      const jupiterResponse = await fetch('https://token.jup.ag/all');
      if (jupiterResponse.ok) {
        const jupiterData = await jupiterResponse.json();
        const token = jupiterData.tokens.find((t: any) => t.address === address);
        logoUrl = token?.logoURI;
      }
    } catch (error) {
      console.warn('Failed to fetch logo from Jupiter:', error);
    }

    return {
      success: true,
      data: {
        tokenAddress: address,
        symbol: baseToken?.symbol || 'UNKNOWN',
        name: baseToken?.name || 'Unknown Token',
        icon: logoUrl,
        decimals: baseToken?.decimals || 0,
        supply: parseFloat(baseToken?.liquidity?.base || '0'),
        price: parseFloat(pair.priceUsd || '0'),
        volume24h: parseFloat(pair.volume?.h24 || '0'),
        priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
        marketcap: baseToken.liquidity?.usd ? parseFloat(baseToken.liquidity.usd) : null,
        liquidity: parseFloat(pair.liquidity?.usd || '0')
      }
    };
  } catch (error) {
    console.error('Error in DexScreener fetch:', error);
    return null;
  }
}

async function fetchSolanaTokenData(address: string) {
  try {
    console.log('Fetching Solana token data for:', address);
    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    const mintPubkey = new PublicKey(address);
    const accountInfo = await connection.getAccountInfo(mintPubkey);
    
    if (!accountInfo) {
      throw new Error('Token account not found');
    }

    // Fetch metadata from token list
    let tokenMetadata = null;
    try {
      const response = await fetch('https://token.jup.ag/all');
      if (response.ok) {
        const data = await response.json();
        tokenMetadata = data.tokens.find((token: any) => token.address === address);
      }
    } catch (error) {
      console.warn('Failed to fetch token metadata:', error);
    }

    return {
      success: true,
      data: {
        tokenAddress: address,
        symbol: tokenMetadata?.symbol || 'UNKNOWN',
        name: tokenMetadata?.name || 'Unknown Token',
        icon: tokenMetadata?.logoURI || '',
        decimals: tokenMetadata?.decimals || 0,
        supply: accountInfo.lamports.toString(),
        price: 0,
        volume24h: 0,
        priceChange24h: 0,
        marketcap: 0,
        liquidity: 0
      }
    };
  } catch (error) {
    console.error('Error fetching Solana token data:', error);
    return null;
  }
}

export async function fetchSolscanData(address: string) {
  try {
    console.log('Starting token data fetch for address:', address);
    
    // Try DexScreener first for price and market data
    const dexScreenerData = await fetchDexScreener(address);
    if (dexScreenerData) {
      console.log('Successfully fetched data from DexScreener');
      return dexScreenerData;
    }

    // Fallback to basic Solana data
    console.log('DexScreener fetch failed, trying Solana RPC');
    const solanaData = await fetchSolanaTokenData(address);
    if (solanaData) {
      console.log('Successfully fetched data from Solana RPC');
      return solanaData;
    }

    throw new Error('Failed to fetch token data from both DexScreener and Solana RPC');
  } catch (error) {
    console.error('Error fetching token data:', error);
    throw error;
  }
}