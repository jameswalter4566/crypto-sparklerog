import { useState } from "react";
import { CoinGrid } from "@/components/CoinGrid";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import { AnimatedBackground } from "@/components/effects/AnimatedBackground";
import { MovingBanners } from "@/components/effects/MovingBanners";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  usd_market_cap: number | null;
}

const Index = () => {
  const [searchResults, setSearchResults] = useState<CoinMetadata[]>([]);

  const { data: coins, isLoading } = useQuery({
    queryKey: ['trending-coins'],
    queryFn: async () => {
      console.log('Fetching trending coins...');
      const { data, error } = await supabase
        .from('coins')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(12);

      if (error) {
        console.error('Error fetching coins:', error);
        throw error;
      }

      console.log('Received coins:', data);
      return data || [];
    }
  });

  // Map database fields to CoinGrid expected format
  const mappedCoins = coins?.map(coin => ({
    id: coin.id,
    name: coin.name,
    imageUrl: coin.image_url || '/placeholder.svg',
    usdMarketCap: coin.usd_market_cap || 0,
    description: coin.description
  }));

  return (
    <>
      <AnimatedBackground />
      <MovingBanners />
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
        <CoinGrid coins={mappedCoins} isLoading={isLoading} title="Trending Coins" />
      </div>
    </>
  );
};

export default Index;