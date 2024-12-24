import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  ResponsiveContainer
} from 'recharts';

interface PriceChartProps {
  data: Array<{
    date: string;
    price: number;
  }>;
}

export const PriceChart = ({ data }: PriceChartProps) => {
  // Generate mock data if no data is provided
  const mockData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    price: Math.sin(i * 0.5) * 10 + 20 + Math.random() * 5
  }));

  const chartData = data.length > 0 ? data : mockData;

  return (
    <Card className="w-full h-[600px]">
      <CardHeader>
        <CardTitle>Price Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={500}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9945FF" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#9945FF" stopOpacity={0}/>
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
              stroke="rgba(153, 69, 255, 0.1)"
            />
            <XAxis 
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={false}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1C1C1C',
                border: '1px solid #9945FF',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#9945FF' }}
              itemStyle={{ color: '#9945FF' }}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#9945FF" 
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