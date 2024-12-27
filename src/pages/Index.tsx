import { useState } from "react";
import { CoinGrid } from "@/components/CoinGrid";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import { NewCoinCard } from "@/components/NewCoinCard";
import { AnimatedBackground } from "@/components/effects/AnimatedBackground";

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
    <>
      <AnimatedBackground />
      <div className="relative">
        {searchResults.length > 0 && (
          <div className="absolute right-4 top-2 text-right">
            {searchResults.map((coin, index) => (
              <div 
                key={`${coin.id}-${index}`}
                className="text-sm font-medium text-primary animate-fade-in mb-1"
              >
                {coin.name} was just searched! 🔍
              </div>
            ))}
          </div>
        )}
        <div className="container mx-auto py-2 px-2 sm:py-4 sm:px-4 max-w-[2000px] space-y-3 sm:space-y-4">
          <WelcomeDialog />
          <CoinGrid />
        </div>
      </div>
    </>
  );
};

export default Index;