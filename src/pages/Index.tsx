import { useState } from "react";
import { CoinGrid } from "@/components/CoinGrid";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import { AnimatedBackground } from "@/components/effects/AnimatedBackground";
import { MovingBanners } from "@/components/effects/MovingBanners";

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
    <div className="min-h-screen w-full bg-background">
      <AnimatedBackground />
      <MovingBanners />
      <div className="container mx-auto py-6 relative z-10">
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
        <CoinGrid />
      </div>
    </div>
  );
};

export default Index;