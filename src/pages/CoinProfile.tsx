import { useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { CandlestickChart, Users, Mic, Shuffle } from "lucide-react";
import { TokenHeader } from "@/components/coin/TokenHeader";
import { TokenStats } from "@/components/coin/TokenStats";
import { TokenSupply } from "@/components/coin/TokenSupply";
import { PriceChart } from "@/components/coin/PriceChart";
import { Button } from "@/components/ui/button";
import { VoiceChat } from "@/components/coin/VoiceChat";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockCoins } from "@/data/mockCoins";
import { useState } from "react";

const CoinProfile = () => {
  const { id } = useParams();
  const coin = mockCoins.find(c => c.id === id);
  const [isJoined, setIsJoined] = useState(false);

  if (!coin) {
    return (
      <div className="p-6 flex flex-col items-center justify-center">
        <CandlestickChart className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Token not found</h2>
        <p className="text-muted-foreground">The requested token data could not be loaded.</p>
      </div>
    );
  }

  // Generate mock price data for the chart
  const priceData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    price: coin.price * (1 + Math.sin(i / 5) * 0.1),
  }));

  const mockTransactions = [
    { type: 'Buy', price: '$0.287', total: '$1.07', amount: '37K', maker: '9zf...juM' },
    { type: 'Sell', price: '$0.287', total: '$54.72', amount: '1.9M', maker: '2Ux...y5X' },
    { type: 'Buy', price: '$0.288', total: '$75.03', amount: '2.6M', maker: '8gz...zjs' },
  ];

  const mockHolders = [
    { wallet: '5Q544f...e4j1', percentage: '40.30%', amount: '403M', value: '$9K' },
    { wallet: '8Z3XuS...rBpb', percentage: '3.61%', amount: '36M', value: '$898.29' },
    { wallet: 'DUNW9G...6nhr', percentage: '2.80%', amount: '28M', value: '$695.93' },
  ];

  return (
    <div className="p-6">
      <TokenHeader
        name={coin.name}
        symbol={coin.symbol}
        image={coin.imageUrl || null}
        price={coin.price}
        description={null}
        tokenStandard={null}
        decimals={null}
      />
      
      <TokenStats
        marketCap={coin.market_cap || null}
        volume24h={coin.volume_24h || null}
        liquidity={coin.liquidity || null}
      />

      <TokenSupply
        total={coin.supply || null}
        circulating={coin.supply || null}
        nonCirculating={0}
      />

      <PriceChart data={priceData} />

      <div className="flex gap-4 mt-6 justify-center">
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

        <Button 
          variant="outline" 
          className="flex-1 max-w-[200px]"
          onClick={() => setIsJoined(!isJoined)}
        >
          <Mic className="mr-2" />
          {isJoined ? "Leave Voice Chat" : "Join Voice Chat"}
        </Button>
      </div>

      <VoiceChat />
    </div>
  );
};

export default CoinProfile;