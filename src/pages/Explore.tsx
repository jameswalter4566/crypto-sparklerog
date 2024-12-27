import { useState } from "react";
import { CoinGrid } from "@/components/CoinGrid";
import { WelcomeDialog } from "@/components/WelcomeDialog";
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

const Explore = () => {
  const [searchResults, setSearchResults] = useState<CoinMetadata[]>([]);

  return (
    <>
      <AnimatedBackground />
      <div className="container mx-auto py-2 px-2 sm:py-4 sm:px-4 max-w-[2000px] space-y-3 sm:space-y-4">
        <WelcomeDialog />
        {searchResults.length > 0 && (
          <div className="flex justify-end mb-4">
            {searchResults.map((coin, index) => (
              <div 
                key={`${coin.id}-${index}`}
                className="text-sm font-medium text-primary animate-fade-in ml-4"
              >
                {coin.name} was just searched! 🔍
              </div>
            ))}
          </div>
        )}
        <CoinGrid title="Explore Coins" />
      </div>
    </>
  );
};

export default Explore;