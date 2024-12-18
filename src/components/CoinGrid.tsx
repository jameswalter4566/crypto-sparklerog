import { Card, CardContent } from "@/components/ui/card";
import { NewCoinCard } from "@/components/NewCoinCard";
import { CoinData } from "@/data/mockCoins";

interface CoinGridProps {
  coins: CoinData[];
  isLoading?: boolean;
}

export function CoinGrid({ coins, isLoading }: CoinGridProps) {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {coins?.map((coin) => (
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
  );
}