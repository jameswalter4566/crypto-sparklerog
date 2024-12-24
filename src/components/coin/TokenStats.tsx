/**
 * Displays key token stats (Market Cap, Volume, Liquidity) in a simple card layout.
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface TokenStatsProps {
  marketCap?: number | null;     // Pump.fun "market_cap" (likely in SOL)
  usdMarketCap?: number | null;  // Pump.fun "usd_market_cap"
  volume24h: number | null;
  liquidity: number | null;
}

export const TokenStats: React.FC<TokenStatsProps> = ({
  marketCap,
  usdMarketCap,
  volume24h,
  liquidity
}) => {
  console.log('TokenStats - Raw values:', {
    marketCap,
    usdMarketCap,
    volume24h,
    liquidity
  });

  const formatValue = (value: number | null, currency: string = 'USD'): string => {
    if (value === null || isNaN(value)) {
      return 'N/A';
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Market Cap in SOL */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-400">Market Cap (SOL)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            {formatValue(marketCap, 'USD')} 
            {/* If you prefer to keep the label "SOL", 
                you can do so, but the formatting here 
                is in USD, so adjust if you want something like:
                
                {marketCap ? `${marketCap.toFixed(2)} SOL` : 'N/A'} 
            */}
          </p>
        </CardContent>
      </Card>

      {/* Market Cap in USD */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-400">Market Cap (USD)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            {formatValue(usdMarketCap, 'USD')}
          </p>
        </CardContent>
      </Card>

      {/* Volume 24h */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-400">24h Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            {formatValue(volume24h, 'USD')}
          </p>
        </CardContent>
      </Card>

      {/* Liquidity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-400">Liquidity (SOL units?)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            {formatValue(liquidity, 'USD')} 
            {/* If this is actually in SOL, you might want a different formatting. */}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
