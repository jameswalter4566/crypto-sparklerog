import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Connection, PublicKey } from "https://esm.sh/@solana/web3.js@1.95.8";
import { Metadata } from "https://esm.sh/@metaplex-foundation/mpl-token-metadata@2.13.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchTokenMetadata(address: string) {
  try {
    console.log('Fetching token metadata for:', address);
    const connection = new Connection('https://api.mainnet-beta.solana.com');
    
    // Get token metadata
    const mint = new PublicKey(address);
    const metadataPDA = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(),
        mint.toBuffer(),
      ],
      new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
    )[0];

    const metadataAccount = await connection.getAccountInfo(metadataPDA);
    if (!metadataAccount) {
      console.log('No metadata found for token');
      return null;
    }

    const metadata = Metadata.deserialize(metadataAccount.data)[0];
    return metadata;
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    return null;
  }
}

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
    if (!data.pairs?.[0]) {
      console.warn('No pairs found in DexScreener response');
      return null;
    }

    const pair = data.pairs[0];
    return {
      success: true,
      data: {
        tokenAddress: address,
        symbol: pair.baseToken?.symbol || 'UNKNOWN',
        name: pair.baseToken?.name || 'Unknown Token',
        decimals: pair.baseToken?.decimals || 0,
        price: Number(pair.priceUsd) || 0,
        volume24h: Number(pair.volume?.h24) || 0,
        priceChange24h: Number(pair.priceChange?.h24) || 0,
        marketcap: pair.liquidity?.usd ? Number(pair.liquidity.usd) : null,
        liquidity: Number(pair.liquidity?.usd) || 0
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
    
    // Try DexScreener first for market data
    const dexScreenerData = await fetchDexScreener(address);
    
    // Fetch token metadata regardless of DexScreener result
    const metadata = await fetchTokenMetadata(address);
    
    if (dexScreenerData) {
      console.log('Successfully fetched data from DexScreener');
      return {
        success: true,
        data: {
          ...dexScreenerData.data,
          name: metadata?.data.name || dexScreenerData.data.name,
          symbol: metadata?.data.symbol || dexScreenerData.data.symbol,
          description: metadata?.data.description || null
        }
      };
    }

    // If DexScreener fails but we have metadata, return basic token info
    if (metadata) {
      console.log('Using metadata for basic token info');
      return {
        success: true,
        data: {
          tokenAddress: address,
          symbol: metadata.data.symbol || 'UNKNOWN',
          name: metadata.data.name || 'Unknown Token',
          description: metadata.data.description || null,
          decimals: 0,
          price: 0,
          volume24h: 0,
          priceChange24h: 0,
          marketcap: 0,
          liquidity: 0
        }
      };
    }

    console.log('No data available for token, using minimal data');
    return {
      success: true,
      data: {
        tokenAddress: address,
        symbol: 'UNKNOWN',
        name: 'Unknown Token',
        decimals: 0,
        price: 0,
        volume24h: 0,
        priceChange24h: 0,
        marketcap: 0,
        liquidity: 0
      }
    };
  } catch (error) {
    console.error('Error fetching token data:', error);
    throw error;
  }
}