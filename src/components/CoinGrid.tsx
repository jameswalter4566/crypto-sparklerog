import { NewCoinCard } from "./NewCoinCard";
import { CoinData } from "@/data/mockCoins";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface CoinGridProps {
  coins?: CoinData[];
  isLoading?: boolean;
  title?: string;
}

interface PriceHistoryItem {
  price: number;
  timestamp: string;
}

interface HistoricDataItem {
  price: number | string;
  timestamp: string | number;
}

interface CoinQueryResult {
  coin_id: string;
  search_count: number;
  coins: {
    id: string;
    name: string;
    symbol: string;
    price: number;
    change_24h: number;
    image_url: string | null;
    solana_addr: string | null;
    historic_data: HistoricDataItem[] | null;
    market_cap: number | null;
    usd_market_cap: number | null;
  } | null;
}

interface RealtimeCoin {
  id: string;
  name: string;
  symbol: string;
  price: number | null;
  change_24h: number | null;
  image_url: string | null;
}

type RealtimePayload = RealtimePostgresChangesPayload<RealtimeCoin>;

export function CoinGrid({ title = "Trending Coins" }: CoinGridProps) {
  const { toast } = useToast();

  const { data: coins, isLoading, refetch } = useQuery({
    queryKey: ['trending-coins'],
    queryFn: async () => {
      console.log('Fetching trending coins');
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
        console.error('Error fetching trending coins:', error);
        throw error;
      }

      console.log('Trending coins data:', trendingCoins);

      return (trendingCoins as unknown as CoinQueryResult[]).map(trend => {
        if (!trend.coins) {
          console.error('Missing coins data for trend:', trend);
          return null;
        }

        let priceHistory: PriceHistoryItem[] | null = null;
        
        try {
          if (trend.coins.historic_data) {
            const historyData = trend.coins.historic_data;
            
            if (Array.isArray(historyData)) {
              priceHistory = historyData
                .filter((item): item is HistoricDataItem => 
                  typeof item === 'object' && 
                  item !== null && 
                  'price' in item && 
                  'timestamp' in item
                )
                .map(item => ({
                  price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
                  timestamp: typeof item.timestamp === 'number' 
                    ? new Date(item.timestamp).toISOString() 
                    : String(item.timestamp)
                }));
            }
          }
        } catch (err) {
          console.error('Error parsing historic data:', err);
          priceHistory = null;
        }

        return {
          ...trend.coins,
          searchCount: trend.search_count,
          priceHistory,
          marketCap: trend.coins.market_cap,
          usdMarketCap: trend.coins.usd_market_cap
        };
      }).filter(Boolean);
    },
    gcTime: Infinity,
    staleTime: 30000,
  });

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase.channel('coin_updates')
      .on(
        'postgres_changes' as const,
        {
          event: '*',
          schema: 'public',
          table: 'coins'
        },
        (payload: RealtimePayload) => {
          console.log('Received real-time update:', payload);
          
          // Refetch data when we receive an update
          refetch();
          
          // Show toast notification with proper type checking
          if (payload.new && 'name' in payload.new) {
            toast({
              title: "Price Update",
              description: `${payload.new.name}'s data has been updated.`,
            });
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch, toast]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-3 sm:space-y-5 px-2">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <h2 className="text-lg sm:text-xl font-bold animate-text-glow">
          {title}
        </h2>
        <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto text-sm sm:text-base">
          <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
          Filter
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {coins?.map((coin) => {
          const validPrice = typeof coin.price === "number" && !isNaN(coin.price) ? coin.price : null;
          const validChange24h = typeof coin.change_24h === "number" && !isNaN(coin.change_24h) ? coin.change_24h : null;

          return (
            <NewCoinCard
              key={coin.id}
              id={coin.id}
              name={coin.name || "Unknown Coin"}
              symbol={coin.symbol || "N/A"}
              price={validPrice}
              change24h={validChange24h}
              imageUrl={coin.image_url || "/placeholder.svg"}
              mintAddress={coin.solana_addr || ""}
              searchCount={coin.searchCount}
              priceHistory={coin.priceHistory}
              usdMarketCap={coin.usdMarketCap}
            />
          );
        })}
      </div>
    </div>
  );
}