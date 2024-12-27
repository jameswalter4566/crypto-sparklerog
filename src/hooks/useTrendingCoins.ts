import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface PriceHistoryItem {
  price: number;
  timestamp: string;
}

interface CoinData {
  id: string;
  name: string;
  symbol: string;
  price: number | null;
  change_24h: number | null;
  image_url: string | null;
  solana_addr: string | null;
  priceHistory: PriceHistoryItem[] | null;
  searchCount: number;
  usdMarketCap: number | null;
}

export function useTrendingCoins() {
  const { toast } = useToast();

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
          .order('search_count', { ascending: false })
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

        return trendingCoins
          .filter(trend => trend && trend.coins) // Filter out null/undefined entries
          .map(trend => {
            if (!trend.coins) {
              console.warn('[useTrendingCoins] Missing coins data for trend:', trend);
              return null;
            }

            let priceHistory: PriceHistoryItem[] | null = null;
            
            try {
              if (trend.coins.historic_data) {
                const historyData = trend.coins.historic_data as unknown as Array<{
                  price: number | string;
                  timestamp: string | number;
                }>;
                
                if (Array.isArray(historyData)) {
                  priceHistory = historyData.map(item => ({
                    price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
                    timestamp: typeof item.timestamp === 'number' 
                      ? new Date(item.timestamp).toISOString() 
                      : String(item.timestamp)
                  }));
                }
              }
            } catch (err) {
              console.error('[useTrendingCoins] Error parsing historic data:', err);
              priceHistory = null;
            }

            return {
              ...trend.coins,
              searchCount: trend.search_count,
              priceHistory,
              usdMarketCap: trend.coins.usd_market_cap
            };
          })
          .filter(Boolean) as CoinData[]; // Filter out null entries after mapping
      } catch (error) {
        console.error('[useTrendingCoins] Error in query function:', error);
        throw error;
      }
    },
    refetchInterval: 5000,
    gcTime: Infinity,
    staleTime: 0,
  });

  useEffect(() => {
    console.log('[useTrendingCoins] Setting up real-time subscription');
    
    const channel = supabase
      .channel('coin-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'coins'
        },
        (payload) => {
          console.log('[useTrendingCoins] Received real-time update:', payload);
          
          if (payload.new) {
            refetch();
            
            if (payload.new.name) {
              toast({
                title: "Market Data Updated",
                description: `Latest data received for ${payload.new.name}`,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      console.log('[useTrendingCoins] Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [refetch, toast]);

  return { 
    coins: coins || [], // Ensure we always return an array
    isLoading 
  };
}