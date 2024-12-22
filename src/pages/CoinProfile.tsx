import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CandlestickChart, Users, Shuffle } from "lucide-react";
import { TokenHeader } from "@/components/coin/TokenHeader";
import { TokenStats } from "@/components/coin/TokenStats";
import { TokenSupply } from "@/components/coin/TokenSupply";
import { PriceChart } from "@/components/coin/PriceChart";
import { VoiceChat } from "@/components/coin/VoiceChat";
import { SwapInterface } from "@/components/SwapInterface";

// import { mockCoins } from "@/data/mockCoins";
// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

const CoinProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [coin, setCoin] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = 'https://fybgcaeoxptmmcwgslpl.supabase.co/functions/v1/get-coin'; // Replace with your actual function URL

  // Define the fetch function using useCallback to prevent unnecessary re-renders
  const fetchCoinData = useCallback(async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetch(`${API_URL}?id=${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Token not found.');
        } else {
          setError('Failed to fetch coin data.');
        }
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const result = await response.json();
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setCoin(result.data);
      } else {
        setError('No data received.');
      }
    } catch (err) {
      console.error('Error fetching coin data:', err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [API_URL, id]);

  // Fetch data on component mount and when 'id' changes
  useEffect(() => {
    fetchCoinData();
  }, [fetchCoinData]);

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton className="h-12 w-24 mb-4" />
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-4" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-48 w-full mb-4" />
        <Skeleton className="h-12 w-32" />
      </div>
    );
  }

  if (!coin) {
    return (
      <div className="p-6 flex flex-col items-center justify-center">
        <CandlestickChart className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Token not found</h2>
        <p className="text-muted-foreground">The requested token data could not be loaded.</p>
      </div>
    );
  }

  // Process historic_data for PriceChart
  let priceData = [];
  if (coin.historic_data && Array.isArray(coin.historic_data)) {
    priceData = coin.historic_data.map(([timestamp, price]: [number, number]) => ({
      date: new Date(timestamp).toLocaleDateString(),
      price,
    }));
  } else {
    // Fallback mock data or empty
    priceData = [];
  }

  // const mockTransactions = [
  //   { type: 'Buy', price: '$0.287', total: '$1.07', amount: '37K', maker: '9zf...juM' },
  //   { type: 'Sell', price: '$0.287', total: '$54.72', amount: '1.9M', maker: '2Ux...y5X' },
  //   { type: 'Buy', price: '$0.288', total: '$75.03', amount: '2.6M', maker: '8gz...zjs' },
  // ];

  // const mockHolders = [
  //   { wallet: '5Q544f...e4j1', percentage: '40.30%', amount: '403M', value: '$9K' },
  //   { wallet: '8Z3XuS...rBpb', percentage: '3.61%', amount: '36M', value: '$898.29' },
  //   { wallet: 'DUNW9G...6nhr', percentage: '2.80%', amount: '28M', value: '$695.93' },
  // ];

  return (
    <div className="p-6">
      <TokenHeader
        name={coin.name}
        symbol={coin.symbol}
        image={coin.image_url || null}
        price={coin.price}
        description={coin.description}
        tokenStandard={null}
        decimals={coin.decimals || null}
        updatedAt={coin.updated_at}
        onRefresh={() => fetchCoinData(true)}
        refreshing={refreshing}
        solanaAddr={coin.mintAddress}
      />
      
      <TokenStats
        marketCap={coin.market_cap || null}
        volume24h={coin.volume_24h || null}
        liquidity={coin.liquidity || null}
      />

      <TokenSupply
        total={coin.total_supply || null}
        circulating={coin.circulating_supply || null}
        nonCirculating={coin.non_circulating_supply || null}
      />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-6">
        <PriceChart data={priceData} />
        <SwapInterface defaultTokenAddress={coin.mintAddress} />
      </div>

      {/* <div className="flex gap-4 mt-6 justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="flex-1 max-w-[200px]"
            >
              <Shuffle className="mr-2" />
              Transactions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[600px] bg-card" side="bottom" align="start">
            <div className="p-2">
              <div className="grid grid-cols-5 gap-4 text-sm text-muted-foreground mb-2 px-2">
                <div>Type</div>
                <div>Price USD</div>
                <div>Total USD</div>
                <div>Amount</div>
                <div>Maker</div>
              </div>
              {mockTransactions.map((tx, i) => (
                <DropdownMenuItem key={i} className="grid grid-cols-5 gap-4 cursor-pointer">
                  <div className={tx.type === 'Buy' ? 'text-green-500' : 'text-red-500'}>{tx.type}</div>
                  <div>{tx.price}</div>
                  <div>{tx.total}</div>
                  <div>{tx.amount}</div>
                  <div>{tx.maker}</div>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="flex-1 max-w-[200px]"
            >
              <Users className="mr-2" />
              Holders (351)
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[600px] bg-card" side="bottom" align="start">
            <div className="p-2">
              <div className="grid grid-cols-4 gap-4 text-sm text-muted-foreground mb-2 px-2">
                <div>Wallet</div>
                <div>% Owned</div>
                <div>Amount</div>
                <div>Value</div>
              </div>
              {mockHolders.map((holder, i) => (
                <DropdownMenuItem key={i} className="grid grid-cols-4 gap-4 cursor-pointer">
                  <div>{holder.wallet}</div>
                  <div>{holder.percentage}</div>
                  <div>{holder.amount}</div>
                  <div>{holder.value}</div>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div> */}

      <VoiceChat coinId={coin.id} />
    </div>
  );
};

export default CoinProfile;
