import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Scatter
} from 'recharts';

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
        low,
        // Adding coordinates for scatter plot to represent candles
        openPoint: { x: i, y: open },
        closePoint: { x: i, y: close },
        highPoint: { x: i, y: high },
        lowPoint: { x: i, y: low }
      };
    });

    setCandleData(initialData);

    // Update candlestick data every 2 seconds with upward trend
    const interval = setInterval(() => {
      setCandleData(prevData => {
        const lastCandle = prevData[prevData.length - 1];
        const newIndex = prevData.length;
        const open = lastCandle.close;
        const close = open * (1 + Math.random() * 0.02); // Bias towards upward movement
        const high = Math.max(open, close) * (1 + Math.random() * 0.01);
        const low = Math.min(open, close) * (1 - Math.random() * 0.01);
        
        const newCandle = {
          date: new Date().toLocaleDateString(),
          open,
          close,
          high,
          low,
          openPoint: { x: newIndex, y: open },
          closePoint: { x: newIndex, y: close },
          highPoint: { x: newIndex, y: high },
          lowPoint: { x: newIndex, y: low }
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
            {/* Render candles using scatter plots */}
            <Scatter
              data={candleData}
              fill="#9945FF"
              line={{ stroke: '#9945FF' }}
              shape={(props: any) => {
                const { cx, cy, payload } = props;
                const candleHeight = Math.abs(payload.close - payload.open) * 100;
                const wickHeight = Math.abs(payload.high - payload.low) * 100;
                
                return (
                  <g>
                    {/* Wick */}
                    <line
                      x1={cx}
                      y1={cy - wickHeight / 2}
                      x2={cx}
                      y2={cy + wickHeight / 2}
                      stroke="#9945FF"
                      strokeWidth={1}
                    />
                    {/* Candle body */}
                    <rect
                      x={cx - 5}
                      y={cy - candleHeight / 2}
                      width={10}
                      height={candleHeight}
                      fill={payload.close > payload.open ? '#9945FF' : '#9945FF'}
                      stroke="#9945FF"
                    />
                  </g>
                );
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};