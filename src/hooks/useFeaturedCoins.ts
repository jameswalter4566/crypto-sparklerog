import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface CoinSearchResult {
  coin_id: string;
  search_count: number;
  coins: {
    id: string;
    name: string;
    symbol: string;
    price: number | null;
    change_24h: number | null;
    image_url: string | null;
    solana_addr: string | null;
    historic_data: Array<{ price: number; timestamp: string }> | null;
    usd_market_cap: number | null;
    description: string | null;
    twitter_screen_name: string | null;
    homepage: string | null;
    volume_24h: number | null;
    liquidity: number | null;
  };
}

export const useFeaturedCoins = () => {
  const { data: coins, isLoading, refetch } = useQuery({
    queryKey: ['featuredCoins'],
    queryFn: async () => {
      console.log('[useFeaturedCoins] Fetching featured coins from pump.fun');
      
      try {
        const { data: pumpData, error: pumpError } = await supabase.functions.invoke('poll-new-coins', {
          method: 'POST'
        });

        if (pumpError) {
          console.error('[useFeaturedCoins] Error fetching from pump.fun:', pumpError);
          throw pumpError;
        }

        if (!pumpData || !pumpData.coins) {
          console.log('[useFeaturedCoins] No coins received from pump.fun');
          return [];
        }

        console.log('[useFeaturedCoins] Received coins from pump.fun:', pumpData.coins);
        
        return pumpData.coins.map((coin: any) => ({
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol,
          price: coin.price || 0,
          change_24h: coin.change_24h || 0,
          imageUrl: coin.image_url,
          mintAddress: coin.solana_addr,
          priceHistory: null,
          usdMarketCap: coin.usd_market_cap,
          description: coin.description,
          twitter: coin.twitter_screen_name,
          website: coin.homepage,
          volume24h: coin.volume_24h || 0,
          liquidity: coin.liquidity || 0,
          searchCount: 0
        }));
      } catch (error) {
        console.error('[useFeaturedCoins] Error in query function:', error);
        throw error;
      }
    },
    refetchInterval: 3000
  });

  return { 
    coins: coins || [], 
    isLoading 
  };
};