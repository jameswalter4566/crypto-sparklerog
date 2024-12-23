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
    price: number;
    description: string;
    tokenStandard: string;
    decimals: number;
    marketCap: number;
    volume24h: number;
    liquidity: number;
    solanaAddr?: string;
    supply: {
      total: number;
      circulating: number;
      nonCirculating: number;
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
        decimals={coinData.decimals}
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