import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { useEffect, useState, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface PriceChartProps {
  data: Array<{
    date: string;
    price: number;
  }>;
  coinId: string;
}

export const PriceChart = ({ data: initialData, coinId }: PriceChartProps) => {
  const [chartData, setChartData] = useState(initialData);
  const { toast } = useToast();
  const prevDataRef = useRef(chartData);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);

  useEffect(() => {
    // Calculate min and max prices for better chart scaling
    if (chartData.length > 0) {
      const prices = chartData.map(d => d.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const padding = (max - min) * 0.1; // Add 10% padding
      setMinPrice(min - padding);
      setMaxPrice(max + padding);
    }
  }, [chartData]);

  useEffect(() => {
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
            const currentTime = new Date().toISOString();

            setChartData(prevData => {
              const newData = [...prevData];
              const latestPoint = {
                date: currentTime,
                price: newMarketCap
              };
              
              if (newData.length >= 100) { // Keep last 100 points for better performance
                newData.shift();
              }
              newData.push(latestPoint);
              prevDataRef.current = newData;
              return newData;
            });

            toast({
              title: "Price Updated",
              description: `New price data received`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coinId, toast]);

  // Generate realistic mock data if no data is provided
  const mockData = Array.from({ length: 100 }, (_, i) => {
    const basePrice = 100;
    const volatility = 0.02; // 2% volatility
    const time = new Date();
    time.setMinutes(time.getMinutes() - (100 - i));
    
    const randomWalk = Array.from({ length: i + 1 }, () => 
      (Math.random() - 0.5) * volatility
    ).reduce((a, b) => a + b, 0);
    
    return {
      date: time.toISOString(),
      price: basePrice * (1 + randomWalk)
    };
  });

  const displayData = chartData.length > 0 ? chartData : mockData;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  // Calculate price change for reference line
  const priceChange = displayData.length >= 2 
    ? ((displayData[displayData.length - 1].price - displayData[0].price) / displayData[0].price) * 100
    : 0;

  return (
    <Card className="w-full h-[600px] bg-black border-gray-800">
      <CardHeader className="border-b border-gray-800">
        <CardTitle className="text-gray-200">Price Chart</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ResponsiveContainer width="100%" height={500}>
          <AreaChart 
            data={displayData}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(255, 255, 255, 0.1)"
              vertical={false}
            />
            <XAxis 
              dataKey="date"
              axisLine={{ stroke: '#333' }}
              tickLine={false}
              tick={{ fill: '#666', fontSize: 12 }}
              tickFormatter={formatDate}
              minTickGap={50}
            />
            <YAxis 
              domain={[minPrice, maxPrice]}
              axisLine={{ stroke: '#333' }}
              tickLine={false}
              tick={{ fill: '#666', fontSize: 12 }}
              tickFormatter={formatPrice}
              width={80}
              orientation="right"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                border: '1px solid #333',
                borderRadius: '4px',
                padding: '8px'
              }}
              labelStyle={{ color: '#999' }}
              formatter={(value: number) => [formatPrice(value), 'Price']}
              labelFormatter={formatDate}
            />
            <ReferenceLine
              y={displayData[0]?.price}
              stroke="#666"
              strokeDasharray="3 3"
              label={{
                value: `${priceChange.toFixed(2)}%`,
                position: 'right',
                fill: priceChange >= 0 ? '#22c55e' : '#ef4444'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#22c55e"
              strokeWidth={1.5}
              fillOpacity={1} 
              fill="url(#colorPrice)"
              isAnimationActive={true}
              animationDuration={300}
              animationEasing="ease-out"
              dot={false}
              activeDot={{
                r: 4,
                stroke: '#22c55e',
                strokeWidth: 2,
                fill: '#000'
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};