import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { CoinData } from '@/types/coin';
import { useToast } from "@/hooks/use-toast";
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export const useCoinData = (id: string | undefined) => {
  const [coin, setCoin] = useState<CoinData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const API_URL = 'https://fybgcaeoxptmmcwgslpl.supabase.co/functions/v1/get-coin';

  const fetchCoinData = useCallback(async (isRefresh: boolean = false) => {
    if (!id) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('Fetching coin data for ID:', id);
      const response = await fetch(`${API_URL}?id=${id}`);
      
      if (!response.ok) {
        throw new Error(response.status === 404 ? 'Token not found.' : 'Failed to fetch coin data.');
      }

      const result = await response.json();
      console.log('Received coin data from API:', result);

      if (result.error) {
        throw new Error(result.error);
      }

      const coinData: CoinData = {
        id: result.id,
        name: result.name || 'Unknown Token',
        symbol: result.symbol || '???',
        description: result.description,
        image_url: result.image_url,
        total_supply: result.total_supply,
        circulating_supply: result.circulating_supply,
        non_circulating_supply: result.non_circulating_supply,
        price: result.price,
        change_24h: result.change_24h,
        market_cap: result.market_cap,
        usd_market_cap: result.usd_market_cap,
        volume_24h: result.volume_24h,
        liquidity: result.liquidity,
        solana_addr: result.solana_addr || id,
        historic_data: result.historic_data || []
      };

      console.log('Mapped coin data for UI:', coinData);
      setCoin(coinData);
      
      if (isRefresh) {
        toast({
          title: "Data refreshed",
          description: "Latest market data has been loaded.",
        });
      }
    } catch (err) {
      console.error('Error fetching coin data:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to load coin data',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, toast]);

  useEffect(() => {
    if (!id) return;

    console.log('Setting up real-time subscription for coin:', id);
    
    const channel = supabase.channel('coin_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'coins',
          filter: `id=eq.${id}`
        },
        (payload: RealtimePostgresChangesPayload<Partial<CoinData>>) => {
          console.log('Received real-time update:', payload);
          
          if (payload.new && coin) {
            const newData = payload.new;
            const updatedCoin: CoinData = {
              id: coin.id,
              name: coin.name,
              symbol: coin.symbol,
              description: coin.description,
              image_url: coin.image_url,
              total_supply: coin.total_supply,
              circulating_supply: coin.circulating_supply,
              non_circulating_supply: coin.non_circulating_supply,
              solana_addr: coin.solana_addr,
              historic_data: coin.historic_data,
              price: newData.price !== undefined ? newData.price : coin.price,
              change_24h: newData.change_24h !== undefined ? newData.change_24h : coin.change_24h,
              market_cap: newData.market_cap !== undefined ? newData.market_cap : coin.market_cap,
              usd_market_cap: newData.usd_market_cap !== undefined ? newData.usd_market_cap : coin.usd_market_cap,
              volume_24h: newData.volume_24h !== undefined ? newData.volume_24h : coin.volume_24h,
              liquidity: newData.liquidity !== undefined ? newData.liquidity : coin.liquidity,
            };
            
            setCoin(updatedCoin);

            toast({
              title: "Price Update",
              description: `${updatedCoin.name}'s price data has been updated.`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [id, toast, coin]);

  useEffect(() => {
    fetchCoinData();
  }, [fetchCoinData]);

  return {
    coin,
    loading,
    error,
    refreshing,
    refresh: (isRefresh: boolean = true) => fetchCoinData(isRefresh)
  };
};