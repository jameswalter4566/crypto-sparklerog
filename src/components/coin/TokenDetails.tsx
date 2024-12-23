import { TokenHeader } from "@/components/coin/TokenHeader";
import { TokenStats } from "@/components/coin/TokenStats";
import { TokenSupply } from "@/components/coin/TokenSupply";
import { useState } from "react";

interface TokenDetailsProps {
  coinData: {
    id: string;
    name: string;
    symbol: string;
    image: string | null;
    price: number | null;
    description: string | null;
    tokenStandard: string | null;
    decimals: number | null;
    marketCap: number | null;
    volume24h: number | null;
    liquidity: number | null;
    solanaAddr?: string;
    supply: {
      total: number | null;
      circulating: number | null;
      nonCirculating: number | null;
    };
  };
  onClick: () => void;
}

export const TokenDetails = ({ coinData, onClick }: TokenDetailsProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated] = useState(new Date().toISOString());

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  return (
    <div onClick={onClick} className="cursor-pointer hover:opacity-80 transition-opacity">
      <TokenHeader
        name={coinData.name}
        symbol={coinData.symbol}
        image={coinData.image}
        price={coinData.price}
        description={coinData.description}
        tokenStandard={coinData.tokenStandard}
        decimals={coinData.decimals || undefined}
        solanaAddr={coinData.solanaAddr}
        updatedAt={lastUpdated}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
      />

      <TokenStats
        marketCap={coinData.marketCap}
        volume24h={coinData.volume24h}
        liquidity={coinData.liquidity}
      />

      <TokenSupply
        total={coinData.supply.total}
        circulating={coinData.supply.circulating}
        nonCirculating={coinData.supply.nonCirculating}
      />
    </div>
  );
};