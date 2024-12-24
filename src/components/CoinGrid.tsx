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
            solana_addr
          )
        `)
        .order('search_count', { ascending: false })
        .limit(30);

      if (error) {
        console.error('Error fetching trending coins:', error);
        throw error;
      }

      console.log('Trending coins data:', trendingCoins);

      return trendingCoins.map(trend => ({
        ...trend.coins,
        searchCount: trend.search_count
      }));
    },
    gcTime: Infinity,
    staleTime: 30000,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-2 sm:space-y-4 px-2">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <h2 className="text-base sm:text-lg font-bold animate-text-glow">
          {title}
        </h2>
        <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto text-xs sm:text-sm">
          <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
          Filter
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
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
            />
          );
        })}
      </div>
    </div>
  );
}