import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef } from "react";
import { CoinData } from "@/types/coin";

interface TrendingCoinResponse {
  coin_id: string;
  search_count: number;
  coins: CoinData;
}

export function useTrendingCoins() {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

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
              usd_market_cap,
              description,
              twitter_screen_name,
              website,
              total_supply,
              volume_24h,
              liquidity
            )
          `)
          .order('search_count', { ascending: false })
          .limit(50);

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
          id: trend.coins.id,
          name: trend.coins.name,
          symbol: trend.coins.symbol,
          price: trend.coins.price,
          change_24h: trend.coins.change_24h,
          imageUrl: trend.coins.image_url,
          mintAddress: trend.coins.solana_addr,
          priceHistory: trend.coins.historic_data,
          usdMarketCap: trend.coins.usd_market_cap,
          description: trend.coins.description,
          twitter: trend.coins.twitter_screen_name,
          website: trend.coins.website,
          totalSupply: trend.coins.total_supply,
          volume24h: trend.coins.volume_24h,
          liquidity: trend.coins.liquidity,
          searchCount: trend.search_count
        }));
      } catch (error) {
        console.error('[useTrendingCoins] Error in query function:', error);
        throw error;
      }
    },
    refetchInterval: 3000,
    staleTime: 1000,
  });

  useEffect(() => {
    if (channelRef.current) {
      return;
    }

    console.log('[useTrendingCoins] Setting up real-time subscription');
    
    channelRef.current = supabase
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
          refetch();
        }
      )
      .subscribe();

    return () => {
      console.log('[useTrendingCoins] Cleaning up real-time subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [refetch]);

  return { 
    coins: coins || [], 
    isLoading 
  };
}