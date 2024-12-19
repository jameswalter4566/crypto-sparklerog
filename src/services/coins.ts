import { supabase } from "@/integrations/supabase/client";
import type { TokenMetadata } from "./helius";

export const saveCoinData = async (coinData: TokenMetadata) => {
  const { error: upsertError } = await supabase
    .from('coins')
    .upsert({
      id: coinData.id,
      name: coinData.name,
      symbol: coinData.symbol,
      image_url: coinData.image,
      price: coinData.price,
      market_cap: coinData.marketCap,
      volume_24h: coinData.volume24h,
      liquidity: coinData.liquidity,
    });

  if (upsertError) {
    console.error('Error saving coin data:', upsertError);
    throw new Error(`Failed to save coin data: ${upsertError.message}`);
  }
};