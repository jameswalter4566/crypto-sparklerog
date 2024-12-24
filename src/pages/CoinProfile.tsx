import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TokenDetails } from "@/components/coin/TokenDetails";
import { useToast } from "@/hooks/use-toast";

const CoinProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [coin, setCoin] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const API_URL = 'https://fybgcaeoxptmmcwgslpl.supabase.co/functions/v1/get-coin';

  const fetchCoinData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}?id=${id}`);
      if (!response.ok) throw new Error('Failed to fetch coin data.');

      const result = await response.json();
      console.log('Received coin data:', result);

      const coinData = {
        id: result.id,
        name: result.name,
        symbol: result.symbol,
        image: result.image_url,
        price: result.price,
        description: result.description,
        tokenStandard: 'SPL',
        decimals: result.decimals,
        usdMarketCap: result.usd_market_cap,
        volume24h: result.volume_24h,
        liquidity: result.liquidity,
        solanaAddr: result.solana_addr,
        supply: {
          total: result.total_supply,
          circulating: result.circulating_supply,
          nonCirculating: result.non_circulating_supply,
        },
      };

      console.log('Mapped Coin Data:', coinData);
      setCoin(coinData);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load coin data.');
      toast({
        title: "Error",
        description: "Failed to load coin data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchCoinData();
  }, [fetchCoinData]);

  if (loading) return <Skeleton />;

  if (error || !coin) return <div>Error loading coin data.</div>;

  return <TokenDetails coinData={coin} onClick={() => {}} />;
};

export default CoinProfile;
