import { NewCoinCard } from "./NewCoinCard";
import { CoinGridHeader } from "./coin/CoinGridHeader";
import { useTrendingCoins } from "@/hooks/useTrendingCoins";
import { Skeleton } from "@/components/ui/skeleton";

interface CoinGridProps {
  title?: string;
  coins?: Array<{
    id: string;
    name: string;
    symbol: string;
    price: number;
    change_24h: number;
    imageUrl: string;
    mintAddress: string;
    priceHistory: any;
    usdMarketCap: number;
  }>;
  isLoading?: boolean;
}

export function CoinGrid({ title = "Trending Coins", coins: propCoins, isLoading: propIsLoading }: CoinGridProps) {
  const { coins: fetchedCoins, isLoading: queryIsLoading } = useTrendingCoins();

  const isLoadingData = propIsLoading ?? queryIsLoading;
  const displayCoins = propCoins ?? fetchedCoins;

  if (isLoadingData) {
    return (
      <div className="space-y-3 sm:space-y-5 px-2">
        <CoinGridHeader title={title} />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {[...Array(10)].map((_, index) => (
            <div key={index} className="h-[400px]">
              <Skeleton className="w-full h-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!displayCoins || displayCoins.length === 0) {
    return (
      <div className="space-y-3 sm:space-y-5 px-2">
        <CoinGridHeader title={title} />
        <div className="text-center text-gray-500">No coins found</div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-5 px-2">
      <CoinGridHeader title={title} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {displayCoins.map((coin) => {
          if (!coin || !coin.id) {
            console.warn('Invalid coin data:', coin);
            return null;
          }

          return (
            <NewCoinCard
              key={coin.id}
              id={coin.id}
              name={coin.name || "Unknown Coin"}
              symbol={coin.symbol || "N/A"}
              price={typeof coin.price === "number" && !isNaN(coin.price) ? coin.price : null}
              change24h={typeof coin.change_24h === "number" && !isNaN(coin.change_24h) ? coin.change_24h : null}
              imageUrl={coin.image_url || "/placeholder.svg"}
              mintAddress={coin.solana_addr || ""}
              searchCount={coin.searchCount}
              priceHistory={coin.priceHistory}
              usdMarketCap={typeof coin.usd_market_cap === "number" && !isNaN(coin.usd_market_cap) ? coin.usd_market_cap : null}
            />
          );
        })}
      </div>
    </div>
  );
}