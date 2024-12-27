import { NewCoinCard } from "./NewCoinCard";
import { CoinGridHeader } from "./coin/CoinGridHeader";
import { useTrendingCoins } from "@/hooks/useTrendingCoins";

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
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-3 sm:space-y-5 px-2">
      <CoinGridHeader title={title} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {displayCoins?.map((coin) => {
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