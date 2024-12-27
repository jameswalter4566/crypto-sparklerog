import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import { format } from "date-fns";

interface PriceChartProps {
  data: Array<{
    date: string;
    price: number;
  }>;
  coinId: string;
  coingeckoId?: string | null;
}

export const PriceChart = ({ data, coingeckoId }: PriceChartProps) => {
  // If we have historic data, use it
  if (data && data.length > 0) {
    const chartData = data.map(item => ({
      date: format(new Date(item.date), 'MMM d, yyyy'),
      price: item.price
    }));

    return (
      <Card className="w-full h-[600px]">
        <CardHeader>
          <CardTitle>Price Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            className="h-[500px]"
            config={{
              price: {
                theme: {
                  light: "rgba(234, 88, 12, 0.3)",
                  dark: "rgba(234, 88, 12, 0.3)",
                },
              },
              stroke: {
                theme: {
                  light: "rgb(234, 88, 12)",
                  dark: "rgb(234, 88, 12)",
                },
              },
            }}
          >
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(234, 88, 12)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="rgb(234, 88, 12)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'currentColor' }}
                tickMargin={10}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'currentColor' }}
                tickMargin={10}
                tickFormatter={(value) => `$${value.toFixed(4)}`}
              />
              <ChartTooltip />
              <Area
                type="monotone"
                dataKey="price"
                stroke="rgb(234, 88, 12)"
                fill="url(#gradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  }

  // Fallback to CoinGecko widget if we have a coingeckoId
  if (coingeckoId) {
    return (
      <Card className="w-full h-[600px]">
        <CardHeader>
          <CardTitle>Price Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            style={{ height: '500px' }}
            dangerouslySetInnerHTML={{
              __html: `
                <coingecko-coin-compare-chart-widget
                  coin-ids="${coingeckoId}"
                  currency="usd"
                  height="500"
                  locale="en"
                  background-color="#000000"
                  text-color="#FFFFFF"
                ></coingecko-coin-compare-chart-widget>
                <script src="https://widgets.coingecko.com/coingecko-coin-compare-chart-widget.js" id="coingecko-widget-script"></script>
              `
            }}
          />
        </CardContent>
      </Card>
    );
  }

  // Show placeholder if no data available
  return (
    <Card className="w-full h-[600px]">
      <CardHeader>
        <CardTitle>Price Chart</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-[500px] text-muted-foreground">
        No price data available for this token
      </CardContent>
    </Card>
  );
};