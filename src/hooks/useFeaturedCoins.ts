import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const useFeaturedCoins = () => {
  const { data: coins, isLoading, refetch } = useQuery({
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

      // Poll the new coins endpoint
      try {
        await fetch('https://fybgcaeoxptmmcwgslpl.supabase.co/functions/v1/poll-new-coins');
      } catch (error) {
        console.error('[useFeaturedCoins] Error polling new coins:', error);
      }

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
    refetchInterval: 3000 // Refetch every 3 seconds
  });

  useEffect(() => {
    // Set up real-time subscription for coin updates
    const channel = supabase
      .channel('coin-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'coins'
        },
        (payload) => {
          console.log('[useFeaturedCoins] Received real-time update:', payload);
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return { coins, isLoading };
};