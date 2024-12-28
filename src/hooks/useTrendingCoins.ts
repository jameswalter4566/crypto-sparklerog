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

        // If no data in Supabase, fetch from edge function
        const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke('poll-new-coins');

        if (edgeFunctionError) {
          console.error('[useTrendingCoins] Edge function error:', edgeFunctionError);
          throw edgeFunctionError;
        }

        console.log('[useTrendingCoins] Received data from edge function:', edgeFunctionData);
        return edgeFunctionData.coins || [];

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