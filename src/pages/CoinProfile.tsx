import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { CandlestickChart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { TokenHeader } from "@/components/coin/TokenHeader";
import { TokenStats } from "@/components/coin/TokenStats";
import { TokenSupply } from "@/components/coin/TokenSupply";
import { PriceChart } from "@/components/coin/PriceChart";

const CoinProfile = () => {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: coin, isLoading } = useQuery({
    queryKey: ['coin', id],
    queryFn: async () => {
      console.log("Fetching coin data for:", id);
      const { data, error } = await supabase
        .from('coins')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("Error fetching coin:", error);
        toast({
          title: "Error",
          description: "Failed to fetch coin data",
          variant: "destructive",
        });
        throw error;
      }
      console.log("Received coin data:", data);
      return data;
    },
    enabled: !!id,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

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
    price: Math.random() * 100,
  }));

  return (
    <div className="p-6">
      <TokenHeader
        name={coin.name}
        symbol={coin.symbol}
        image={coin.image_url}
        price={coin.price}
        description={null}
        tokenStandard={null}
        decimals={null}
      />
      
      <TokenStats
        marketCap={coin.market_cap}
        volume24h={coin.volume_24h}
        liquidity={coin.liquidity}
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