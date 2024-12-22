import { NewCoinCard } from "./NewCoinCard";
import { CoinData } from "@/data/mockCoins";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { useState } from "react";
import { mockCoins } from "@/data/mockCoins";

interface CoinGridProps {
  coins?: CoinData[];
  isLoading?: boolean;
}

export function CoinGrid({ coins: initialCoins, isLoading }: CoinGridProps) {
  const [coins] = useState(initialCoins || mockCoins);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
        <h2 className="text-lg sm:text-xl font-bold animate-text-glow">Trending Coins</h2>
        <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-4">
        {coins.map((coin) => (
          <NewCoinCard
            key={coin.id}
            id={coin.id}
            name={coin.name}
            symbol={coin.symbol}
            price={coin.price}
            change24h={coin.change_24h}
            imageUrl={coin.imageUrl}
            mintAddress={coin.mintAddress}
          />
        ))}
      </div>
    </div>
  );
}