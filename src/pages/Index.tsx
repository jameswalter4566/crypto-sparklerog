import { useState } from "react";
import { CoinGrid } from "@/components/CoinGrid";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import { NewCoinCard } from "@/components/NewCoinCard";

interface CoinMetadata {
  id: string;
  name: string;
  symbol: string;
  description: string | null;
  image_url: string | null;
  total_supply: number | null;
  coingecko_id: string | null;
  updated_at: string;
  price: number | null;
  change_24h: number | null;
  solana_addr?: string | null;
}

const Index = () => {
  const [searchResults, setSearchResults] = useState<CoinMetadata[]>([]);

  return (
    <div className="container mx-auto py-2 px-2 sm:py-4 sm:px-4 max-w-[2000px] space-y-3 sm:space-y-4">
      <WelcomeDialog />
      {searchResults.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {searchResults.map((coin) => (
            <NewCoinCard
              key={coin.id}
              id={coin.id}
              name={coin.name || "Unknown Coin"}
              symbol={coin.symbol || "N/A"}
              imageUrl={coin.image_url || "/placeholder.svg"}
              price={typeof coin.price === "number" && !isNaN(coin.price) ? coin.price : null}
              change24h={typeof coin.change_24h === "number" && !isNaN(coin.change_24h) ? coin.change_24h : null}
              mintAddress={coin.id}
            />
          ))}
        </div>
      )}
      <CoinGrid />
    </div>
  );
};

export default Index;