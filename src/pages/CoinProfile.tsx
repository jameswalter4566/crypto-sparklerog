import { useParams } from "react-router-dom";
import { CandlestickChart } from "lucide-react";
import { TokenHeader } from "@/components/coin/TokenHeader";
import { TokenStats } from "@/components/coin/TokenStats";
import { TokenSupply } from "@/components/coin/TokenSupply";
import { PriceChart } from "@/components/coin/PriceChart";

const CoinProfile = () => {
  const { id } = useParams();

  // Generate mock price data for the chart
  const priceData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    price: Math.random() * 100,
  }));

  const mockCoin = {
    name: "Sample Token",
    symbol: "SMPL",
    image_url: null,
    price: 100,
    market_cap: 1000000,
    volume_24h: 500000,
    liquidity: 250000
  };

  return (
    <div className="p-6">
      <TokenHeader
        name={mockCoin.name}
        symbol={mockCoin.symbol}
        image={mockCoin.image_url}
        price={mockCoin.price}
        description={null}
        tokenStandard={null}
        decimals={null}
      />
      
      <TokenStats
        marketCap={mockCoin.market_cap}
        volume24h={mockCoin.volume_24h}
        liquidity={mockCoin.liquidity}
      />

      <TokenSupply
        total={null}
        circulating={null}
        nonCirculating={null}
      />

      <PriceChart data={priceData} />
    </div>
  );
};

export default CoinProfile;