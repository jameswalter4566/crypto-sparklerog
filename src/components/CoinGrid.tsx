import { Card, CardContent } from "@/components/ui/card";
import { NewCoinCard } from "@/components/NewCoinCard";
import { CoinData } from "@/data/mockCoins";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { useHeliusWebSocket } from "@/hooks/use-helius-websocket";
import { useEffect } from "react";

interface CoinGridProps {
  coins: CoinData[];
  isLoading?: boolean;
}

export function CoinGrid({ coins, isLoading }: CoinGridProps) {
  useHeliusWebSocket({
    onMessage: (data) => {
      console.log('Received real-time update:', data);
      // We'll implement the update logic in the next step
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const renderSectionLabel = (title: string) => (
    <div className="flex items-center gap-2">
      <h2 className="text-xl font-bold bg-gradient-to-r from-primary/80 to-secondary/80 bg-clip-text text-transparent whitespace-nowrap">
        {title}
      </h2>
      <Button variant="outline" size="sm" className="gap-2">
        <Filter className="h-4 w-4" />
        Filter
      </Button>
    </div>
  );

  // Split coins into sections
  const trendingCoins = coins.slice(0, 4);
  const newCoins = coins.slice(4, 8);
  const graduatingCoins = coins.slice(8, 12);
  const toMoonCoins = coins.slice(12, 16);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-4 gap-8 mb-8">
        {renderSectionLabel("🔥 Trending")}
        {renderSectionLabel("✨ New")}
        {renderSectionLabel("🎓 Soon to Graduate")}
        {renderSectionLabel("🚀 To the Moon!")}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {coins.map((coin) => (
          <Card key={coin.id}>
            <CardContent className="pt-6">
              <NewCoinCard
                id={coin.id}
                name={coin.name}
                symbol={coin.symbol}
                price={coin.price || 0}
                change24h={coin.change_24h || 0}
                imageUrl={coin.imageUrl}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}