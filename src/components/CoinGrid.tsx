import { NewCoinCard } from "./NewCoinCard";
import { CoinGridHeader } from "./coin/CoinGridHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CoinGridProps {
  title?: string;
  coins?: Array<{
    id: string;
    name: string;
    symbol: string;
    price: number;
    change_24h: number;
    imageUrl: string;
    mintAddress: string;
    priceHistory: any;
    usdMarketCap: number;
  }>;
  isLoading?: boolean;
}

interface PriceHistoryItem {
  price: number;
  timestamp: string;
}

interface HistoricDataItem {
  price: number;
  timestamp: string;
}

interface CoinQueryResult {
  coin_id: string;
  search_count: number;
  coins: {
    id: string;
    name: string;
    symbol: string;
    price: number;
    change_24h: number;
    image_url: string | null;
    solana_addr: string | null;
    historic_data: Array<{ price: number; timestamp: string }> | null;
    market_cap: number | null;
    usd_market_cap: number | null;
  } | null;
}

export function CoinGrid({ title = "Trending Coins", coins: propCoins, isLoading: propIsLoading }: CoinGridProps) {
  const { data: fetchedCoins, isLoading: queryIsLoading } = useQuery({
    queryKey: ['trending-coins'],
    queryFn: async () => {
      if (propCoins) {
        console.log('[CoinGrid] Using prop coins, skipping fetch');
        return null;
      }
      
      console.log('[CoinGrid] Fetching trending coins');
      
      // First get the trending coins from Supabase
      const { data: trendingCoins, error } = await supabase
        .from('coin_searches')
        .select(`
          coin_id,
          search_count,
          coins (
            id,
            name,
            symbol,
            price,
            change_24h,
            image_url,
            solana_addr,
            historic_data,
            market_cap,
            usd_market_cap
          )
        `)
        .order('search_count', { ascending: false })
        .limit(30);

      if (error) {
        console.error('[CoinGrid] Error fetching trending coins:', error);
        throw error;
      }

      // For each coin, fetch fresh data from pump.fun
      const updatedCoins = await Promise.all(
        trendingCoins.map(async (trend) => {
          if (!trend.coins?.solana_addr) {
            console.log(`[CoinGrid] No solana address for coin ${trend.coin_id}, skipping refresh`);
            return trend;
          }

          try {
            const response = await fetch('https://frontend-api-v2.pump.fun/coins', {
              headers: {
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Origin': 'https://pump.fun',
                'Referer': 'https://pump.fun/',
              },
            });

            if (!response.ok) {
              console.error(`[CoinGrid] Error fetching from Pump API for ${trend.coin_id}: ${response.status}`);
              return trend;
            }

            const data = await response.json();
            const coinData = data.find((item: any) => item.mint === trend.coins?.solana_addr);

            if (coinData) {
              // Calculate new price and update the coin data
              const priceInSol = coinData.virtual_sol_reserves && coinData.virtual_token_reserves
                ? (coinData.virtual_sol_reserves / 1e9) / (coinData.virtual_token_reserves / 1e9)
                : null;

              // Update the coin in Supabase with fresh data
              await supabase
                .from('coins')
                .update({
                  price: priceInSol,
                  market_cap: coinData.market_cap,
                  usd_market_cap: coinData.usd_market_cap,
                  updated_at: new Date().toISOString()
                })
                .eq('id', trend.coin_id);

              // Update the trend object with fresh data
              return {
                ...trend,
                coins: {
                  ...trend.coins,
                  price: priceInSol,
                  market_cap: coinData.market_cap,
                  usd_market_cap: coinData.usd_market_cap
                }
              };
            }
          } catch (err) {
            console.error(`[CoinGrid] Error processing coin ${trend.coin_id}:`, err);
          }
          return trend;
        })
      );

      console.log('[CoinGrid] Received trending coins:', updatedCoins);

      return updatedCoins.map(trend => {
        if (!trend.coins) {
          console.error('[CoinGrid] Missing coins data for trend:', trend);
          return null;
        }

        let priceHistory: PriceHistoryItem[] | null = null;
        
        try {
          if (trend.coins.historic_data) {
            // First cast to unknown, then to our expected type
            const historyData = trend.coins.historic_data as unknown as Array<{
              price: number | string;
              timestamp: string | number;
            }>;
            
            if (Array.isArray(historyData)) {
              priceHistory = historyData.map(item => ({
                price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
                timestamp: typeof item.timestamp === 'number' 
                  ? new Date(item.timestamp).toISOString() 
                  : String(item.timestamp)
              }));
            }
          }
        } catch (err) {
          console.error('[CoinGrid] Error parsing historic data:', err);
          priceHistory = null;
        }

        return {
          ...trend.coins,
          searchCount: trend.search_count,
          priceHistory,
          marketCap: trend.coins.market_cap,
          usdMarketCap: trend.coins.usd_market_cap
        };
      }).filter(Boolean);
    },
    refetchInterval: propCoins ? false : 5000, // Refetch every 5 seconds if we're not using prop coins
    gcTime: Infinity,
    staleTime: 0,
    enabled: !propCoins, // Only enable the query if we don't have prop coins
  });

  const isLoadingData = propIsLoading ?? queryIsLoading;
  const displayCoins = propCoins ?? fetchedCoins;

  if (isLoadingData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-3 sm:space-y-5 px-2">
      <CoinGridHeader title={title} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {displayCoins?.map((coin) => {
          const validPrice = typeof coin.price === "number" && !isNaN(coin.price) ? coin.price : null;
          const validChange24h = typeof coin.change_24h === "number" && !isNaN(coin.change_24h) ? coin.change_24h : null;

          return (
            <NewCoinCard
              key={coin.id}
              id={coin.id}
              name={coin.name || "Unknown Coin"}
              symbol={coin.symbol || "N/A"}
              price={validPrice}
              change24h={validChange24h}
              imageUrl={coin.image_url || "/placeholder.svg"}
              mintAddress={coin.solana_addr || ""}
              searchCount={coin.searchCount}
              priceHistory={coin.priceHistory}
              usdMarketCap={coin.usdMarketCap}
            />
          );
        })}
      </div>
    </div>
  );
}