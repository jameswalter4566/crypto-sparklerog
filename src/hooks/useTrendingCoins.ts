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
        const response = await fetch('https://frontend-api-v2.pump.fun/coins/for-you?offset=0&limit=50&includeNsfw=false', {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'Accept-Encoding': 'gzip',
            'Accept-Language': 'en-US,en;q=0.9',
            'Origin': 'https://pump.fun',
            'Referer': 'https://pump.fun/',
            'Referrer-Policy': 'strict-origin-when-cross-origin'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch coins: ${response.status}`);
        }

        const data = await response.json();
        console.log('[useTrendingCoins] Received data from API:', data);

        // Map the API response to our CoinData format
        return data.map((coin: any) => ({
          id: coin.mint,
          name: coin.name,
          symbol: coin.symbol,
          price: coin.price,
          change_24h: coin.price_change_24h,
          imageUrl: coin.image_uri,
          mintAddress: coin.mint,
          priceHistory: coin.price_history,
          usdMarketCap: coin.usd_market_cap,
          description: coin.description,
          twitter: coin.twitter,
          website: coin.website,
          volume24h: coin.volume_24h,
          liquidity: coin.liquidity,
          searchCount: 0, // Default since this comes from a different source
          coingecko_id: null,
          decimals: null,
          homepage: coin.website,
          blockchain_site: [],
          official_forum_url: [],
          chat_url: [coin.telegram].filter(Boolean),
          announcement_url: []
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