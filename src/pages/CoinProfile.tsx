import { useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { CandlestickChart } from "lucide-react";
import { TokenHeader } from "@/components/coin/TokenHeader";
import { TokenStats } from "@/components/coin/TokenStats";
import { TokenSupply } from "@/components/coin/TokenSupply";
import { PriceChart } from "@/components/coin/PriceChart";
import { VoiceChat } from "@/components/coin/VoiceChat";
import { SwapInterface } from "@/components/SwapInterface";
import { useCoinData } from "@/hooks/useCoinData";
import { CoinComments } from "@/components/coin/CoinComments";

const CoinProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { coin, loading, error, refreshing, refresh } = useCoinData(id);

  if (loading) {
    return (
      <div className="p-6 pt-32">
        <Skeleton className="h-12 w-24 mb-4" />
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-4" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-48 w-full mb-4" />
        <Skeleton className="h-12 w-32" />
      </div>
    );
  }

  if (error || !coin) {
    return (
      <div className="p-6 pt-32 flex flex-col items-center justify-center">
        <CandlestickChart className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Token not found</h2>
        <p className="text-muted-foreground">{error || 'The requested token data could not be loaded.'}</p>
      </div>
    );
  }

  return (
    <div className="p-6 pt-32">
      <TokenHeader
        name={coin.name}
        symbol={coin.symbol}
        image={coin.image_url}
        price={coin.price}
        description={coin.description}
        tokenStandard="SPL"
        decimals={null}
        updatedAt={new Date().toISOString()}
        onRefresh={() => refresh(true)}
        refreshing={refreshing}
        solanaAddr={coin.solana_addr}
        twitterHandle={coin.twitter_screen_name}
        telegramUrl={coin.chat_url?.[0]}
        websiteUrl={coin.homepage}
      />
      
      <TokenStats
        marketCap={coin.market_cap}
        usdMarketCap={coin.usd_market_cap}
        volume24h={coin.volume_24h}
        liquidity={coin.liquidity}
      />

      <TokenSupply
        total={coin.total_supply}
        circulating={coin.circulating_supply}
        nonCirculating={coin.non_circulating_supply}
      />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-6">
        <PriceChart 
          data={coin.historic_data?.map(item => ({
            date: item.timestamp,
            price: item.price
          })) || []}
          coinId={coin.id}
        />
        <SwapInterface defaultTokenAddress={coin.solana_addr} />
      </div>

      <div className="mt-6">
        <CoinComments coinId={coin.id} />
      </div>

      <VoiceChat coinId={coin.id} />
    </div>
  );
};

export default CoinProfile;