import { useQuery } from "@tanstack/react-query";
import { CoinGrid } from "@/components/CoinGrid";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";

const NewCoins = () => {
  const { toast } = useToast();

  const { data: coins, isLoading, error, refetch } = useQuery({
    queryKey: ['new-coins'],
    queryFn: async () => {
      console.log('Fetching new coins...');
      try {
        const { data: searchData, error: searchError } = await supabase
          .from('coin_searches')
          .select(`
            coin_id,
            last_searched_at,
            coins (
              id,
              name,
              symbol,
              price,
              change_24h,
              image_url,
              solana_addr,
              historic_data,
              usd_market_cap
            )
          `)
          .order('last_searched_at', { ascending: false })
          .limit(30);

        if (searchError) {
          console.error('Error fetching new coins:', searchError);
          toast({
            title: "Error",
            description: "Failed to load new coins. Please try again.",
            variant: "destructive",
          });
          throw searchError;
        }

        if (!searchData) {
          console.log('No coins data returned');
          return [];
        }

        console.log('Raw search data received:', searchData);

        const mappedCoins = searchData
          .filter(item => {
            if (!item.coins) {
              console.log('Filtered out item with no coins data:', item);
              return false;
            }
            return true;
          })
          .map(item => {
            console.log('Processing coin:', item.coins);
            return {
              id: item.coins.id,
              name: item.coins.name,
              symbol: item.coins.symbol,
              price: item.coins.price,
              change_24h: item.coins.change_24h,
              imageUrl: item.coins.image_url || "/placeholder.svg",
              mintAddress: item.coins.solana_addr || "",
              priceHistory: item.coins.historic_data,
              usdMarketCap: item.coins.usd_market_cap
            };
          });

        console.log('Mapped coins:', mappedCoins);
        return mappedCoins;
      } catch (err) {
        console.error('Failed to fetch coins:', err);
        throw err;
      }
    },
    retry: 1,
    staleTime: 30000,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    gcTime: Infinity
  });

  useEffect(() => {
    const channel = supabase
      .channel('new-coins-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'coins'
        },
        (payload) => {
          console.log('Received real-time coin update:', payload);
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  if (error) {
    console.error('Query error:', error);
    return (
      <div className="p-4 text-red-500">
        Failed to load coins. Please try again later.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-2 sm:py-4 max-w-[2000px] space-y-3 sm:space-y-4">
      {/* Grid background decoration */}
      <div className="fixed inset-0 pointer-events-none" 
           style={{
             backgroundImage: `
               linear-gradient(#FEC6A115 1px, transparent 1px),
               linear-gradient(90deg, #FEC6A115 1px, transparent 1px)
             `,
             backgroundSize: '40px 40px',
             filter: 'blur(0.5px)',
             zIndex: 0
           }} 
      />
      <div className="relative z-10 p-4 sm:p-6">
        <CoinGrid coins={coins} isLoading={isLoading} title="New Coins" />
      </div>
    </div>
  );
};

export default NewCoins;