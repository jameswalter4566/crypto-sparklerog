import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MiniPriceChartProps {
  data: Array<{
    price: number;
    timestamp: string;
  }> | null;
}

export const MiniPriceChart = ({ data }: MiniPriceChartProps) => {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="h-24 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9945FF" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#9945FF" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Line
            type="monotone"
            dataKey="price"
            stroke="#9945FF"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};