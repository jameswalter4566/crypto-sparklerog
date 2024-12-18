import { useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { CandlestickChart } from "lucide-react";
import { TokenHeader } from "@/components/coin/TokenHeader";
import { TokenStats } from "@/components/coin/TokenStats";
import { TokenSupply } from "@/components/coin/TokenSupply";
import { PriceChart } from "@/components/coin/PriceChart";
import { mockCoins } from "@/data/mockCoins";

const CoinProfile = () => {
  const { id } = useParams();
  const coin = mockCoins.find(c => c.id === id);

  if (!coin) {
    return (
      <div className="p-6 flex flex-col items-center justify-center">
        <CandlestickChart className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Token not found</h2>
        <p className="text-muted-foreground">The requested token data could not be loaded.</p>
      </div>
    );
  }

  // Generate mock price data for the chart
  const priceData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    price: coin.price * (1 + Math.sin(i / 5) * 0.1), // Creates a sine wave pattern around the base price
  }));

  return (
    <div className="p-6">
      <TokenHeader
        name={coin.name}
        symbol={coin.symbol}
        image={coin.imageUrl || null}
        price={coin.price}
        description={null}
        tokenStandard={null}
        decimals={null}
      />
      
      <TokenStats
        marketCap={coin.market_cap || null}
        volume24h={null}
        liquidity={coin.liquidity || null}
      />

      <TokenSupply
        total={coin.supply || null}
        circulating={coin.supply || null}
        nonCirculating={0}
      />

      <PriceChart data={priceData} />
    </div>
  );
};

export default CoinProfile;