import { NewCoinCard } from "./NewCoinCard";
import { CoinData } from "@/data/mockCoins";
import { GridHeader } from "@/components/home/GridHeader";
import { useState } from "react";
import { mockCoins } from "@/data/mockCoins";

interface CoinGridProps {
  coins?: CoinData[];
  isLoading?: boolean;
}

export function CoinGrid({ coins: initialCoins, isLoading }: CoinGridProps) {
  const [coins] = useState(initialCoins || mockCoins);

  const handleFilter = () => {
    // Filter functionality will be implemented later
    console.log("Filter clicked");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-2 sm:space-y-4 px-2">
      <GridHeader onFilter={handleFilter} />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
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