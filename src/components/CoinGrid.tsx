import { Card, CardContent } from "@/components/ui/card";
import { NewCoinCard } from "@/components/NewCoinCard";
import { CoinData } from "@/data/mockCoins";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface CoinGridProps {
  coins: CoinData[];
  isLoading?: boolean;
}

export function CoinGrid({ coins, isLoading }: CoinGridProps) {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  const renderSectionHeader = (title: string) => (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold bg-gradient-to-r from-primary/80 to-secondary/80 bg-clip-text text-transparent">
        {title}
      </h2>
      <Button variant="outline" size="sm" className="gap-2">
        <Filter className="h-4 w-4" />
        Filter
      </Button>
    </div>
  );

  // For demo purposes, split coins into sections
  const trendingCoins = coins.slice(0, 4);
  const newCoins = coins.slice(4, 8);
  const graduatingCoins = coins.slice(8, 12);
  const toMoonCoins = coins.slice(12, 16);

  return (
    <div className="space-y-8">
      <section>
        {renderSectionHeader("🔥 Trending")}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {trendingCoins.map((coin) => (
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
      </section>

      <section>
        {renderSectionHeader("✨ New")}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {newCoins.map((coin) => (
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
      </section>

      <section>
        {renderSectionHeader("🎓 Soon to Graduate")}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {graduatingCoins.map((coin) => (
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
      </section>

      <section>
        {renderSectionHeader("🚀 To the Moon!")}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {toMoonCoins.map((coin) => (
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
      </section>
    </div>
  );
}