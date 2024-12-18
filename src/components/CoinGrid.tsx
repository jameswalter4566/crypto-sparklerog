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

  // For demo purposes, we'll split the coins into different categories
  // In a real app, this would come from the backend
  const trendingCoins = coins.slice(0, 4);
  const newCoins = coins.slice(4, 8);
  const graduatingCoins = coins.slice(8, 12);
  const toTheMoonCoins = coins.slice(12, 16);

  const renderSection = (title: string, sectionCoins: CoinData[]) => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        {title}
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {sectionCoins.map((coin) => (
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

  return (
    <div className="space-y-8">
      {renderSection("🔥 Trending", trendingCoins)}
      {renderSection("✨ New", newCoins)}
      {renderSection("🎓 Soon to Graduate", graduatingCoins)}
      {renderSection("🚀 To the Moon!", toTheMoonCoins)}
    </div>
  );
}