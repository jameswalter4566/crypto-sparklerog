/**
 * src/pages/CoinProfile.tsx
 *
 * This page fetches a single coin's data from your Supabase Edge Function (get-coin),
 * then displays it with various components like TokenStats. 
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TokenStats } from '@/components/coin/TokenStats';
// Import other components as needed, e.g. TokenHeader, TokenSupply, etc.

// Adjust if your deployed function has a different URL
const API_URL = 'https://fybgcaeoxptmmcwgslpl.supabase.co/functions/v1/get-coin';

const CoinProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [coin, setCoin] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCoinData = useCallback(async () => {
    if (!id) {
      setError('No coin ID provided.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching coin data for ID:', id);
      const response = await fetch(`${API_URL}?id=${id}`);
      if (!response.ok) {
        throw new Error(`Error fetching data (status ${response.status})`);
      }

      const result = await response.json();
      console.log('Received coin data from API:', result);

      setCoin(result);
    } catch (err) {
      console.error('Error fetching coin data:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCoinData();
  }, [fetchCoinData]);

  if (loading) {
    return <div>Loading coin data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!coin) {
    return <div>No coin data available.</div>;
  }

  // Example: You might have other components for a header or supply
  // <TokenHeader name={coin.name} symbol={coin.symbol} image={coin.image_url} />
  // <TokenSupply totalSupply={coin.total_supply} />

  return (
    <div className="p-6">
      {/* Example usage of TokenStats, passing in data from coin */}
      <TokenStats
        marketCap={coin.market_cap}
        usdMarketCap={coin.usd_market_cap}
        volume24h={coin.volume_24h}
        liquidity={coin.liquidity}
      />

      {/* Render other sections, charts, etc. */}
    </div>
  );
};

export default CoinProfile;
