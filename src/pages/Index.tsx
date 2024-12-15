import { useQuery } from "@tanstack/react-query";
import { NewCoinCard } from "@/components/NewCoinCard";
import { supabase } from "@/integrations/supabase/client";
import { fetchJupiterPrices } from "@/lib/jupiter";

const Index = () => {
  // Fetch and sync Jupiter prices
  const { data: syncedData } = useQuery({
    queryKey: ["jupiter-sync"],
    queryFn: fetchJupiterPrices,
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch coins from Supabase
  const { data: coins, isLoading } = useQuery({
    queryKey: ["coins"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coins")
        .select("*")
        .order("market_cap", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-700 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Top Coins
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coins?.map((coin) => (
          <NewCoinCard
            key={coin.id}
            id={coin.id}
            name={coin.name}
            symbol={coin.symbol}
            price={coin.price}
            change24h={coin.change_24h}
          />
        ))}
      </div>
    </div>
  );
};

export default Index;