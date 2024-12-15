import { supabase } from "@/integrations/supabase/client";

const JUPITER_API_BASE = "https://price.jup.ag/v4";

interface JupiterPrice {
  id: string;
  mintSymbol: string;
  vsToken: string;
  vsTokenSymbol: string;
  price: number;
}

interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI?: string;
}

export async function fetchJupiterPrices() {
  try {
    // Fetch token list first to get metadata
    const tokenListResponse = await fetch("https://token.jup.ag/strict");
    const tokenList = await tokenListResponse.json();
    const tokens: Record<string, TokenInfo> = {};
    tokenList.forEach((token: TokenInfo) => {
      tokens[token.address] = token;
    });

    // Fetch prices
    const pricesResponse = await fetch(`${JUPITER_API_BASE}/price`);
    const pricesData = await pricesResponse.json();
    
    // Process and store data
    const updates = Object.entries(pricesData.data).map(([mintAddress, priceData]: [string, any]) => {
      const token = tokens[mintAddress];
      if (!token) return null;

      const price = priceData.price;
      const change24h = (Math.random() * 40) - 20; // Mock 24h change as Jupiter doesn't provide this

      return {
        id: mintAddress,
        name: token.name,
        symbol: token.symbol,
        image_url: token.logoURI,
        price: price,
        change_24h: change24h,
        market_cap: price * 1000000, // Mock market cap
        volume_24h: price * 100000, // Mock volume
        liquidity: price * 50000, // Mock liquidity
        updated_at: new Date().toISOString()
      };
    }).filter(Boolean);

    // Update Supabase database
    const { error } = await supabase
      .from('coins')
      .upsert(updates, { onConflict: 'id' });

    if (error) {
      console.error('Error updating coins:', error);
      return null;
    }

    return updates;
  } catch (error) {
    console.error('Error fetching Jupiter prices:', error);
    return null;
  }
}