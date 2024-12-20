import { supabase } from "@/integrations/supabase/client";

interface TokenData {
  id: string;
  name: string;
  symbol: string;
  image?: string;
  price?: number;
  market_cap?: number;
  volume_24h?: number;
  liquidity?: number;
}

export const saveCoinData = async (coinData: TokenData) => {
  const { error: upsertError } = await supabase
    .from('coins')
    .upsert({
      id: coinData.id,
      name: coinData.name,
      symbol: coinData.symbol,
      image_url: coinData.image,
      price: coinData.price,
      market_cap: coinData.market_cap,
      volume_24h: coinData.volume_24h,
      liquidity: coinData.liquidity,
    });

  if (upsertError) {
    console.error('Error saving coin data:', upsertError);
    throw new Error(`Failed to save coin data: ${upsertError.message}`);
  }
};