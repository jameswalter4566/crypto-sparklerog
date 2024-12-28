import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef } from "react";
import { CoinData } from "@/types/coin";

export function useTrendingCoins() {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const { data: coins, isLoading, refetch } = useQuery({
    queryKey: ['trending-coins'],
    queryFn: async () => {
      console.log('[useTrendingCoins] Fetching trending coins');
      
      try {
        // First try to fetch from Supabase
        const { data: supabaseCoins, error } = await supabase
          .from('coins')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('[useTrendingCoins] Supabase error:', error);
          throw error;
        }

        if (supabaseCoins && supabaseCoins.length > 0) {
          console.log('[useTrendingCoins] Using Supabase data:', supabaseCoins);
          return supabaseCoins;
        }

        // Fallback to direct API call if no Supabase data
        const response = await fetch('https://frontend-api-v2.pump.fun/coins/for-you?offset=0&limit=50&includeNsfw=false', {
          method: 'GET',
          headers: {
            'Accept': '*/*',
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
        console.log('[useTrendingCoins] Received data from Pump API:', data);

        // Map the API response to our CoinData format
        const mappedCoins = data.map((coin: any) => ({
          id: coin.mint,
          name: coin.name,
          symbol: coin.symbol,
          price: coin.virtual_sol_reserves / coin.virtual_token_reserves,
          change_24h: 0, // Calculate from historic data if available
          imageUrl: coin.image_uri,
          mintAddress: coin.mint,
          priceHistory: [], // Would need separate API call for history
          usdMarketCap: coin.usd_market_cap,
          description: coin.description,
          twitter: coin.twitter,
          website: coin.website,
          volume24h: coin.virtual_sol_reserves,
          liquidity: coin.virtual_token_reserves,
          searchCount: 0
        }));

        // Store the fetched data in Supabase for future use
        const { error: insertError } = await supabase
          .from('coins')
          .upsert(mappedCoins.map(coin => ({
            ...coin,
            updated_at: new Date().toISOString()
          })));

        if (insertError) {
          console.error('[useTrendingCoins] Error storing in Supabase:', insertError);
        }

        return mappedCoins;
      } catch (error) {
        console.error('[useTrendingCoins] Error in query function:', error);
        throw error;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000,
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