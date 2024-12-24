/**
 * Front-end page to display the coin's data. It calls our Supabase function (get-coin)
 * by ID and renders it in TokenStats.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TokenStats } from '@/components/coin/TokenStats';
// (Import any other components you use, like TokenHeader, etc.)

// Adjust if your Supabase function endpoint is different
const API_URL = 'https://fybgcaeoxptmmcwgslpl.supabase.co/functions/v1/get-coin';

const CoinProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [coin, setCoin] = useState<any>(null); // or your CoinData type
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCoinData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching coin data for ID:', id);
      const response = await fetch(`${API_URL}?id=${id}`);

      if (!response.ok) {
        throw new Error(`Coin fetch failed with status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Received coin data from API:', result);

      setCoin(result);
    } catch (e: any) {
      console.error('Error fetching coin data:', e);
      setError(e.message || 'Unknown error');
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

  if (error || !coin) {
    return <div>Error: {error || 'Could not load coin data.'}</div>;
  }

  return (
    <div className="p-6">
      {/* Example: If you have a header, you could pass coin.name, coin.symbol, etc. */}
      {/* <TokenHeader name={coin.name} symbol={coin.symbol} image_url={coin.image_url} /> */}

      <TokenStats
        marketCap={coin.market_cap}       // SOL-based market cap
        usdMarketCap={coin.usd_market_cap} // USD-based market cap
        volume24h={coin.volume_24h}
        liquidity={coin.liquidity}
      />

      {/* Render any other components like supply, charts, etc. */}
    </div>
  );
};

export default CoinProfile;
