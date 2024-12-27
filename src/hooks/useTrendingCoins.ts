import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { CoinData } from "@/types/coin";

interface TrendingCoinResponse {
  coin_id: string;
  search_count: number;
  coins: CoinData;
}

export function useTrendingCoins() {
  const { data: coins, isLoading, refetch } = useQuery({
    queryKey: ['trending-coins'],
    queryFn: async () => {
      console.log('[useTrendingCoins] Fetching trending coins');
      
      try {
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
              market_cap,
              usd_market_cap
            )
          `)
          .order('coins(market_cap)', { ascending: false })
          .limit(30);

        if (error) {
          console.error('[useTrendingCoins] Error fetching trending coins:', error);
          throw error;
        }

        if (!trendingCoins) {
          console.warn('[useTrendingCoins] No trending coins data received');
          return [];
        }

        console.log('[useTrendingCoins] Received trending coins:', trendingCoins);

        return trendingCoins.map((trend: TrendingCoinResponse) => ({
          ...trend.coins,
          searchCount: trend.search_count,
          priceHistory: trend.coins.historic_data
        }));
      } catch (error) {
        console.error('[useTrendingCoins] Error in query function:', error);
        throw error;
      }
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });

  useEffect(() => {
    console.log('[useTrendingCoins] Setting up real-time subscription');
    
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
          console.log('[useTrendingCoins] Received real-time update:', payload);
          // Trigger a refetch when we receive an update
          refetch();
        }
      )
      .subscribe();

    return () => {
      console.log('[useTrendingCoins] Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return { 
    coins: coins || [], 
    isLoading 
  };
}