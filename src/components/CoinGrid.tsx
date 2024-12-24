import { NewCoinCard } from "./NewCoinCard";
import { CoinData } from "@/data/mockCoins";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CoinGridProps {
  coins?: CoinData[];
  isLoading?: boolean;
  title?: string;
}

interface PriceHistoryItem {
  price: number;
  timestamp: string;
}

export function CoinGrid({ title = "Trending Coins" }: CoinGridProps) {
  const { data: coins, isLoading } = useQuery({
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
            historic_data
          )
        `)
        .order('search_count', { ascending: false })
        .limit(30);

      if (error) {
        console.error('Error fetching trending coins:', error);
        throw error;
      }

      console.log('Trending coins data:', trendingCoins);

      return trendingCoins.map(trend => {
        // Parse historic_data if it exists
        let priceHistory: PriceHistoryItem[] | null = null;
        
        try {
          if (trend.coins.historic_data) {
            const historyData = trend.coins.historic_data;
            if (Array.isArray(historyData)) {
              priceHistory = historyData
                .filter(item => 
                  typeof item === 'object' && 
                  item !== null && 
                  'price' in item && 
                  'timestamp' in item
                )
                .map(item => ({
                  price: Number(item.price) || 0,
                  timestamp: String(item.timestamp) || new Date().toISOString()
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
          priceHistory
        };
      });
    },
    gcTime: Infinity,
    staleTime: 30000,
  });

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
            />
          );
        })}
      </div>
    </div>
  );
}