import { NewCoinCard } from "./NewCoinCard";
import { CoinData } from "@/data/mockCoins";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { useHeliusWebSocket } from "@/hooks/use-helius-websocket";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

interface CoinGridProps {
  coins: CoinData[];
  isLoading?: boolean;
}

export function CoinGrid({ coins: initialCoins, isLoading }: CoinGridProps) {
  const [coins, setCoins] = useState(initialCoins);

  useHeliusWebSocket({
    onMessage: (data) => {
      console.log('Received real-time update:', data);
      
      // Handle token updates
      if (data.account?.data?.parsed?.type === 'mint') {
        const mintUpdate = data.account.data.parsed.info;
        
        setCoins(currentCoins => 
          currentCoins.map(coin => {
            if (coin.symbol === mintUpdate.symbol) {
              return {
                ...coin,
                // Update relevant fields based on the mint data
                supply: mintUpdate.supply,
                // Add other relevant updates
              };
            }
            return coin;
          })
        );

        toast({
          title: "Price Update",
          description: `${mintUpdate.symbol} data has been updated`,
        });
      }
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: "Update Error",
        description: "Failed to receive real-time updates",
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
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
            price={coin.price}
            change24h={coin.change_24h}
            imageUrl={coin.imageUrl}
          />
        ))}
      </div>
    </div>
  );
}