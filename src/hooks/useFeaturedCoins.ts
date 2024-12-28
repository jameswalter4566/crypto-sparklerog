import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useFeaturedCoins = () => {
  return useQuery({
    queryKey: ['featuredCoins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coins')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(20);

      if (error) {
        throw error;
      }

      return data.map(coin => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        price: coin.price,
        change_24h: coin.change_24h,
        imageUrl: coin.image_url,
        mintAddress: coin.solana_addr,
        priceHistory: coin.historic_data,
        usdMarketCap: coin.usd_market_cap
      }));
    },
    refetchInterval: 5000 // Refetch every 5 seconds to check for new coins
  });
};