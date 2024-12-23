import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Connection, PublicKey } from "https://esm.sh/@solana/web3.js@1.95.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchSolanaTokenData(address: string) {
  try {
    console.log('Fetching Solana token data for:', address);
    
    // Initialize connection to Solana mainnet
    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    
    // Get mint info using raw RPC call since we can't use SPL Token in Deno
    const mintPubkey = new PublicKey(address);
    const accountInfo = await connection.getAccountInfo(mintPubkey);
    
    if (!accountInfo) {
      throw new Error('Token account not found');
    }

    // Get token metadata if available (optional)
    let name = "Unknown Token";
    let symbol = "???";
    let decimals = 0;
    
    try {
      const response = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${address}`,
        {
          headers: {
            'accept': 'application/json',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const pair = data.pairs?.[0];
        if (pair) {
          name = pair.baseToken?.name || name;
          symbol = pair.baseToken?.symbol || symbol;
          decimals = pair.baseToken?.decimals || decimals;
        }
      }
    } catch (error) {
      console.warn('Failed to fetch token metadata from DexScreener:', error);
    }

    return {
      success: true,
      data: {
        tokenAddress: address,
        symbol: symbol,
        name: name,
        icon: '',
        website: '',
        twitter: '',
        decimals: decimals,
        holder: 0,
        supply: accountInfo.lamports.toString(),
        price: 0,
        volume24h: 0,
        priceChange24h: 0,
        marketcap: 0
      }
    };
  } catch (error) {
    console.error('Error fetching Solana token data:', error);
    return null;
  }
}

async function fetchDexScreener(address: string) {
  try {
    console.log('Attempting DexScreener fetch for:', address);
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${address}`,
      {
        headers: {
          'accept': 'application/json',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }
    );

    if (!response.ok) {
      console.warn('DexScreener fetch failed:', response.status);
      return null;
    }

    const data = await response.json();
    console.log('DexScreener fetch succeeded:', data);
    
    const pair = data.pairs?.[0];
    if (!pair) {
      console.warn('No pairs found in DexScreener response');
      return null;
    }

    return {
      success: true,
      data: {
        tokenAddress: address,
        symbol: pair.baseToken?.symbol || 'UNKNOWN',
        name: pair.baseToken?.name || 'Unknown Token',
        icon: '',
        website: '',
        twitter: '',
        decimals: pair.baseToken?.decimals || 0,
        holder: 0,
        supply: parseFloat(pair.baseToken?.liquidity?.base || '0'),
        price: parseFloat(pair.priceUsd || '0'),
        volume24h: parseFloat(pair.volume?.h24 || '0'),
        priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
        marketcap: parseFloat(pair.liquidity?.usd || '0')
      }
    };
  } catch (error) {
    console.error('Error in DexScreener fetch:', error);
    return null;
  }
}

export async function fetchSolscanData(address: string) {
  try {
    console.log('Starting token data fetch for address:', address);
    
    // Try Solana RPC first
    const solanaData = await fetchSolanaTokenData(address);
    if (solanaData) {
      console.log('Successfully fetched data from Solana RPC');
      return solanaData;
    }

    // If Solana RPC fails, try DexScreener
    console.log('Solana RPC fetch failed, trying DexScreener');
    const dexScreenerData = await fetchDexScreener(address);
    if (dexScreenerData) {
      console.log('Successfully fetched data from DexScreener');
      return dexScreenerData;
    }

    throw new Error('Failed to fetch token data from both Solana RPC and DexScreener');
  } catch (error) {
    console.error('Error fetching token data:', error);
    throw error;
  }
}