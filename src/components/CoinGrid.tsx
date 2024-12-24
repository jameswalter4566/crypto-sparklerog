import { NewCoinCard } from "./NewCoinCard";
import { CoinData } from "@/data/mockCoins";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { useNatsUpdates } from "@/hooks/useNatsUpdates";
import { mockCoins } from "@/data/mockCoins";

interface CoinGridProps {
  coins?: CoinData[];
  isLoading?: boolean;
}

export function CoinGrid({ coins: initialCoins, isLoading }: CoinGridProps) {
  const coins = useNatsUpdates(initialCoins || mockCoins);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-2 sm:space-y-4 px-2">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <h2 className="text-base sm:text-lg font-bold animate-text-glow">
          Trending Coins
        </h2>
        <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto text-xs sm:text-sm">
          <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
          Filter
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
        {coins.map((coin) => {
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
              imageUrl={coin.imageUrl || "/placeholder.svg"}
              mintAddress={coin.mintAddress || ""}
            />
          );
        })}
      </div>
    </div>
  );
}