import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const CoinProfile = () => {
  const { id } = useParams();

  const { data: coin, isLoading } = useQuery({
    queryKey: ['coin', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coins')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
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
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  if (!coin) {
    return <div className="p-6">Coin not found</div>;
  }

  // Mock price data for the chart - replace with real data when available
  const priceData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    price: coin.price * (1 + Math.random() * 0.2 - 0.1),
  }));

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        {coin.image_url && (
          <img 
            src={coin.image_url} 
            alt={coin.name} 
            className="w-12 h-12 rounded-full"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {coin.name} ({coin.symbol})
          </h1>
          <p className="text-2xl font-bold">
            ${coin.price?.toFixed(8)}
            {coin.change_24h && (
              <span className={coin.change_24h > 0 ? "text-green-500" : "text-red-500"}>
                {" "}({coin.change_24h > 0 ? "+" : ""}{coin.change_24h.toFixed(2)}%)
              </span>
            )}
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
              <XAxis dataKey="date" />
              <YAxis />
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