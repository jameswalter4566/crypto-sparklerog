import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface CoinData {
  id: string;
  name: string;
  symbol: string;
  price: number | null;
  change_24h: number | null;
  image_url: string | null;
  solana_addr: string | null;
  historic_data: Array<{ price: number; timestamp: string }> | null;
  usd_market_cap: number | null;
}

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

        return (exploreCoins as unknown as ExploreCoinResponse[]).map((explore) => ({
          id: explore.coins.id,
          name: explore.coins.name,
          symbol: explore.coins.symbol,
          price: explore.coins.price,
          change_24h: explore.coins.change_24h,
          imageUrl: explore.coins.image_url,
          mintAddress: explore.coins.solana_addr,
          priceHistory: explore.coins.historic_data,
          usdMarketCap: explore.coins.usd_market_cap,
          searchCount: explore.search_count
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