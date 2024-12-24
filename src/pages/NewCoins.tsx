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
        // Get coins ordered by their last search timestamp
        const { data: searchData, error: searchError } = await supabase
          .from('coin_searches')
          .select(`
            coin_id,
            last_searched_at,
            coins (*)
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

        // Map the data to match CoinData structure
        const mappedCoins: CoinData[] = searchData
          .filter(item => item.coins) // Filter out any null coins
          .map(item => ({
            id: item.coins!.id,
            name: item.coins!.name,
            symbol: item.coins!.symbol,
            price: item.coins!.price,
            change_24h: item.coins!.change_24h,
            imageUrl: item.coins!.image_url || "/placeholder.svg",
            mintAddress: item.coins!.solana_addr
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