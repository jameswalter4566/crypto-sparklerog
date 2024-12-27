import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface PriceChartProps {
  data: Array<{
    date: string;
    price: number;
  }>;
  coinId: string; // Add coinId prop to identify which coin to listen to
}

export const PriceChart = ({ data: initialData, coinId }: PriceChartProps) => {
  const [chartData, setChartData] = useState(initialData);
  const { toast } = useToast();

  useEffect(() => {
    // Set up real-time listener for market cap changes
    const channel = supabase
      .channel('coin-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'coins',
          filter: `id=eq.${coinId}`
        },
        (payload) => {
          console.log('Received real-time update:', payload);
          
          if (payload.new && payload.new.usd_market_cap) {
            const newMarketCap = payload.new.usd_market_cap;
            const currentTime = new Date().toLocaleDateString();

            // Add new data point
            setChartData(prevData => {
              const newData = [...prevData];
              
              // Add new point or update the latest one
              const latestPoint = {
                date: currentTime,
                price: newMarketCap
              };
              
              // Keep only the last 30 data points for better visualization
              if (newData.length >= 30) {
                newData.shift(); // Remove oldest point
              }
              newData.push(latestPoint);
              
              return newData;
            });

            // Show toast notification
            toast({
              title: "Market Cap Updated",
              description: `New market cap: $${newMarketCap.toLocaleString()}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coinId, toast]);

  // Generate mock data if no data is provided
  const mockData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    price: Math.sin(i * 0.5) * 10 + 20 + Math.random() * 5
  }));

  const displayData = chartData.length > 0 ? chartData : mockData;

  return (
    <Card className="w-full h-[600px]">
      <CardHeader>
        <CardTitle>Price Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={500}>
          <AreaChart data={displayData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4B9CD3" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#4B9CD3" stopOpacity={0}/>
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(75, 156, 211, 0.1)"
            />
            <XAxis 
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#888', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#888', fontSize: 12 }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid #444',
                borderRadius: '4px'
              }}
              labelStyle={{ color: '#fff' }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Market Cap']}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#4B9CD3" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorPrice)"
              filter="url(#glow)"
              className="animate-laser-glow" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
