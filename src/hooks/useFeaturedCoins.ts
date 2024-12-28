import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useFeaturedCoins = () => {
  return useQuery({
    queryKey: ['featuredCoins'],
    queryFn: async () => {
      console.log('[useFeaturedCoins] Fetching featured coins');
      
      const { data: trendingCoins, error } = await supabase
        .from('coin_searches')
        .select(`
          coin_id,
          search_count,
          coins (
            id,
            name,
            symbol,
            price,
            change_24h,
            image_url,
            solana_addr,
            historic_data,
            usd_market_cap
          )
        `)
        .order('search_count', { ascending: false })
        .limit(20);

      if (error) {
        console.error('[useFeaturedCoins] Error fetching coins:', error);
        throw error;
      }

      console.log('[useFeaturedCoins] Received coins:', trendingCoins);

      return trendingCoins.map(trend => ({
        id: trend.coins.id,
        name: trend.coins.name,
        symbol: trend.coins.symbol,
        price: trend.coins.price,
        change_24h: trend.coins.change_24h,
        imageUrl: trend.coins.image_url,
        mintAddress: trend.coins.solana_addr,
        priceHistory: trend.coins.historic_data,
        usdMarketCap: trend.coins.usd_market_cap,
        searchCount: trend.search_count
      }));
    },
    refetchInterval: 5000
  });
};