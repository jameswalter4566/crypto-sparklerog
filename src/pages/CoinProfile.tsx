import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { CandlestickChart } from "lucide-react";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  ResponsiveContainer
} from 'recharts';
import { useToast } from "@/components/ui/use-toast";

const CoinProfile = () => {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: tokenMetadata, isLoading: isLoadingMetadata } = useQuery({
    queryKey: ['token-metadata', id],
    queryFn: async () => {
      console.log("Fetching metadata for token:", id);
      const response = await supabase.functions.invoke('fetch-prices', {
        body: { address: id },
      });
      
      if (response.error) {
        console.error("Error fetching metadata:", response.error);
        toast({
          title: "Error",
          description: "Failed to fetch token metadata",
          variant: "destructive",
        });
        throw response.error;
      }
      console.log("Received metadata:", response.data);
      return response.data;
    },
    enabled: !!id,
    retry: 1,
  });

  const { data: coin, isLoading: isLoadingCoin } = useQuery({
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

  const isLoading = isLoadingMetadata || isLoadingCoin;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  if (!coin || !tokenMetadata) {
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
      <div className="flex items-center gap-4 mb-6">
        {tokenMetadata.image && (
          <img 
            src={tokenMetadata.image} 
            alt={tokenMetadata.name} 
            className="w-12 h-12 rounded-full bg-background border"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        )}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {tokenMetadata.name || "Unknown Token"} ({tokenMetadata.symbol || "???"})
          </h1>
          <p className="text-2xl font-bold">
            ${coin.price?.toFixed(4) ?? "Price not available"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-400">Market Cap</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">
              ${coin.market_cap?.toLocaleString() ?? "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-400">24h Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">
              ${coin.volume_24h?.toLocaleString() ?? "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-400">Liquidity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">
              ${coin.liquidity?.toLocaleString() ?? "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="w-full h-[600px]">
        <CardHeader>
          <CardTitle>Price Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={500}>
            <AreaChart data={priceData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9945FF" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#9945FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
              />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#9945FF" 
                fillOpacity={1} 
                fill="url(#colorPrice)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoinProfile;