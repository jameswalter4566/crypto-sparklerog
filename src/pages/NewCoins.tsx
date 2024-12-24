import { useQuery } from "@tanstack/react-query";
import { CoinGrid } from "@/components/CoinGrid";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { CoinData } from "@/data/mockCoins";

const NewCoins = () => {
  const { toast } = useToast();

  const { data: coins, isLoading, error } = useQuery({
    queryKey: ['new-coins'],
    queryFn: async () => {
      console.log('Fetching new coins...');
      try {
        // Get the 30 most recently updated coins
        const { data, error } = await supabase
          .from('coins')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(30);

        if (error) {
          console.error('Error fetching new coins:', error);
          toast({
            title: "Error",
            description: "Failed to load new coins. Please try again.",
            variant: "destructive",
          });
          throw error;
        }

        if (!data) {
          console.log('No coins data returned');
          return [];
        }

        // Clean up old coins if we have more than 30
        if (data.length === 30) {
          const oldestCoin = data[data.length - 1];
          const { error: cleanupError } = await supabase
            .from('coins')
            .delete()
            .lt('updated_at', oldestCoin.updated_at);

          if (cleanupError) {
            console.error('Error cleaning up old coins:', cleanupError);
          }
        }

        const mappedCoins: CoinData[] = data.map(coin => ({
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol,
          price: coin.price,
          change_24h: coin.change_24h,
          imageUrl: coin.image_url || "/placeholder.svg",
          mintAddress: coin.solana_addr
        }));

        console.log('Successfully fetched coins:', mappedCoins);
        return mappedCoins;
      } catch (err) {
        console.error('Failed to fetch coins:', err);
        throw err;
      }
    },
    retry: 1,
    staleTime: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    gcTime: Infinity
  });

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
      <div className="p-4 sm:p-6">
        <CoinGrid coins={coins} isLoading={isLoading} title="New Coins" />
      </div>
    </div>
  );
};

export default NewCoins;