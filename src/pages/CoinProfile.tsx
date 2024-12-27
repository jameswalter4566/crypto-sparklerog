import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CandlestickChart } from "lucide-react";
import { TokenHeader } from "@/components/coin/TokenHeader";
import { TokenStats } from "@/components/coin/TokenStats";
import { TokenSupply } from "@/components/coin/TokenSupply";
import { PriceChart } from "@/components/coin/PriceChart";
import { VoiceChat } from "@/components/coin/VoiceChat";
import { SwapInterface } from "@/components/SwapInterface";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface CoinData {
  id: string;
  name: string;
  symbol: string;
  description: string | null;
  image_url: string | null;
  total_supply: number | null;
  price: number | null;
  change_24h: number | null;
  market_cap: number | null;
  usd_market_cap: number | null;
  volume_24h: number | null;
  liquidity: number | null;
  solana_addr: string | null;
  historic_data: Array<{ price: number; timestamp: string }> | null;
}

const CoinProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [coin, setCoin] = useState<CoinData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const API_URL = 'https://fybgcaeoxptmmcwgslpl.supabase.co/functions/v1/get-coin';

  const fetchCoinData = useCallback(async (isRefresh: boolean = false) => {
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

      // Map the response data directly to our component's expected format
      const coinData = {
        id: result.id,
        name: result.name || 'Unknown Token',
        symbol: result.symbol || '???',
        image_url: result.image_url,
        price: typeof result.price === 'number' ? result.price : null,
        description: result.description,
        token_standard: 'SPL', // Solana tokens are SPL standard
        decimals: result.decimals,
        volume_24h: result.volume_24h,
        liquidity: result.liquidity,
        solana_addr: result.solana_addr || id,
        supply: {
          total: result.total_supply,
          circulating: result.circulating_supply,
          nonCirculating: result.non_circulating_supply
        },
        historic_data: result.historic_data || [],
        social: {
          homepage: result.homepage,
          twitter: result.twitter_screen_name,
          chat: result.chat_url,
          announcement: result.announcement_url
        },
        market_cap: result.market_cap,
        usd_market_cap: result.usd_market_cap
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

  // Set up real-time subscription for price updates
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
        (payload: RealtimePostgresChangesPayload<CoinData>) => {
          console.log('Received real-time update:', payload);
          
          if (payload.new) {
            setCoin(prevCoin => {
              if (!prevCoin) return payload.new;
              return {
                ...prevCoin,
                price: payload.new.price,
                change_24h: payload.new.change_24h,
                market_cap: payload.new.market_cap,
                usd_market_cap: payload.new.usd_market_cap,
                volume_24h: payload.new.volume_24h,
                liquidity: payload.new.liquidity
              };
            });

            toast({
              title: "Price Update",
              description: `${payload.new.name}'s price data has been updated.`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [id, toast]);

  useEffect(() => {
    fetchCoinData();
  }, [fetchCoinData]);

  if (loading) {
    return (
      <div className="p-6 pt-32">
        <Skeleton className="h-12 w-24 mb-4" />
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-4" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-48 w-full mb-4" />
        <Skeleton className="h-12 w-32" />
      </div>
    );
  }

  if (error || !coin) {
    return (
      <div className="p-6 pt-32 flex flex-col items-center justify-center">
        <CandlestickChart className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Token not found</h2>
        <p className="text-muted-foreground">{error || 'The requested token data could not be loaded.'}</p>
      </div>
    );
  }

  return (
    <div className="p-6 pt-32">
      <TokenHeader
        name={coin.name}
        symbol={coin.symbol}
        image={coin.image_url}
        price={coin.price}
        description={coin.description}
        tokenStandard="SPL"
        decimals={null}
        updatedAt={new Date().toISOString()}
        onRefresh={() => fetchCoinData(true)}
        refreshing={refreshing}
        solanaAddr={coin.solana_addr}
      />
      
      <TokenStats
        marketCap={coin.market_cap}
        usdMarketCap={coin.usd_market_cap}
        volume24h={coin.volume_24h}
        liquidity={coin.liquidity}
      />

      <TokenSupply
        total={coin.total_supply}
        circulating={null}
        nonCirculating={null}
      />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-6">
        <PriceChart data={coin.historic_data || []} />
        <SwapInterface defaultTokenAddress={coin.solana_addr} />
      </div>

      <VoiceChat coinId={coin.id} />
    </div>
  );
};

export default CoinProfile;