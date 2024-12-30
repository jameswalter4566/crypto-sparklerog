import { useEffect } from "react";
import { CoinGrid } from "@/components/CoinGrid";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function NewCoins() {
  const { data: coins = [], isLoading } = useQuery({
    queryKey: ['newCoins'],
    queryFn: async () => {
      try {
        const { data: pumpData, error: pumpError } = await supabase.functions.invoke('poll-new-coins', {
          method: 'POST'
        });

        if (pumpError) {
          console.error('[NewCoins] Error fetching from pump.fun:', pumpError);
          throw pumpError;
        }

        if (!pumpData || !pumpData.coins) {
          console.log('[NewCoins] No coins received from pump.fun');
          return [];
        }

        console.log('[NewCoins] Received coins from pump.fun:', pumpData.coins);
        
        return pumpData.coins.map((coin: any) => ({
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol,
          price: coin.price || 0,
          change_24h: coin.change_24h || 0,
          imageUrl: coin.image_url,
          mintAddress: coin.solana_addr,
          priceHistory: null,
          usdMarketCap: coin.usd_market_cap,
          description: coin.description,
          twitter: coin.twitter_screen_name,
          website: coin.homepage,
          volume24h: coin.volume_24h || 0,
          liquidity: coin.liquidity || 0,
          searchCount: 0
        }));
      } catch (error) {
        console.error('[NewCoins] Error in query function:', error);
        throw error;
      }
    },
    refetchInterval: 3000
  });

  return (
    <div className="container mx-auto py-2 sm:py-4 max-w-[2000px] space-y-3 sm:space-y-4">
      {/* Grid background decoration with glow effect */}
      <div 
        className="fixed inset-0 pointer-events-none" 
        style={{
          backgroundImage: `
            linear-gradient(#FEC6A115 1px, transparent 1px),
            linear-gradient(90deg, #FEC6A115 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          filter: 'blur(0.5px)',
          zIndex: 0,
          animation: 'glow-pulse 2s ease-in-out infinite'
        }} 
      />
      <div className="relative z-10 p-4 sm:p-6">
        <CoinGrid coins={coins} isLoading={isLoading} title="New Coins" />
      </div>
    </div>
  );
}