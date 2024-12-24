/**
 * src/components/coin/TokenStats.tsx
 *
 * Displays various stats like Market Cap (SOL), Market Cap (USD),
 * 24h Volume, and Liquidity in a simple card-based layout.
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface TokenStatsProps {
  marketCap?: number | null;
  usdMarketCap?: number | null;
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

  const formatValue = (value: number | null): string => {
    if (value === null || isNaN(value)) {
      return 'N/A';
    }

    // Format as USD currency
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Market Cap (SOL) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-400">Market Cap (SOL)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            {formatValue(marketCap)}
          </p>
        </CardContent>
      </Card>

      {/* Market Cap (USD) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-400">Market Cap (USD)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            {formatValue(usdMarketCap)}
          </p>
        </CardContent>
      </Card>

      {/* 24h Volume */}
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

      {/* Liquidity */}
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
