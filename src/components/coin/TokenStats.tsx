import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightning } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface TokenStatsProps {
  marketCap?: number | null;
  usdMarketCap?: number | null;
  volume24h: number | null;
  liquidity: number | null;
}

export const TokenStats = ({ marketCap, usdMarketCap, volume24h, liquidity }: TokenStatsProps) => {
  const [isFlashing, setIsFlashing] = useState(false);
  const prevMarketCapRef = useRef(marketCap);
  const prevUsdMarketCapRef = useRef(usdMarketCap);
  const [showLightning, setShowLightning] = useState(false);

  useEffect(() => {
    if (marketCap !== prevMarketCapRef.current || usdMarketCap !== prevUsdMarketCapRef.current) {
      setIsFlashing(true);
      setShowLightning(true);
      
      // Reset flash animation after 1 second
      const flashTimer = setTimeout(() => {
        setIsFlashing(false);
      }, 1000);

      // Hide lightning icon after 1.5 seconds
      const lightningTimer = setTimeout(() => {
        setShowLightning(false);
      }, 1500);

      prevMarketCapRef.current = marketCap;
      prevUsdMarketCapRef.current = usdMarketCap;

      return () => {
        clearTimeout(flashTimer);
        clearTimeout(lightningTimer);
      };
    }
  }, [marketCap, usdMarketCap]);

  const formatValue = (value: number | null): string => {
    if (value === null || isNaN(value)) {
      return "N/A";
    }

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    if (value >= 1e9) {
      return formatter.format(value / 1e9) + 'B';
    } else if (value >= 1e6) {
      return formatter.format(value / 1e6) + 'M';
    } else if (value >= 1e3) {
      return formatter.format(value / 1e3) + 'K';
    }
    
    return formatter.format(value);
  };

  console.log('TokenStats - Raw values:', {
    marketCap,
    usdMarketCap,
    volume24h,
    liquidity
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-400">Market Cap (SOL)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`flex items-center gap-2 transition-all ${isFlashing ? 'animate-flash-yellow rounded-md p-2' : 'p-2'}`}>
            <p className="text-xl font-bold">
              {formatValue(marketCap)}
            </p>
            {showLightning && (
              <Lightning className="h-5 w-5 text-yellow-500 animate-fade-in" />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-400">Market Cap (USD)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`flex items-center gap-2 transition-all ${isFlashing ? 'animate-flash-yellow rounded-md p-2' : 'p-2'}`}>
            <p className="text-xl font-bold">
              {formatValue(usdMarketCap)}
            </p>
            {showLightning && (
              <Lightning className="h-5 w-5 text-yellow-500 animate-fade-in" />
            )}
          </div>
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