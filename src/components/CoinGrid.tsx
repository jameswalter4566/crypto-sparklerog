import { NewCoinCard } from "./NewCoinCard";
import { CoinData } from "@/data/mockCoins";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CoinGridProps {
  coins?: CoinData[];
  isLoading?: boolean;
}

const fetchCoins = async () => {
  const { data, error } = await supabase
    .from('coins')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

export function CoinGrid({ coins: initialCoins, isLoading: propIsLoading }: CoinGridProps) {
  const { data: coins, isLoading } = useQuery({
    queryKey: ['coins'],
    queryFn: fetchCoins,
  });

  if (isLoading || propIsLoading) {
    return <div>Loading...</div>;
  }

  if (!coins || coins.length === 0) {
    return <div>No coins found</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Trending Coins</h2>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {coins.map((coin) => (
          <NewCoinCard
            key={coin.id}
            id={coin.id}
            name={coin.name}
            symbol={coin.symbol}
            price={coin.price || 0}
            change24h={coin.change_24h || 0}
            imageUrl={coin.image_url}
          />
        ))}
      </div>
    </div>
  );
}