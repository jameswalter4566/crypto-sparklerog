import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { CoinData } from "@/types/coin";

interface ExploreCoinResponse {
  coin_id: string;
  search_count: number;
  coins: CoinData;
}

export function useExploreCoins() {
  const { data: coins, isLoading, refetch } = useQuery({
    queryKey: ['explore-coins'],
    queryFn: async () => {
      console.log('[useExploreCoins] Fetching most searched coins');
      
      try {
        const { data: exploreCoins, error } = await supabase
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
          .order('search_count', { ascending: false })
          .limit(30);

        if (error) {
          console.error('[useExploreCoins] Error fetching explore coins:', error);
          throw error;
        }

        if (!exploreCoins) {
          console.warn('[useExploreCoins] No explore coins data received');
          return [];
        }

        console.log('[useExploreCoins] Received explore coins:', exploreCoins);

        return exploreCoins.map((explore: ExploreCoinResponse) => ({
          ...explore.coins,
          searchCount: explore.search_count,
          priceHistory: explore.coins.historic_data
        }));
      } catch (error) {
        console.error('[useExploreCoins] Error in query function:', error);
        throw error;
      }
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });

  useEffect(() => {
    console.log('[useExploreCoins] Setting up real-time subscription');
    
    const channel = supabase
      .channel('coin-search-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'coin_searches'
        },
        (payload) => {
          console.log('[useExploreCoins] Received real-time update:', payload);
          refetch();
        }
      )
      .subscribe();

    return () => {
      console.log('[useExploreCoins] Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return { 
    coins: coins || [], 
    isLoading 
  };
}