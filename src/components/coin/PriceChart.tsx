import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { Candlestick } from 'recharts/es6/chart/CandlestickChart';

interface PriceChartProps {
  data: Array<{
    date: string;
    price: number;
  }>;
}

export const PriceChart = ({ data }: PriceChartProps) => {
  const [candleData, setCandleData] = useState<any[]>([]);

  useEffect(() => {
    // Initialize candlestick data
    const initialData = Array.from({ length: 30 }, (_, i) => {
      const basePrice = data[i]?.price || 100;
      const open = basePrice * (1 + Math.random() * 0.02);
      const close = open * (1 + Math.random() * 0.03);
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      
      return {
        date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        open,
        close,
        high,
        low
      };
    });

    setCandleData(initialData);

    // Update candlestick data every 2 seconds with upward trend
    const interval = setInterval(() => {
      setCandleData(prevData => {
        const lastCandle = prevData[prevData.length - 1];
        const newCandle = {
          date: new Date().toLocaleDateString(),
          open: lastCandle.close,
          close: lastCandle.close * (1 + Math.random() * 0.02), // Bias towards upward movement
          high: lastCandle.close * (1 + Math.random() * 0.03),
          low: lastCandle.close * (1 - Math.random() * 0.01)
        };
        
        return [...prevData.slice(1), newCandle];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [data]);

  return (
    <Card className="w-full h-[600px]">
      <CardHeader>
        <CardTitle>Price Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={500}>
          <ComposedChart data={candleData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date"
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              domain={['auto', 'auto']}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border border-border p-2 rounded-lg shadow-lg">
                      <p className="text-sm font-medium">Date: {data.date}</p>
                      <p className="text-sm">Open: ${data.open.toFixed(2)}</p>
                      <p className="text-sm">Close: ${data.close.toFixed(2)}</p>
                      <p className="text-sm">High: ${data.high.toFixed(2)}</p>
                      <p className="text-sm">Low: ${data.low.toFixed(2)}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Candlestick
              yAxisId={0}
              stroke="#9945FF"
              fill="#9945FF"
              wickStroke="#9945FF"
              dataKey={{
                open: 'open',
                close: 'close',
                high: 'high',
                low: 'low'
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};