import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TokenStatsProps {
  marketCap: number | null;
  volume24h: number | null;
  liquidity: number | null;
  usdMarketCap?: number | null;
}

export const TokenStats = ({ marketCap, volume24h, liquidity, usdMarketCap }: TokenStatsProps) => {
  const formatValue = (value: number | null): string => {
    if (value === null || isNaN(value)) {
      return "N/A";
    }

    // Format large numbers with appropriate suffixes
    if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
      return `$${(value / 1e3).toFixed(2)}K`;
    }
    
    return `$${value.toLocaleString()}`;
  };

  // Add detailed logging of the raw values
  console.log('Raw Market Cap:', marketCap);
  console.log('Raw USD Market Cap:', usdMarketCap);
  console.log('Raw Volume 24h:', volume24h);
  console.log('Raw Liquidity:', liquidity);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-400">Market Cap</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            {usdMarketCap ? formatValue(usdMarketCap) : formatValue(marketCap)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-400">24h Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            {formatValue(volume24h)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-400">Liquidity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            {formatValue(liquidity)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};