import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from 'react';

interface PriceChartProps {
  data: Array<{
    date: string;
    price: number;
  }>;
  coinId: string;
  coingeckoId?: string | null;
}

export const PriceChart = ({ coingeckoId }: PriceChartProps) => {
  useEffect(() => {
    // Cleanup any existing chart widgets when component unmounts
    return () => {
      const existingScript = document.getElementById('coingecko-widget-script');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [coingeckoId]);

  if (!coingeckoId) {
    return (
      <Card className="w-full h-[600px]">
        <CardHeader>
          <CardTitle>Price Chart</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[500px] text-muted-foreground">
          No CoinGecko data available for this token
        </CardContent>
      </Card>
    );
  }

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
};