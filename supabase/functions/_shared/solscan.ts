import { Connection, PublicKey } from '@solana/web3.js';
import { getMint } from '@solana/spl-token';

interface SolscanTokenResponse {
  success: boolean;
  data: {
    tokenAddress: string;
    symbol: string;
    name: string;
    icon: string;
    website: string;
    twitter: string;
    decimals: number;
    holder: number;
    supply: number;
    price: number;
    volume24h: number;
    priceChange24h: number;
    marketcap: number;
  };
}

async function fetchSolanaTokenData(address: string): Promise<SolscanTokenResponse | null> {
  try {
    console.log('Fetching Solana token data for:', address);
    
    // Initialize connection to Solana mainnet
    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    
    // Get mint info
    const mintPubkey = new PublicKey(address);
    const mintInfo = await getMint(connection, mintPubkey);
    
    // Get token metadata if available (optional)
    let name = "Unknown Token";
    let symbol = "???";
    
    try {
      const response = await fetch(
        `https://api.solscan.io/v2/token/meta?token=${address}`,
        {
          headers: {
            'accept': 'application/json',
            'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOjE3MzQ5ODkyMTAxNzksImVtYWlsIjoiZGV0aHNxdWFkYWlyc29mdDE0NkBnbWFpbC5jb20iLCJhY3Rpb24iOiJ0b2tlbi1hcGkiLCJhcGlWZXJzaW9uIjoidjIiLCJpYXQiOjE3MzQ5ODkyMTB9.xw_B2uzgczFn2F-ZeW2u4tvvapS_iRvLIRKNz2DB7K0'
          }
        }
      );

      if (response.ok) {
        const metadata = await response.json();
        name = metadata.data?.name || name;
        symbol = metadata.data?.symbol || symbol;
      }
    } catch (error) {
      console.warn('Failed to fetch token metadata from Solscan:', error);
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
        decimals: mintInfo.decimals,
        holder: 0,
        supply: Number(mintInfo.supply.toString()),
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

async function fetchDexScreener(address: string): Promise<SolscanTokenResponse | null> {
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
        icon: '', // DexScreener doesn't provide icons
        website: '',
        twitter: '',
        decimals: 0,
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

export async function fetchSolscanData(address: string): Promise<SolscanTokenResponse | null> {
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