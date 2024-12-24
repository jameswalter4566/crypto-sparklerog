import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TokenStatsProps {
  marketCap?: number | null;
  usdMarketCap?: number | null;
  volume24h: number | null;
  liquidity: number | null;
}

export const TokenStats = ({ marketCap, usdMarketCap, volume24h, liquidity }: TokenStatsProps) => {
  const formatValue = (value: number | null): string => {
    if (value === null || isNaN(value)) {
      return "N/A";
    }

    // Format with proper decimal places and commas
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    // Format large numbers with appropriate suffixes
    if (value >= 1e9) {
      return formatter.format(value / 1e9) + 'B';
    } else if (value >= 1e6) {
      return formatter.format(value / 1e6) + 'M';
    } else if (value >= 1e3) {
      return formatter.format(value / 1e3) + 'K';
    }
    
    return formatter.format(value);
  };

  // Add detailed logging of the raw values
  console.log('TokenStats - Raw values:', {
    marketCap,
    usdMarketCap,
    volume24h,
    liquidity
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-400">Market Cap (USD)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            {formatValue(usdMarketCap || marketCap)}
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